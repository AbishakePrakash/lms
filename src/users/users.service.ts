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
import * as moment from 'moment';
import { performance } from 'perf_hooks';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(Users)
    private readonly usersRepo: Repository<Users>,
    @Inject(OtpService)
    private readonly otpService: OtpService,
  ) {}

  async createV2(createUserDto: CreateUserDto): Promise<ReturnData> {
    return new Promise(async (resolve) => {
      var userRepository = this.usersRepo;
      var otpServiceX = this.otpService;
      var otpGen = this.generateSixDigitNumber;
      var triggerMail = this.sendMail;

      const saltRounds = process.env.SALT_ROUNDS;

      const mailData = new MailData();
      const currentDate = new Date();

      // Check Inputs
      // async function checkInputs(createUserDto: CreateUserDto) {
      //   if (
      //     createUserDto.email !== undefined &&
      //     createUserDto.password !== undefined
      //   ) {
      //     // Hashing Password
      //     await bcrypt
      //       .hash(createUserDto.password, parseInt(saltRounds))
      //       .then((data) => {
      //         createUserDto.password = data;
      //         console.log('Hashed: ', data);
      //       });
      //     return createUserDto;
      //   } else {
      //     throw 'Missing Inputs';
      //   }
      // }

      // Check Inputs

      async function checkInputs(createUserDto: CreateUserDto) {
        if (
          createUserDto.email !== undefined &&
          createUserDto.password !== undefined
        ) {
          // Hashing Password
          createUserDto.password = await bcrypt.hash(
            createUserDto.password,
            parseInt(saltRounds),
          );

          return createUserDto;
        } else {
          throw 'Missing Inputs';
        }
      }

      // Check Duplication
      async function checkDuplication(email: string) {
        const duplicate = await userRepository.findOneBy({
          email: email,
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

      // Check whether Otp already exists
      async function checkDuplicateOtp() {
        // let newOtp: number;
        // let isExists: boolean;
        // do {
        //   newOtp = otpGen();
        //   isExists = await otpServiceX.checkOtp(newOtp);
        // } while (isExists);
        return otpGen();
      }

      // Create and Save OTP
      async function deliverOtp(
        user: Users,
        uniqueOtp: number,
        serviceName: string,
      ) {
        const otpData: OtpDto = {
          userId: user.id,
          email: user.email,
          otp: uniqueOtp,
          service: serviceName,
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
        const uniqueOtp = await checkDuplicateOtp();
        const savedOtp = await deliverOtp(newUser, uniqueOtp, 'VerifyAccount');
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

  async verifyAccountV2(
    verifyAccountPayload: VerifyAccountPayload,
  ): Promise<ReturnData> {
    return new Promise(async (resolve) => {
      var usersRepositoryX = this.usersRepo;
      var otpServiceX = this.otpService;

      // Check Inputs
      async function checkInputs(verifyAccountPayload: VerifyAccountPayload) {
        if (
          verifyAccountPayload.email !== undefined &&
          verifyAccountPayload !== undefined
        ) {
          return verifyAccountPayload;
        } else {
          throw 'Missing Inputs';
        }
      }

      // Check Availability
      async function checkUser(email: string) {
        try {
          const user = await usersRepositoryX.findOneBy({ email: email });
          if (user) {
            return user;
          } else {
            throw 'No user found for this Id';
          }
        } catch (error) {
          throw error;
        }
      }

      // Verify OTP
      async function verifyOtp(verifyAccountPayload: VerifyAccountPayload) {
        try {
          const verifyOtp =
            await otpServiceX.verifyAccount(verifyAccountPayload);
          if (verifyOtp) {
            return true;
          } else {
            throw 'Incorrect OTP';
          }
        } catch (error) {
          throw 'Incorrect OTP';
        }
      }

      // Update status in UsersRepository
      async function updateStatus(userId: number) {
        const statusUpdated = await usersRepositoryX.update(userId, {
          isActive: true,
        });

        if (statusUpdated && statusUpdated.affected === 1) {
          return true;
        } else {
          throw 'Status updating failed';
        }
      }

      // Clear OTP / OTP's
      async function cleatOtp(email: string) {
        const removeOtpRes = await otpServiceX.remove(email, 'VerifyAccount');

        if (removeOtpRes) {
          return removeOtpRes;
        } else {
          throw 'OTP not removed';
        }
      }

      try {
        const checkedInputs = await checkInputs(verifyAccountPayload);
        const checkedUser = await checkUser(checkedInputs.email);
        const isVerified = await verifyOtp(checkedInputs);
        const isStatusUpdated = await updateStatus(checkedUser.id);
        if (isVerified && isStatusUpdated) {
          const clearOtpRes = await cleatOtp(checkedUser.email);

          resolve({
            error: false,
            value: { otpSentTo: checkedUser.email, redirectTo: 'LoginPage' },
            message: 'Success',
          });
        } else {
          resolve({ error: true, value: null, message: 'Flow broke' });
        }
      } catch (error) {
        console.log({ error });
        resolve({ error: true, value: null, message: error });
      }
    });
  }

  async findAllV2() {
    return new Promise(async (resolve) => {
      var usersRepositoryX = this.usersRepo;

      // Fetch All Users
      async function fetchAll() {
        try {
          const users = await usersRepositoryX.find();

          if (users.length !== 0) {
            return users;
          } else {
            throw 'No users found';
          }
        } catch (error) {
          console.log({ error });
          throw error;
        }
      }

      try {
        const users = await fetchAll();

        resolve({
          error: false,
          value: users,
          message: 'Success',
        });
      } catch (error) {
        console.log({ error });
        resolve({ error: true, value: null, message: error });
      }
    });
  }

  async findOneV2(id: number) {
    return new Promise(async (resolve) => {
      var usersRepositoryX = this.usersRepo;

      // Fetch User
      async function fetchOne(id: number) {
        try {
          const user = await usersRepositoryX.findOneBy({
            id: id,
          });
          if (user) {
            return user;
          } else {
            throw 'No user found for this Id';
          }
        } catch (error) {
          console.log({ error });
          throw error;
        }
      }

      try {
        const user = await fetchOne(id);

        resolve({
          error: false,
          value: user,

          message: 'Success',
        });
      } catch (error) {
        console.log({ error });
        resolve({ error: true, value: null, message: error });
      }
    });
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

  async assignV2(id: number) {
    return new Promise(async (resolve) => {
      var usersRepositoryX = this.usersRepo;

      // Check Role
      async function checkRole(id: number) {
        try {
          const user = await usersRepositoryX.findOneBy({
            id: id,
          });
          if (user) {
            return user;
          } else {
            throw 'No user found for this Id';
          }
        } catch (error) {
          console.log({ error });
          throw error;
        }
      }

      // Fetch User
      async function fetchOne(id: number) {
        try {
          const user = await usersRepositoryX.findOneBy({
            id: id,
          });
          if (user) {
            return user;
          } else {
            throw 'No user found for this Id';
          }
        } catch (error) {
          console.log({ error });
          throw error;
        }
      }

      try {
        const user = await fetchOne(id);

        resolve({
          error: false,
          value: user,

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

  async update(id: number, updateUserDto: UpdateUserDto) {
    const returnData = new ReturnData();
    const saltRounds = process.env.SALT_ROUNDS;

    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(
        updateUserDto.password,
        parseInt(saltRounds),
      );
    }

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

  // Left out Methods
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

  async verifyAccount(payload: VerifyAccountPayload) {
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
}
