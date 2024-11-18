import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ description: 'Username of the user' })
  username: string;

  @ApiProperty({ description: 'Email address of the user' })
  email: string;

  @ApiProperty({ description: 'Role of the user' })
  role: string;

  @ApiProperty({ description: 'Phone number of the user' })
  phone: string;

  @ApiProperty({ description: 'Age of the user' })
  age: string;

  @ApiProperty({ description: 'Encrypted password of the user' })
  password: string;

  @ApiProperty({ description: 'Indicates if the user is active or not' })
  isActive: boolean;
}
