import { ApiProperty } from '@nestjs/swagger';

export class SignInCred {
  @ApiProperty({
    description: 'Email address of the user',
    example: 'gravitus.abishake@gmail.com',
  })
  email: string;

  @ApiProperty({
    description: 'Password of the user',
    example: 'Jk@1234',
  })
  password: string;
}
