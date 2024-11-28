import { ApiProperty } from '@nestjs/swagger';

export class VerifyAccountPayload {
  @ApiProperty({ description: 'Email address of the user' })
  email: string;

  @ApiProperty({
    description: 'OTP code entered by the user for account verification',
  })
  otp: number;

  @ApiProperty({
    description: 'The service for which the OTP is being verified',
    example: 'VerifyAccount',
  })
  service: string;
}
