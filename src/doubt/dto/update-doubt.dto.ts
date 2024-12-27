import { PartialType } from '@nestjs/swagger';
import { CreateDoubtDto } from './create-doubt.dto';

export class UpdateDoubtDto extends PartialType(CreateDoubtDto) {}
