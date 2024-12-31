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
import { MailData, ReturnData } from '../utils/globalValues';
import { JwtService } from '@nestjs/jwt';
import triggerMaileEvent from '../utils/nodeMailer';
import { OtpDto } from 'src/otp/dto/create-otp.dto';
import { OtpService } from 'src/otp/otp.service';
import { VerifyOtpPayload } from './dto/verify-otp.dto';
import { ResetPasswordPayload } from './dto/reset-payload.dto';
import { UpdateUserDto } from 'src/users/dto/update-user.dto';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from 'bcrypt';
import { InjectRepository } from '@nestjs/typeorm';
import { Otp } from 'src/otp/entities/otp.entity';

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
      returnData.error = 'User not found';
      return returnData;
    }

    if (user.isActive === false) {
      throw new UnauthorizedException('User not Verified');
    }

    const matched = await bcrypt.compare(signinCred.password, user.password);

    if (!matched) {
      throw new UnauthorizedException('Incorrect Password');
    }

    const { password, ...data } = user;

    const token = await this.jwtService.signAsync(data);

    return token;
  }

  async sendMail(mailData: MailData) {
    const returnData = new ReturnData();
    try {
      const data = await triggerMaileEvent(mailData);
      console.log({ data });
      const status = data.split(' ')[0];
      if (status === '250') {
        returnData.message = 'Mail sent successfully';
        returnData.value = data;
        // returnData.value = parseInt(status);
        return returnData;
      }
    } catch (error) {
      console.log('Error sending mail: ', error);
      throw new Error('Mail sending failed');
    }
  }

  generateSixDigitNumber() {
    const randomNum = Math.floor(Math.random() * 900000) + 100000;
    return randomNum;
  }

  async forgotPassword(email: string) {
    const returnData = new ReturnData();
    const mailData = new MailData();
    var processLog: object;
    const sender = process.env.MAIL_SENDER;
    var targetUser: Users;

    try {
      targetUser = await this.usersService.findOneByEmail(email);
      // console.log({ targetUser });
    } catch (error) {
      console.log('error: ', error);

      throw new NotFoundException('Email not found');
    }

    processLog = { checkUser: 'User Found' };

    const otp = this.generateSixDigitNumber();

    // console.log({ otp });

    const otpData: OtpDto = {
      userId: targetUser.id,
      email: targetUser.email,
      otp: otp,
      service: 'PasswordReset',
      // createdAt: JSON.stringify(createdTime),
      // expireAt: JSON.stringify(expiringTime),
    };

    try {
      const saveOtp = await this.otpService.saveOtp(otpData);
      processLog = { ...processLog, saveOtp: 'Otp saved to DB' };

      try {
        mailData.from = sender;
        mailData.to = email;
        mailData.subject = 'Reset Password';
        mailData.text = `The OTP to reset your CRM Account password is ${otp}`;

        await this.sendMail(mailData);
        processLog = { ...processLog, sendOtp: 'OTP sent to User' };
      } catch (error) {
        throw new Error("OTP didn't sent to user");
      }
    } catch (error) {
      throw new Error("OTP didn't saved to DB");
    }

    returnData.message = 'Success';
    returnData.value = processLog;

    return returnData;
  }

  async verifyOtp(otpPayload: VerifyOtpPayload) {
    const returnData = new ReturnData();
    const service = 'PasswordReset';
    var processLog: object;
    var data: Otp;
    try {
      data = await this.otpService.getOtp(otpPayload.email, service);
      // console.log({ data });
    } catch (error) {
      console.log(error);

      return Error('Error fetching OTP Data');
    }

    const user = await this.usersService.findOneByEmail(otpPayload.email);

    if (data.otp !== otpPayload.otp) {
      throw new UnauthorizedException('Wrong Otp');
    }

    processLog = { otpVerification: 'OTP Verified' };

    const time = data.createdAt;
    console.log(time);

    const stamp = new Date();
    const revokedTime = new Date(time);

    const diff = stamp.getTime() - revokedTime.getTime() - 19800000;

    console.log('Current Time:', stamp);
    console.log('Created Time:', revokedTime);
    console.log({ diff });

    if (diff > 300000) {
      throw new UnauthorizedException('OTP expired');
    }
    processLog = { ...processLog, otpValidation: 'OTP valid' };

    // console.log({ otpPayload });

    if (otpPayload.password !== otpPayload.confirmPassword) {
      throw new BadRequestException(
        'Password and Confirm Passwords must be same',
      );
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
}
