import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsArray,
} from 'class-validator';

export class CreateQuizDto {
  @ApiProperty({
    description: 'The title of the quiz',
    example: 'HTML Basics Quiz',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    description: 'A brief description of the quiz',
    example: 'Test your HTML skills with this beginner quiz',
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({
    description: 'The ID of the course this quiz belongs to',
    example: 10,
  })
  @IsNumber()
  @IsNotEmpty()
  courseId: number;

  @ApiProperty({
    description: 'The ID of the chapter this quiz belongs to',
    example: 2,
  })
  @IsNumber()
  @IsNotEmpty()
  chapterId: number;

  authorId?: number;
}
