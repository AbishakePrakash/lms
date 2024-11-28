import { ApiProperty } from '@nestjs/swagger';

export class CreateQuestionDto {
  // @ApiProperty({
  //   description: 'ID of the user creating the question',
  //   example: 1,
  // })
  // userId: number;

  // @ApiProperty({
  //   description: 'Email address of the user',
  //   example: 'abishekprksh@gmail.com',
  // })
  // email: string;

  @ApiProperty({
    description: 'Content of the question being asked',
    example: 'What is NestJS?',
  })
  question: string;

  @ApiProperty({
    description: 'Tags related to the question',
    example: ['nestjs', 'typescript', 'backend'],
  })
  tags: string[];
}
