import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Users } from './entities/user.entity';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { OtpService } from 'src/otp/otp.service';
import { OtpDto } from 'src/otp/dto/create-otp.dto';
import { VerifyAccountPayload } from 'src/otp/dto/verifyAccount.dto';
import {
  emailTemplate,
  MailContents,
  MailData,
  ReturnData,
} from 'src/utils/globalValues';
import triggerMaileEvent from 'src/utils/nodeMailer';
import { uploadToS3 } from 'src/utils/awsBucket';

import * as fs from 'fs';
import * as path from 'path';
import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  InternalServerErrorException,
  MisdirectedException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(Users)
    private readonly usersRepo: Repository<Users>,
    @Inject(OtpService)
    private readonly otpService: OtpService,
    // @Inject(WalletService)
    // private readonly walletService: WalletService,
  ) {}

  async sendMail(mailData: MailData) {
    const returnData = new ReturnData();
    try {
      const data = await triggerMaileEvent(mailData);
      const status = data.split(' ')[0];
      if (status === '250') {
        returnData.error = false;
        returnData.message = 'Success';
        returnData.value = data;
        // returnData.value = parseInt(status);
      }
    } catch (error) {
      console.log('Error sending mail: ', error);
      returnData.error = true;
      returnData.message = 'Mail sending failed';
      return returnData;
      // throw new Error('Mail sending failed');
    }
    return returnData;
  }

  generateSixDigitNumber() {
    const randomNum = Math.floor(Math.random() * 900000) + 100000;
    return randomNum;
  }

  async create(createUserDto: CreateUserDto) {
    const returnData = new ReturnData();
    const mailData = new MailData();
    createUserDto.isActive = false;
    const sender = process.env.HQ_SENDER;
    const saltRounds = process.env.SALT_ROUNDS;
    const currentDate = new Date();
    const formattedDate = currentDate.toLocaleDateString('en-US', {
      month: 'short', // "Feb"
      day: '2-digit', // "12"
      year: 'numeric', // "2025"
    });

    // console.log({ saltRounds });
    const otp = this.generateSixDigitNumber();

    //Check duplicate
    const duplicate = await this.usersRepo.findOneBy({
      email: createUserDto.email,
    });

    if (duplicate) {
      returnData.error = true;
      returnData.message = 'Email already exists';
      return returnData;
      // throw new BadRequestException('Email already exists');
    }

    await bcrypt
      .hash(createUserDto.password, parseInt(saltRounds))
      .then((data) => {
        createUserDto.password = data;
      });

    try {
      const data = await this.usersRepo.save(createUserDto);
      if (!data) {
        returnData.error = true;
        returnData.message = 'User creating process failed';
        return returnData;
        // throw new InternalServerErrorException('User creating process failed');
      }
      const { password, ...user } = data;

      const otpData: OtpDto = {
        userId: user.id,
        email: createUserDto.email,
        otp: otp,
        service: 'VerifyAccount',
      };

      try {
        const verify = await this.otpService.saveOtp(otpData);
        if (!verify) {
          returnData.error = true;
          returnData.message = 'OTP saving failed';
          return returnData;
          // throw new InternalServerErrorException('OTP saving failed');
        }
        try {
          const mailContents: MailContents = {
            date: formattedDate,
            username: createUserDto.username,
            task: 'verify your Account',
            validity: '5 minutes',
            otp: otp,
          };

          mailData.from = sender;
          mailData.to = createUserDto.email;
          mailData.subject = 'Verify Account';
          mailData.html = emailTemplate(mailContents);
          await this.sendMail(mailData);
        } catch (error) {
          console.log({ error });
          throw error;
          // throw new InternalServerErrorException("OTP didn't sent to user");
        }
      } catch (error) {
        console.log({ error });
      }
      returnData.error = false;
      returnData.message = 'Success';
      returnData.value = user;
      return returnData;
    } catch (error) {
      console.log({ error });
      throw error;
    }
  }

  async uploadFile(file: Express.Multer.File, user: Users) {
    const returnData = new ReturnData();
    const path = process.env.AWS_BUCKET_PATH;

    try {
      const { buffer, originalname, mimetype } = file;

      // console.log({
      //   buffer: buffer,
      //   originalname: originalname,
      //   mimetype: mimetype,
      // });

      const s3Url = await uploadToS3(
        buffer,
        originalname,
        mimetype,
        `${path}/profile`,
      );

      if (!s3Url) {
        returnData.error = true;
        returnData.message = 'No url returned from S3';
        return returnData;
        // throw new InternalServerErrorException('No url returned from S3');
      }
      console.log('File uploaded:', s3Url);

      const updateProfile = await this.usersRepo.update(user.id, {
        profilePicture: s3Url,
      });
      returnData.error = false;
      returnData.message = 'Success';
      returnData.value = { ...updateProfile, s3Url: s3Url };
      return returnData;
    } catch (error) {
      console.error('Error uploading file:', error.message);
      throw error;
    }
  }

  async setAsActive(payload: VerifyAccountPayload) {
    const returnData = new ReturnData();
    const user = await this.findOneByEmail(payload.email);
    if (!user) {
      returnData.error = true;
      returnData.message = 'No account registered with thie email Id';
      return returnData;
    }
    const verifyOtp = await this.otpService.verifyAccount(payload);
    if (!verifyOtp) {
      returnData.error = true;
      returnData.message = 'Incorrect OTP';
      return returnData;
      // throw new UnauthorizedException('Incorrect OTP');
    }

    // Update status
    await this.update(user.id, { isActive: true });

    // Clear OTP's
    await this.otpService.remove(payload.email, 'VerifyAccount');

    returnData.error = false;
    returnData.message = 'Success';
    returnData.value = user.email;
    return returnData;
  }

  async assign(id: number) {
    const returnData = new ReturnData();
    const updateUserDto: UpdateUserDto = { role: 'Instructor' };

    const verifyUser = await this.usersRepo.findOneBy({ id });

    // Add more conditions to filter high level students
    if (!verifyUser.isActive || verifyUser.role !== 'Student') {
      returnData.error = true;
      returnData.message = 'User not allowed to promote as Instructor';
      return returnData;
      // throw new ForbiddenException('User not allowed to promote as Instructor');
    }

    try {
      const assignUser = await this.usersRepo.update(id, updateUserDto);
      if (!assignUser) {
        returnData.error = true;
        returnData.message = 'Promotion failed';
        return returnData;
        // throw new MisdirectedException('Promotion failed');
      }
      returnData.error = false;
      returnData.message = 'Success';
      returnData.value = { updatedRows: assignUser.affected };
      return returnData;
    } catch (error) {
      console.log({ error });
      throw error;
    }
  }

  async findAll() {
    const returnData = new ReturnData();
    try {
      const data = await this.usersRepo.find();
      if (data.length === 0) {
        returnData.error = true;
        returnData.message = 'No users found';
        return returnData;
        // throw new NotFoundException('No users found');
      }
      returnData.error = false;
      returnData.message = 'Success';
      returnData.value = data;
      return returnData;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async findOne(id: number) {
    const returnData = new ReturnData();

    try {
      const user = await this.usersRepo.findOneBy({ id });
      if (!user) {
        returnData.error = true;
        returnData.message = 'No user found for this userId';
        return returnData;
        // throw new NotFoundException('No user found for this userId');
      }
      returnData.error = false;
      returnData.message = 'Success';
      returnData.value = user;
      return returnData;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  // helper
  async findOneByEmail(email: string) {
    const user = await this.usersRepo.findOne({
      where: { email },
      select: [
        'id',
        'username',
        'email',
        'password',
        'role',
        'isActive',
        'profilePicture',
      ],
    });
    return user;
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const returnData = new ReturnData();

    try {
      const data = await this.usersRepo.update(id, updateUserDto);

      if (data.affected === 0) {
        returnData.error = true;
        returnData.message = 'User update failed';
        return returnData;
        // throw new MisdirectedException('User update failed');
      }
      returnData.error = false;
      returnData.message = 'Success';
      returnData.value = { modifiedRows: data.affected };
      return returnData;
    } catch (error) {
      console.error('Error updating User:', error);
      throw error;
    }
  }

  async remove(id: number) {
    const returnData = new ReturnData();

    try {
      const data = await this.usersRepo.delete({ id });

      if (data.affected === 0) {
        returnData.error = true;
        returnData.message = 'User deletion failed';
        return returnData;
        // throw new MisdirectedException('User deletion failed');
      }
      returnData.error = false;
      returnData.message = 'Success';
      returnData.value = { modifiedRows: data.affected };
      return returnData;
    } catch (error) {
      console.error('Error deleting User:', error);
      throw error;
    }
  }
}
