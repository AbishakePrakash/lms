import { ApiProperty } from '@nestjs/swagger';

export class CreateAnswerDto {
  @ApiProperty({
    description: 'ID of the user creating the answer',
    example: 1,
  })
  userId: number;

  @ApiProperty({
    description: 'Email of the user creating the answer',
    example: 'userAnswer@example.com',
  })
  email: string;

  @ApiProperty({
    description: 'ID of the question being answered',
    example: 6,
  })
  questionId: number;

  @ApiProperty({
    description: 'The answer text provided by the user',
    example: 'This is an example answer to the question.',
  })
  answer: string;
}
