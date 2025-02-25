import { ApiProperty } from '@nestjs/swagger';

export class CreateAnswerPayload {
  userId: number;

  email: string;

  questionId: number;

  answer: string;

  richText: string;
}
