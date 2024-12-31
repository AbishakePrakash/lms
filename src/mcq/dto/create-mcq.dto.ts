import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsOptional,
  IsInt,
  Min,
  Max,
} from 'class-validator';

export class CreateMcqDto {
  @ApiProperty({
    description: 'The ID of the course associated with the MCQ',
    example: 1,
  })
  @IsNumber()
  courseId: number;

  @ApiProperty({
    description: 'The ID of the chapter associated with the MCQ',
    example: 2,
  })
  @IsNumber()
  chapterId: number;

  @ApiProperty({
    description: 'The ID of the quiz associated with the MCQ',
    example: 3,
  })
  @IsNumber()
  quizId: number;

  @ApiProperty({
    description: 'The text of the question',
    example: 'What is the file extension of the HTML file?',
  })
  @IsString()
  question: string;

  @ApiProperty({
    description: 'Option 1 for the MCQ',
    example: '.txt',
  })
  @IsString()
  option1: string;

  @ApiProperty({
    description: 'Option 2 for the MCQ',
    example: '.xml',
  })
  @IsString()
  option2: string;

  @ApiProperty({
    description: 'Option 3 for the MCQ',
    example: '.html',
  })
  @IsString()
  option3: string;

  @ApiProperty({
    description: 'Option 4 for the MCQ',
    example: '.file',
  })
  @IsString()
  option4: string;

  @ApiProperty({
    description:
      'Optional fifth option for the MCQ. Defaults to "None of the Above"',
    example: 'None of the Above',
    required: false,
  })
  @IsOptional()
  @IsString()
  option5?: string;

  @ApiProperty({
    description: 'Right option for the question',
    example: 3,
  })
  @IsInt()
  @Min(1)
  @Max(5)
  answerId: number;
}
