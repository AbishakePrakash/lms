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

import { Inject, Injectable } from '@nestjs/common';
import { Otp } from 'src/otp/entities/otp.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(Users)
    private readonly usersRepo: Repository<Users>,
    @Inject(OtpService)
    private readonly otpService: OtpService,
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

  async createV2(createUserDto: CreateUserDto): Promise<ReturnData> {
    return new Promise(async (resolve) => {
      var userRepository = this.usersRepo;
      var otpServiceX = this.otpService;
      var otpGen = this.generateSixDigitNumber;
      var triggerMail = this.sendMail;

      const saltRounds = process.env.SALT_ROUNDS;
      console.log({ saltRounds });

      const mailData = new MailData();
      const currentDate = new Date();

      // Check Inputs
      async function checkInputs(createUserDto: CreateUserDto) {
        if (
          createUserDto.email !== undefined &&
          createUserDto.password !== undefined
        ) {
          // Hashing Password
          await bcrypt
            .hash(createUserDto.password, parseInt(saltRounds))
            .then((data) => {
              createUserDto.password = data;
            });
          return createUserDto;
        } else {
          throw 'Missing Inputs';
        }
      }

      // Check Duplication
      async function checkDuplication(email: string) {
        const duplicate = await userRepository.findOneBy({
          email: createUserDto.email,
        });

        if (duplicate) {
          throw 'Email already exists';
        } else {
          return email;
        }
      }

      // Create User
      async function createUser(createUserDto: CreateUserDto) {
        const user = await userRepository.save(createUserDto);
        if (!user) {
          throw 'Creating User failed';
        } else {
          return user;
        }
      }

      // Create and Save OTP
      async function deliverOtp(user: Users) {
        const otpData: OtpDto = {
          userId: user.id,
          email: user.email,
          otp: otpGen(),
          service: 'VerifyAccount',
        };
        const createdOtp = await otpServiceX.saveOtp(otpData);
        if (createdOtp) {
          return createdOtp;
        } else {
          throw 'Otp not saved';
        }
      }

      // Send Mail
      async function sendEmail(otpResponse: Otp, user: Users) {
        const sender = process.env.HQ_SENDER;
        const formattedDate = currentDate.toLocaleDateString('en-US', {
          month: 'short',
          day: '2-digit',
          year: 'numeric',
        });

        const mailContents: MailContents = {
          date: formattedDate,
          username: user.username || 'User',
          task: 'verify your Account',
          validity: '5 minutes',
          otp: otpResponse.otp,
        };

        // Structuring Mail
        mailData.from = sender;
        mailData.to = user.email;
        mailData.subject = 'Verify Account';
        mailData.html = emailTemplate(mailContents);

        const mailResponse = await triggerMail(mailData);
        if (!mailResponse.error) {
          return mailResponse;
        } else {
          throw 'Mail sending failed';
        }
      }

      try {
        const checkedInputs = await checkInputs(createUserDto);
        const checkDuplicationRes = await checkDuplication(checkedInputs.email);
        const newUser = await createUser(checkedInputs);
        const savedOtp = await deliverOtp(newUser);
        const emailResponse = await sendEmail(savedOtp, newUser);

        resolve({
          error: false,
          value: { email: newUser.email, redirectTo: 'VerificationPage' },
          message: 'Success',
        });
      } catch (error) {
        console.log({ error });
        resolve({ error: true, value: null, message: error });
      }
    });
  }

  async uploadFile(file: Express.Multer.File, user: Users) {
    const returnData = new ReturnData();
    const path = process.env.AWS_BUCKET_PATH;

    try {
      const { buffer, originalname, mimetype } = file;

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
    }

    try {
      const assignUser = await this.usersRepo.update(id, updateUserDto);
      if (!assignUser) {
        returnData.error = true;
        returnData.message = 'Promotion failed';
        return returnData;
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
