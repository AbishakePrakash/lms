import { ApiProperty } from '@nestjs/swagger';
import { Column } from 'typeorm';

export class CreateCourseDto {
  author?: string;
  authorId?: number;

  @ApiProperty({
    description: 'Title of the Course',
    example: 'Introduction to Web Development',
  })
  title: string;

  @ApiProperty({
    description: 'Short introduction or summary of the course',
    example: 'Learn the basics of HTML, CSS, and JavaScript.',
  })
  introduction: string;

  @ApiProperty({
    description: 'Detailed description of the course',
    example:
      'This course covers front-end technologies like HTML, CSS, and JavaScript...',
  })
  description: string;

  @ApiProperty({
    description: 'URL of the course thumbnail image',
    example: 'https://example.com/thumbnail.jpg',
  })
  thumbnailUrl: string;

  @ApiProperty({
    description: 'URL of the course preview video',
    example: 'https://example.com/preview.mp4',
  })
  previewUrl: string;

  @ApiProperty({
    description: 'Tags associated with the course',
    example: ['web-development', 'programming', 'frontend'],
    type: [String],
  })
  tags: string[];

  @ApiProperty({
    description: 'Category of the course',
    example: 'Development',
  })
  category: string;

  @ApiProperty({
    description: 'Name(s) of the instructor(s)',
    example: 'John Doe',
  })
  instructors: string;

  @ApiProperty({
    description: 'Publish status of the course',
    example: false,
  })
  publishStatus: boolean;

  @ApiProperty({
    description: 'Date when the course will be published',
    example: '2025-01-01',
  })
  publishDate: string;

  @ApiProperty({
    description: 'Indicates if self-enrollment is enabled',
    example: true,
  })
  selfEnrollment: boolean;

  @ApiProperty({
    description: 'Marks the course as featured',
    example: false,
  })
  featured: boolean;

  @ApiProperty({
    description: 'Certification details for the course',
    example: true,
  })
  certification: boolean;

  @ApiProperty({
    description: 'Indicates if the course has a pricing model',
    example: true,
  })
  pricing: boolean;

  @ApiProperty({
    description: 'Currency of the course price',
    example: 'USD',
  })
  currency: string;

  @ApiProperty({
    description: 'Price of the course',
    example: '49.99',
  })
  price: string;

  courseStatus?: number;
  approver?: string;
  approverId?: number;
}
