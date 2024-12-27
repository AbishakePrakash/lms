import { PartialType } from '@nestjs/swagger';
import { CreateMcqDto } from './create-mcq.dto';

export class UpdateMcqDto extends PartialType(CreateMcqDto) {}
