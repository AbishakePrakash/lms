import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OtpDto } from './dto/create-otp.dto';
import { VerifyAccountPayload } from './dto/verifyAccount.dto';
import { Otp } from './entities/otp.entity';
import { OtpPayload } from './dto/create-otp.payload';
import * as moment from 'moment';

@Injectable()
export class OtpService {
  constructor(
    @InjectRepository(Otp)
    private readonly otpRepository: Repository<Otp>,
  ) {}

  async saveOtp(createOtpDto: OtpDto) {
    const validity = process.env.OTP_VALIDITY;

    const timestamp = moment().valueOf();
    const expiry = timestamp + Number(validity) * 60 * 1000;
    const payLoad: OtpPayload = {
      userId: createOtpDto.userId,
      email: createOtpDto.email,
      otp: createOtpDto.otp,
      service: createOtpDto.service,
      createdAtV2: timestamp.toString(),
      expiredAt: expiry.toString(),
    };

    const otpRes = await this.otpRepository.save(payLoad);
    return otpRes;
  }

  async remove(email: string, service: string) {
    const data = await this.otpRepository.delete({
      email: email,
      service: service,
    });
    return data.affected;
  }

  // helper
  async verifyAccount(verifyAccountPayload: VerifyAccountPayload) {
    const data = await this.otpRepository.findOne({
      where: { email: verifyAccountPayload.email, service: 'VerifyAccount' },
      order: { createdAt: 'DESC' },
    });

    if (!data) {
      return null;
    }

    //Prod-Env
    const expiryTime = new Date(data.createdAt).getTime() + 300000;
    const currentTime = new Date().getTime();
    // if (currentTime > expiryTime) {
    //   throw new RequestTimeoutException('Otp Expired');
    // }

    return data.otp === verifyAccountPayload.otp;
  }

  async getOtp(email: string, service: string) {
    const otpData = await this.otpRepository.findOne({
      where: { email: email, service: service },
      order: { createdAt: 'DESC' },
    });

    return otpData;
  }

  async checkOtp(newOtp: number): Promise<boolean> {
    const isExists = await this.otpRepository.findOneBy({ otp: newOtp });
    return !!isExists;
  }

  // check

  // async resetPassword(payload: VerifyOtpPayload) {
  //   // console.log({ payload });

  //   const data = await this.otpRepository.findOne({
  //     where: { email: payload.email, service: 'PasswordReset' },
  //     order: { createdAt: 'DESC' },
  //   });

  //   if (!data) {
  //     // throw new NotFoundException('No account registered with this email Id');
  //   }

  //   const expiryTime = new Date(data.createdAt).getTime() + 300000;
  //   const currentTime = new Date().getTime();
  //   // if (currentTime > expiryTime) {
  //   //   throw new RequestTimeoutException('Otp Expired');
  //   // }
  //   // console.log(data.otp, payload.otp);

  //   return data.otp === payload.otp;
  // }
}
