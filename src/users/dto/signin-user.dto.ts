import { ApiProperty } from '@nestjs/swagger';

export class SignInCred {
  @ApiProperty({ description: 'Email address of the user' })
  email: string;

  @ApiProperty({ description: 'Password of the user' })
  password: string;
}
