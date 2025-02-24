import { Body, Controller, Post } from '@nestjs/common';
import { OtpService } from './otp.service';
import { OtpDto } from './dto/create-otp.dto';
import { VerifyAccountPayload } from './dto/verifyAccount.dto';

@Controller('otp')
export class OtpController {
  constructor(private readonly otpService: OtpService) {}
}
