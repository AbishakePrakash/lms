import { ApiProperty } from '@nestjs/swagger';

export class CreateCommentDto {
  @ApiProperty({
    description: 'ID of the user creating the comment',
    example: 6,
  })
  userId: number;

  @ApiProperty({
    description: 'Email of the user creating the comment',
    example: 'user@example.com',
  })
  email: string;

  @ApiProperty({
    description:
      'The type of the parent entity (e.g., "question" or "answer" or "comment")',
    example: 'question',
  })
  parentType: string;

  @ApiProperty({
    description: 'ID of the parent entity being commented on',
    example: 2,
  })
  parentId: number;

  @ApiProperty({
    description: 'The content of the comment',
    example: 'This is a comment on the question.',
  })
  comment: string; // Changed to string, assuming it's text content
}
