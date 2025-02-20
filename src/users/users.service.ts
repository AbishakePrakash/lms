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
        returnData.message = 'Mail sent successfully';
        returnData.value = data;
        // returnData.value = parseInt(status);
      }
    } catch (error) {
      console.log('Error sending mail: ', error);
      throw new Error('Mail sending failed');
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
    const sender = '"HaloQuant " <no-reply@haloquant.com>';
    const saltRounds = process.env.SALT_ROUNDS;
    const currentDate = new Date();
    const formattedDate = currentDate.toLocaleDateString('en-US', {
      month: 'short', // "Feb"
      day: '2-digit', // "12"
      year: 'numeric', // "2025"
    });

    // console.log({ saltRounds });
    const otp = this.generateSixDigitNumber();

    const otpData: OtpDto = {
      userId: 11,
      email: createUserDto.email,
      otp: otp,
      service: 'VerifyAccount',
    };

    createUserDto.isActive = false;

    //Check duplicate
    const duplicate = await this.usersRepo.findOneBy({
      email: createUserDto.email,
    });

    if (duplicate) {
      throw new BadRequestException('Email already exists');
    }

    await bcrypt
      .hash(createUserDto.password, parseInt(saltRounds))
      .then((data) => {
        createUserDto.password = data;
      });

    try {
      const data = await this.usersRepo.save(createUserDto);
      if (!data) {
        throw new InternalServerErrorException('User creating process failed');
      }
      const { password, ...user } = data;

      const otpData: OtpDto = {
        userId: user.id || 11,
        email: createUserDto.email,
        otp: otp,
        service: 'VerifyAccount',
      };

      try {
        const verify = await this.otpService.saveOtp(otpData);
        if (!verify) {
          throw new InternalServerErrorException('OTP saving failed');
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
          throw new InternalServerErrorException("OTP didn't sent to user");
        }
      } catch (error) {
        console.log({ error });
      }

      returnData.message = 'User created Successfully';
      returnData.value = user;
    } catch (error) {
      console.log({ error });
    }

    return returnData;
  }

  async uploadFile(file: Express.Multer.File, user: Users) {
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
        throw new InternalServerErrorException('No url returned from S3');
      }
      console.log('File uploaded:', s3Url);

      const updateProfile = await this.usersRepo.update(user.id, {
        profilePicture: s3Url,
      });

      return { ...updateProfile, s3Url: s3Url };
    } catch (error) {
      console.error('Error uploading file:', error.message);
      return 'File upload failed!';
    }
  }

  async setAsActive(payload: VerifyAccountPayload) {
    const returnData = new ReturnData();
    const user = await this.findOneByEmail(payload.email);
    const verifyOtp = await this.otpService.verifyAccount(payload);
    if (!verifyOtp) {
      throw new UnauthorizedException('Incorrect OTP');
    }

    // Update status
    const updateUser = await this.update(user.id, { isActive: true });

    // Clear OTP's
    const clearOtp = await this.otpService.remove(
      payload.email,
      'VerifyAccount',
    );

    returnData.message = 'User verified successfully';
    returnData.value = user.email;
    return returnData;
  }

  async assign(id: number) {
    const updateUserDto: UpdateUserDto = { role: 'Instructor' };

    const verifyUser = await this.findOne(id);

    // Add more conditions to filter high level students

    if (!verifyUser.isActive || verifyUser.role !== 'Student') {
      throw new ForbiddenException('User not allowed to promote as Instructor');
    }

    try {
      const assignUser = await this.usersRepo.update(id, updateUserDto);
      if (!assignUser) {
        throw new MisdirectedException('Promotion failed');
      }
      return assignUser;
    } catch (error) {
      console.log({ error });

      throw error;
    }
  }

  async findAll() {
    const returnData = new ReturnData();
    const data = await this.usersRepo.find({
      select: [
        'id',
        'username',
        'email',
        'age',
        'isActive',
        'phone',
        'role',
        'createdAt',
        'updatedAt',
        'profilePicture',
      ],
    });
    if (data.length === 0) {
      throw new NotFoundException('No users found');
    }

    returnData.message = 'Users fetched successfully';
    returnData.value = data;
    return returnData;
  }

  async findOne(id: number) {
    try {
      const user = await this.usersRepo.findOneBy({ id });
      if (!user) {
        throw new NotFoundException('No user found for this userId');
      }
      return user;
    } catch (error) {
      throw error;
    }
  }

  async findOneByEmail(email: string) {
    const user = await this.usersRepo.findOneBy({ email });
    // console.log(user);
    // console.log(typeof user);

    return user;
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const returnData = new ReturnData();
    const data = await this.usersRepo.update(id, updateUserDto);
    returnData.message = 'User updated successfully';
    returnData.value = { modifiedRows: data.affected };
    return returnData;
  }

  async remove(id: number) {
    const returnData = new ReturnData();
    const data = await this.usersRepo.delete({ id });
    returnData.message = 'User deleted successfully';
    returnData.value = { modifiedRows: data.affected };
    return returnData;
  }
}
