import { ApiProperty } from '@nestjs/swagger';

export class CreateCommentPayload {
  userId: number;

  username: string;

  email: string;

  parentType: string;

  parentId: number;

  comment: string;
}
