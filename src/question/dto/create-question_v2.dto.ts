// dto/create-question-with-file.dto.ts
import { CreateQuestionDto } from './create-question.dto';
import { ApiProperty } from '@nestjs/swagger';

export class CreateQuestionWithFileDto extends CreateQuestionDto {
  @ApiProperty({ type: 'string', format: 'binary' })
  file: any;
}
