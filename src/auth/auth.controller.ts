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
import { AuthGuard } from './guard/authguard';
import { ApiTags } from '@nestjs/swagger';
import { ResetPasswordPayload } from './dto/reset-pswrd.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // @Post('v0')
  // signin(@Body() signInCred: SignInCred) {
  //   return this.authService.signin(signInCred);
  // }

  @Post('signIn')
  signinV2(@Body() signInCred: SignInCred) {
    return this.authService.signInv2(signInCred);
  }

  @Post('forgotPassword')
  forgotPassword(@Body() payload: ForgotPasswordPayload) {
    return this.authService.forgotPassword(payload.email);
  }

  @Post('forgotPasswordV2')
  forgotPasswordV2(@Body() payload: ForgotPasswordPayload) {
    return this.authService.forgotPasswordV2(payload.email);
  }

  @Post('resetPassword')
  resetPassword(@Body() payload: ResetPasswordPayload) {
    return this.authService.resetPassword(payload);
  }

  @Post('resetPasswordV2')
  resetPasswordV2(@Body() payload: ResetPasswordPayload) {
    return this.authService.resetPasswordV2(payload);
  }
}
