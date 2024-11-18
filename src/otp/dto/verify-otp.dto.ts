import { ApiProperty } from '@nestjs/swagger';

export class VerifyOtpPayload {
  @ApiProperty({ description: 'Email address of the user' })
  email: string;

  @ApiProperty({ description: 'OTP code entered by the user' })
  otp: number;

  @ApiProperty({
    description:
      'The service for which the OTP is being verified (e.g., VerifyAccount)',
  })
  service: string;

  @ApiProperty({ description: 'New password to be set after OTP verification' })
  password: string;

  @ApiProperty({
    description: 'Confirmation of the new password entered by the user',
  })
  confirmPassword: string;
}
