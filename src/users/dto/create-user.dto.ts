import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ description: 'Username of the user', example: 'JK' })
  username: string;

  @ApiProperty({
    description: 'Email address of the user',
    example: 'gravitus.abishake@gmail.com',
  })
  email: string;

  @ApiProperty({ description: 'Role of the user', example: 'Admin' })
  role: string;

  @ApiProperty({
    description: 'Phone number of the user',
    example: '9876543210',
  })
  phone: string;

  @ApiProperty({ description: 'Age of the user', example: '25' })
  age: string;

  @ApiProperty({
    description: 'Encrypted password of the user',
    example: 'Jk@1234',
  })
  password: string;

  @ApiProperty({
    description: 'Indicates if the user is active or not',
    example: false,
  })
  isActive: boolean;
}
