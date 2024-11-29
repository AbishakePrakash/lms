import { Body, Controller, Post } from '@nestjs/common';
import { OtpService } from './otp.service';
import { OtpDto } from './dto/create-otp.dto';
import { VerifyAccountPayload } from './dto/verifyAccount.dto';

@Controller('otp')
export class OtpController {
  // constructor(private readonly otpService: OtpService) {}
  // @Post('password')
  // saveOtp(@Body() otpDto: OtpDto) {
  //   return this.otpService.saveOtp(otpDto);
  // }
  // @Post('verifyAccount')
  // verifyAccount(@Body() payload: VerifyAccountPayload) {
  //   return this.otpService.verifyAccount(payload);
  // }
}
