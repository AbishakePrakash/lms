import { IsInt, IsString, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateDoubtDto {
  @ApiProperty({
    description: 'The ID of the lesson the doubt is related to.',
    example: 1,
  })
  @IsInt()
  lessonId: number;

  userId?: number;

  @ApiProperty({
    description: 'The ID of the instructor to whom the doubt is directed.',
    example: 202,
  })
  @IsInt()
  instructorId: number;

  @ApiProperty({
    description: 'The question or doubt being raised by the user.',
    example:
      'Can you explain the difference between a join and a union in SQL?',
  })
  @IsString()
  @MinLength(5, { message: 'The question must be at least 5 characters long.' })
  @MaxLength(500, { message: 'The question must not exceed 500 characters.' })
  question: string;
}
