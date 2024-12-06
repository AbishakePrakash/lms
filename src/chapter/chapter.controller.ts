import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ChapterService } from './chapter.service';
import { CreateChapterDto } from './dto/create-chapter.dto';
import { UpdateChapterDto } from './dto/update-chapter.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { InstructorGuard } from 'src/auth/guard/instructorGuard';

@ApiBearerAuth('access-token')
@ApiTags('Chapters')
@Controller('chapter')
@UseGuards(InstructorGuard)
export class ChapterController {
  constructor(private readonly chapterService: ChapterService) {}

  @Post()
  create(@Body() createChapterDto: CreateChapterDto, @Request() req) {
    return this.chapterService.create(createChapterDto, req.user);
  }

  @Get()
  findAll() {
    return this.chapterService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.chapterService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateChapterDto: UpdateChapterDto,
    @Request() req,
  ) {
    return this.chapterService.update(+id, updateChapterDto, req.user);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    return this.chapterService.remove(+id, req.user);
  }
}
