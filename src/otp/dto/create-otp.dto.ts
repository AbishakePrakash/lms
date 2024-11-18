import { ApiProperty } from '@nestjs/swagger';

export class OtpDto {
  @ApiProperty({ description: 'Unique identifier for the user' })
  userId: number;

  @ApiProperty({ description: 'Email address of the user' })
  email: string;

  @ApiProperty({ description: 'Generated OTP code' })
  otp: number;

  @ApiProperty({
    description:
      'The service for which the OTP is generated (e.g., VerifyAccount)',
  })
  service: string;
}
