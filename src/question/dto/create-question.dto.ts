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
    description: 'Title of the question being asked',
    example: 'Duplicate key Error',
  })
  title: string;

  @ApiProperty({
    description: 'Content of the question being asked',
    example:
      'I’m trying to understand the root cause and solutions for the "Duplicate Key Error" that often occurs in SQL databases. From what I’ve read, this error happens when a value that violates a unique constraint or primary key is inserted into a table. However, I have several questions about the specifics of this issue:',
  })
  question: string;

  @ApiProperty({
    description: 'Tags related to the question',
    example: ['sql', 'rdbms', 'database'],
  })
  tags: string[];
}
