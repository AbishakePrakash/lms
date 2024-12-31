import { ApiProperty } from '@nestjs/swagger';

export class ChangeOrderDto {
  @ApiProperty({
    description: 'The ID of the lesson whose order is being changed',
    example: 1,
  })
  lessonId: number;

  @ApiProperty({
    description: 'The ID of the previous lesson (for reordering purposes)',
    example: 2,
  })
  prevId: number;
}
