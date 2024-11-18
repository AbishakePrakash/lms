import {
  Injectable,
  NotFoundException,
  RequestTimeoutException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OtpDto } from './dto/create-otp.dto';
import { ReturnData } from 'src/Utils/globalValues';
import { VerifyAccountPayload } from './dto/verifyAccount.dto';
import { Otp } from './entities/otp.entity';
import { VerifyOtpPayload } from './dto/verify-otp.dto';

@Injectable()
export class OtpService {
  constructor(
    @InjectRepository(Otp)
    private readonly otpRepository: Repository<Otp>,
  ) {}

  async saveOtp(createOtpDto: OtpDto) {
    const otpRes = await this.otpRepository.save(createOtpDto);
    return otpRes;
  }

  // async getOtp(email: string) {
  //   const otpData = await this.otpRepository.findOne({
  //     where: { email },
  //     order: { createdAt: 'DESC' },
  //   });
  //   return otpData;
  // }

  async remove(email: string, service: string) {
    const data = await this.otpRepository.delete({
      email: email,
      service: service,
    });
    return data.affected;
  }

  async verifyAccount(payload: VerifyAccountPayload) {
    console.log({ payload });

    const data = await this.otpRepository.findOne({
      where: { email: payload.email, service: 'VerifyAccount' },
      order: { createdAt: 'DESC' },
    });

    if (!data) {
      throw new NotFoundException('No account registered with thie email Id');
    }

    //Prod
    const expiryTime = new Date(data.createdAt).getTime() + 300000;
    const currentTime = new Date().getTime();
    // if (currentTime > expiryTime) {
    //   throw new RequestTimeoutException('Otp Expired');
    // }

    return data.otp === payload.otp;
  }

  async resetPassword(payload: VerifyOtpPayload) {
    console.log({ payload });

    const data = await this.otpRepository.findOne({
      where: { email: payload.email, service: 'PasswordReset' },
      order: { createdAt: 'DESC' },
    });

    if (!data) {
      throw new NotFoundException('No account registered with this email Id');
    }

    const expiryTime = new Date(data.createdAt).getTime() + 300000;
    const currentTime = new Date().getTime();
    // if (currentTime > expiryTime) {
    //   throw new RequestTimeoutException('Otp Expired');
    // }
    console.log(data.otp, payload.otp);

    return data.otp === payload.otp;
  }
}
