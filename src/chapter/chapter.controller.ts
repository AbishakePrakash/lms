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
import { AuthGuard } from 'src/auth/guard/authguard';

@ApiBearerAuth('access-token')
@ApiTags('Chapters')
@Controller('chapter')
export class ChapterController {
  constructor(private readonly chapterService: ChapterService) {}

  @Post()
  @UseGuards(InstructorGuard)
  create(@Body() createChapterDto: CreateChapterDto, @Request() req) {
    return this.chapterService.create(createChapterDto, req.user);
  }

  @Get()
  @UseGuards(AuthGuard)
  findAll() {
    return this.chapterService.findAll();
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  findOne(@Param('id') id: string) {
    return this.chapterService.findOne(+id);
  }

  @Patch(':id')
  @UseGuards(InstructorGuard)
  update(
    @Param('id') id: string,
    @Body() updateChapterDto: UpdateChapterDto,
    @Request() req,
  ) {
    return this.chapterService.update(+id, updateChapterDto, req.user);
  }

  @Delete(':id')
  @UseGuards(InstructorGuard)
  remove(@Param('id') id: string, @Request() req) {
    return this.chapterService.remove(+id, req.user);
  }
}
