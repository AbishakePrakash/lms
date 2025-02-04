import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export class UploadVideoDto {
  @ApiProperty({ type: 'string', format: 'binary' })
  video: any;

  @ApiProperty({ description: 'Folder path to save the video in S3' })
  @IsString()
  @Transform(({ value }) => value.trim())
  path: string;
}
