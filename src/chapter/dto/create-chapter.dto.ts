import { ApiProperty } from '@nestjs/swagger';

export class CreateChapterDto {
  @ApiProperty({
    description: 'Title of the chapter',
    example: 'FrontEnd Development',
  })
  title: string;

  @ApiProperty({
    description: 'Description of the chapter',
    example: 'This chapter focuses on frontend technologies like HTML and CSS.',
  })
  description: string;

  @ApiProperty({
    description: 'ID of the course this chapter belongs to',
    example: 10,
  })
  courseId: number;

  @ApiProperty({
    description: 'Order of the chapter within the course',
    example: 1,
  })
  order: number;
}
