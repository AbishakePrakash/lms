import { IsInt, IsString, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateResponseDto {
  @ApiProperty({
    description: 'The response for the doubt raised by the user.',
    example:
      'HTML stands for HyperText Markup Language, named because it structures web documents.',
  })
  @IsString()
  @MinLength(5, {
    message: 'The question must be at least 10 characters long.',
  })
  @MaxLength(500, { message: 'The question must not exceed 1000 characters.' })
  response: string;
}
