import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { McqService } from './mcq.service';
import { CreateMcqDto } from './dto/create-mcq.dto';
import { UpdateMcqDto } from './dto/update-mcq.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiBearerAuth('access-token')
@ApiTags('Mcq')
@Controller('mcq')
export class McqController {
  constructor(private readonly mcqService: McqService) {}

  @Post()
  create(@Body() createMcqDto: CreateMcqDto) {
    return this.mcqService.create(createMcqDto);
  }

  @Get()
  findAll() {
    return this.mcqService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.mcqService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateMcqDto: UpdateMcqDto) {
    return this.mcqService.update(+id, updateMcqDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.mcqService.remove(+id);
  }
}
