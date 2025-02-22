import { ApiProperty } from '@nestjs/swagger';

export class CreateQuestionDto {
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
    description: 'HTML Content',
    example: '<p>RichText Content.</p>',
  })
  richText: string;

  @ApiProperty({
    description: 'Tags related to the question',
    example: '["sql", "rdbms", "database"]',
    required: false,
  })
  tags: string;
}
