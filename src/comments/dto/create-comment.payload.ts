import { ApiProperty } from '@nestjs/swagger';

export class CreateCommentPayload {
  userId: number;

  email: string;

  parentType: string;

  parentId: number;

  comment: string;

  createdAtV2: string;

  updatedAtV2: string;
}
