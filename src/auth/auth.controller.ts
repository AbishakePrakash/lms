import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { SignInCred } from 'src/users/dto/signin-user.dto';
import { ForgotPasswordPayload } from './dto/forgot-payload.dto';
import { VerifyOtpPayload } from './dto/verify-otp.dto';
import { AuthGuard } from './guard/authguard';
import { ResetPasswordPayload } from './dto/reset-payload.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post()
  signin(@Body() signInCred: SignInCred) {
    return this.authService.signin(signInCred);
  }

  // @Post('mail')
  // sendMail() {
  //   return this.authService.sendMail();
  // }

  @Post('forgotPassword')
  forgotPassword(@Body() payload: ForgotPasswordPayload) {
    return this.authService.forgotPassword(payload.email);
  }

  @Post('resetPassword')
  verifyotp(@Body() payload: VerifyOtpPayload) {
    return this.authService.verifyOtp(payload);
  }
}
