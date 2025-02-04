import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsString } from 'class-validator';

export class CreateLessonDto {
  @ApiProperty({
    description: 'The title of the lesson',
    example: 'Introduction to HTML',
  })
  title: string;

  @ApiProperty({
    description: 'A brief description of the lesson',
    example:
      'This lesson covers the basics of HTML, including elements and structure.',
  })
  description: string;

  @ApiProperty({ type: 'string', format: 'binary' })
  video: any;

  // @ApiProperty({ description: 'Folder path to save the video in S3' })
  // @IsString()
  // @Transform(({ value }) => value.trim())
  // path: string;

  @ApiProperty({
    description: 'The ID of the course this lesson belongs to',
    example: 5,
  })
  courseId: number;

  @ApiProperty({
    description: 'The ID of the chapter this lesson belongs to',
    example: 2,
  })
  chapterId: number;

  order?: number;

  //   @ApiProperty({
  //     description:
  //       'Prerequisites for accessing this lesson, if any (e.g., quizId)',
  //     example: 'quiz-1',
  //   })
  prerequisites: string;
}
