import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNumber,
  IsString,
  MinLength,
  MaxLength,
  Matches,
} from 'class-validator';

export class VerifyOtpPayload {
  @ApiProperty({
    description: 'User email address used for verification',
    example: 'abishekprksh@gmail.com',
  })
  @IsEmail({}, { message: 'Email must be a valid email address' })
  email: string;

  @ApiProperty({
    description: 'One-time password sent to the user',
    example: 123456,
  })
  @IsNumber({}, { message: 'OTP must be a valid number' })
  otp: number;

  @ApiProperty({
    description: 'New password for the user account',
    example: 'Mkay@1234',
    minLength: 5,
  })
  @IsString()
  @MinLength(5, { message: 'Password must be at least 8 characters long' })
  @Matches(/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/, {
    message:
      'Password must contain uppercase, lowercase, number, and special character',
  })
  password: string;

  @ApiProperty({
    description: 'Confirmation of the new password',
    example: 'Mkay@1234',
  })
  @IsString()
  @MinLength(8, {
    message: 'Confirm password must be at least 8 characters long',
  })
  confirmPassword: string;
}
