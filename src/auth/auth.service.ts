import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';

import { Users } from 'src/users/entities/user.entity';
import { Repository, UpdateResult } from 'typeorm';
import { SignInCred } from 'src/users/dto/signin-user.dto';
import {
  emailTemplate,
  MailContents,
  MailData,
  ReturnData,
} from '../utils/globalValues';
import { JwtService } from '@nestjs/jwt';
import triggerMaileEvent from '../utils/nodeMailer';
import { OtpDto } from 'src/otp/dto/create-otp.dto';
import { OtpService } from 'src/otp/otp.service';
import { UpdateUserDto } from 'src/users/dto/update-user.dto';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from 'bcrypt';
import { InjectRepository } from '@nestjs/typeorm';
import { Otp } from 'src/otp/entities/otp.entity';
import { ResetPasswordPayload } from './dto/reset-pswrd.dto';
import * as moment from 'moment';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Users)
    @Inject(OtpService)
    @Inject(UsersService)
    private readonly usersRepository: Repository<Users>,
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly otpService: OtpService,
  ) {}

  async signin(signinCred: SignInCred) {
    const returnData = new ReturnData();

    const user = await this.usersService.findOneByEmail(signinCred.email);
    if (!user) {
      returnData.error = true;
      returnData.message = 'User not found';
      return returnData;
      // throw new UnauthorizedException('User not found');
    }

    if (user.isActive === false) {
      returnData.error = true;
      returnData.message = 'User not Verified';
      return returnData;
      // throw new UnauthorizedException('User not Verified');
    }

    const matched = await bcrypt.compare(signinCred.password, user.password);

    if (!matched) {
      returnData.error = true;
      returnData.message = 'Incorrect Password';
      return returnData;
      // throw new UnauthorizedException('Incorrect Password');
    }

    const { password, ...data } = user;

    const token = await this.jwtService.signAsync(data);

    return token;
  }

  async signInv2(signinCred: SignInCred): Promise<ReturnData> {
    return new Promise(async (resolve) => {
      var usersServiceX = this.usersService;
      var otpServiceX = this.otpService;
      var otpGen = this.generateSixDigitNumber;
      var triggerMail = this.sendMail;
      var jwtServiceX = this.jwtService;
      const currentDate = new Date();
      const mailData = new MailData();
      const formattedDate = currentDate.toLocaleDateString('en-US', {
        month: 'short',
        day: '2-digit',
        year: 'numeric',
      });

      // Check Inputs
      async function checkInputs(signinCred: SignInCred) {
        if (
          signinCred.email !== undefined &&
          signinCred.password !== undefined
        ) {
          return true;
        } else {
          throw 'Missing Inputs';
        }
      }

      // Check User
      async function checkUser(email: string) {
        const user = await usersServiceX.findOneByEmail(email);

        if (!user) {
          throw 'User not exists';
        } else {
          return user;
        }
      }

      // Verify Password
      async function passwordVerify(payloadPass: string, dbPass: string) {
        const matched = await bcrypt.compare(payloadPass, dbPass);

        if (matched) {
          return true;
        } else {
          throw 'Incorrect Password';
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

      // Generate JWT_Token
      async function tokenGen(user: Users) {
        const { password, ...data } = user;
        const token = await jwtServiceX.signAsync(data);
        return token;
      }

      try {
        const checkedInputs = await checkInputs(signinCred);
        const checkedUser = await checkUser(signinCred.email);

        if (!checkedUser.isActive) {
          const savedOtp = await deliverOtp(checkedUser);
          const emailResponse = await sendEmail(savedOtp, checkedUser);
          resolve({
            error: true,
            value: {},
            message: 'verificationPending',
          });
        } else {
          const passwordMatches = await passwordVerify(
            signinCred.password,
            checkedUser.password,
          );
          const token = await tokenGen(checkedUser);

          resolve({
            error: false,
            value: {
              email: checkedUser.email,
              token: token,
              redirectTo: 'HomePage',
            },
            message: 'Success',
          });
        }
      } catch (error) {
        console.log({ error });
        resolve({ error: true, value: null, message: error });
      }
    });
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

  async forgotPassword(email: string) {
    const returnData = new ReturnData();
    const mailData = new MailData();
    const currentDate = new Date();
    const formattedDate = currentDate.toLocaleDateString('en-US', {
      month: 'short', // "Feb"
      day: '2-digit', // "12"
      year: 'numeric', // "2025"
    });
    var processLog: object;
    const sender = '"HaloQuant " <no-reply@haloquant.com>';

    const targetUser = await this.usersService.findOneByEmail(email);
    if (!targetUser) {
      returnData.error = true;
      returnData.message = 'No User found for this Email';
      return returnData;
    }

    processLog = { checkUser: 'User Found' };

    const otp = this.generateSixDigitNumber();

    const otpData: OtpDto = {
      userId: targetUser.id,
      email: targetUser.email,
      otp: otp,
      service: 'PasswordReset',
    };

    try {
      const saveOtp = await this.otpService.saveOtp(otpData);
      if (!saveOtp) {
        returnData.error = true;
        returnData.message = "OTP didn't saved to DB";
        return returnData;
      }
      processLog = { ...processLog, saveOtp: 'Otp saved to DB' };

      try {
        const mailContents: MailContents = {
          date: formattedDate,
          username: targetUser.username,
          task: 'reset your Password',
          validity: '5 minutes',
          otp: otp,
        };

        mailData.from = sender;
        mailData.to = email;
        mailData.subject = 'Reset Password';
        mailData.html = emailTemplate(mailContents);

        const mailResponse = await this.sendMail(mailData);
        if (!mailResponse) {
          returnData.error = true;
          returnData.message = "OTP didn't sent to user";
          return returnData;
        }
        processLog = { ...processLog, sendOtp: 'OTP sent to User' };
      } catch (error) {
        // console.log(error);
        throw error;
      }
    } catch (error) {
      // console.log(error);
      throw error;
    }
    returnData.error = false;
    returnData.message = 'Success';
    returnData.value = processLog;

    return returnData;
  }

  async forgotPasswordV2(email: string) {
    return new Promise(async (resolve) => {
      var usersServiceX = this.usersService;
      var otpGen = this.generateSixDigitNumber;
      var otpServiceX = this.otpService;
      var triggerMail = this.sendMail;

      const mailData = new MailData();
      const currentDate = new Date();

      // Check Inputs
      async function checkEmail(email: string) {
        if (email !== undefined) {
          return email;
        } else {
          throw 'Missing Inputs';
        }
      }

      // Check Availability
      async function checkUser(email: string) {
        try {
          const user = await usersServiceX.findOneByEmail(email);

          if (user) {
            return user;
          } else {
            throw 'No question found for this Id';
          }
        } catch (error) {
          throw error;
        }
      }

      // Check whether Otp already exists
      async function checkDuplicateOtp() {
        let newOtp: number;
        let isExists: boolean;
        do {
          newOtp = otpGen();
          isExists = await otpServiceX.checkOtp(newOtp);
        } while (isExists);
        return newOtp;
      }

      // Create and Save OTP
      async function saveOtp(
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
        const checkedEmail = await checkEmail(email);
        const checkedUser = await checkUser(checkedEmail);
        const uniqueOtp = await checkDuplicateOtp();
        const createdOtp = await saveOtp(
          checkedUser,
          uniqueOtp,
          'ResetPassword',
        );
        const sentEmail = await sendEmail(createdOtp, checkedUser);
        // const users = await fetchAll();

        resolve({
          error: false,
          value: { emailSentTo: createdOtp.email, redirectTo: 'ResetPassword' },
          message: 'Success',
        });
      } catch (error) {
        console.log({ error });
        resolve({ error: true, value: null, message: error });
      }
    });
  }

  async resetPassword(otpPayload: ResetPasswordPayload) {
    const returnData = new ReturnData();
    const service = 'PasswordReset';
    var processLog: object;
    var data: Otp;

    try {
      data = await this.otpService.getOtp(otpPayload.email, service);
    } catch (error) {
      console.log(error);

      return Error('Error fetching OTP Data');
    }

    const user = await this.usersService.findOneByEmail(otpPayload.email);

    if (data.otp !== otpPayload.otp) {
      returnData.error = true;
      returnData.message = 'Incorrect OTP';
      return returnData;
      // throw new UnauthorizedException('Wrong Otp');
    }

    processLog = { otpVerification: 'OTP Verified' };

    const time = data.createdAt;
    console.log(time);

    const stamp = new Date();
    const revokedTime = new Date(time);

    const diff = stamp.getTime() - revokedTime.getTime() - 19800000;

    if (diff > 300000) {
      returnData.error = true;
      returnData.message = 'OTP expired';
      return returnData;
      // throw new UnauthorizedException('OTP expired');
    }
    processLog = { ...processLog, otpValidation: 'OTP valid' };

    // console.log({ otpPayload });

    if (otpPayload.password !== otpPayload.confirmPassword) {
      returnData.error = true;
      returnData.message = 'Password and Confirm Passwords must be same';
      return returnData;
      // throw new BadRequestException(
      //   'Password and Confirm Passwords must be same',
      // );
    } else {
      processLog = { ...processLog, passwordConfirmation: true };

      const removeOTPs = await this.otpService.remove(user.email, service);
      if (removeOTPs) {
        processLog = { ...processLog, otpRemoved: 'OTP removed' };
      } else {
        processLog = { ...processLog, otpRemoved: 'OTP not removed' };
      }
    }

    const updateUserDto: UpdateUserDto = {
      password: otpPayload.password,
    };

    try {
      const resetPassword = await this.usersService.update(
        user.id,
        updateUserDto,
      );

      const updateResult: UpdateResult = resetPassword.value;
      // console.log('Modified Rows', updateResult.affected);
      processLog = {
        ...processLog,
        resetPassword: 'Password Updated Successfully',
      };
    } catch (error) {
      console.log('Error: ', error);
      return Error('Password Updation Failed');
    }

    returnData.message = 'Success';
    returnData.value = processLog;

    return returnData;
  }

  async resetPasswordV2(payload: ResetPasswordPayload) {
    return new Promise(async (resolve) => {
      var usersServiceX = this.usersService;
      var otpServiceX = this.otpService;

      // Check Inputs
      async function checkInputs(payload: ResetPasswordPayload) {
        if (
          payload.email === undefined ||
          payload.otp === undefined ||
          payload.password === undefined ||
          payload.confirmPassword === undefined
        ) {
          throw 'Missing Inputs';
        } else if (payload.password !== payload.confirmPassword) {
          throw 'Password and Confirm Password must be same';
        } else {
          return payload;
        }
      }

      // Check User
      async function checkUser(email: string) {
        try {
          const user = await usersServiceX.findOneByEmail(email);
          if (user) {
            return user;
          } else {
            throw 'No user found for this Id';
          }
        } catch (error) {
          throw error;
        }
      }

      // Check Availability
      async function fetchOtp(email: string, service: string) {
        try {
          const otp = await otpServiceX.getOtp(email, 'ResetPassword');

          if (otp) {
            return otp;
          } else {
            throw 'No otp found for this email';
          }
        } catch (error) {
          throw error;
        }
      }

      // Check whether Otp already exists
      async function verifyOtp(payLoad: ResetPasswordPayload, savedOtp: Otp) {
        const timestamp = moment().valueOf();

        try {
          if (payLoad.otp == savedOtp.otp) {
            return true;
          } else if (Number(savedOtp.expiredAt) > timestamp) {
            throw 'Otp Expired';
          } else {
            throw 'Incorrect Otp';
          }
        } catch (error) {
          console.log(error);
          throw error;
        }
      }

      // Clear OTP
      async function clearOtp(email: string, service: string) {
        try {
          const removeOTPs = await otpServiceX.remove(email, service);
          if (removeOTPs > 0) {
            return removeOTPs;
          } else {
            throw 'Otp not cleared';
          }
        } catch (error) {
          console.log(error);
          throw error;
        }
      }

      try {
        const checkedInputs = await checkInputs(payload);
        const targetUser = await checkUser(checkedInputs.email);
        const fetchedOtp = await fetchOtp(checkedInputs.email, 'ResetPassword');
        const isAunthenticated = await verifyOtp(checkedInputs, fetchedOtp);
        if (isAunthenticated) {
          const updateUserDto: UpdateUserDto = {
            password: checkedInputs.password,
          };
          const isUpdated = await usersServiceX.update(
            targetUser.id,
            updateUserDto,
          );

          const isCleared = await clearOtp(targetUser.email, 'ResetPassword');

          resolve({
            error: false,
            value: { passwordUpdated: true, redirectTo: 'LoginPage' },
            message: 'Success',
          });
        } else {
          resolve({
            error: true,
            value: null,
            message: 'Otp Verification failed',
          });
        }
      } catch (error) {
        console.log({ error });
        resolve({ error: true, value: null, message: error });
      }
    });
  }
}
