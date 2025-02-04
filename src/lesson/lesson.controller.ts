import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { LessonService } from './lesson.service';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';
import { ChangeOrderDto } from './dto/changeOrder.dto';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { InstructorGuard } from 'src/auth/guard/instructorGuard';
import { AuthGuard } from 'src/auth/guard/authguard';
import { UploadVideoDto } from './dto/upload-video.dto';
import { FileInterceptor } from '@nestjs/platform-express';

@ApiBearerAuth('access-token')
@ApiTags('Lesson')
@Controller('lesson')
// @UseGuards(AuthGuard)
export class LessonController {
  constructor(private readonly lessonService: LessonService) {}

  @Post()
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: CreateLessonDto })
  @UseInterceptors(FileInterceptor('video'))
  @UseGuards(InstructorGuard)
  create(
    @UploadedFile() file: Express.Multer.File,
    @Body() createLessonDto: CreateLessonDto,
  ) {
    return this.lessonService.create(createLessonDto, file);
  }

  @Get()
  @UseGuards(AuthGuard)
  findAll() {
    return this.lessonService.findAll();
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  findOne(@Param('id') id: string) {
    return this.lessonService.findOne(+id);
  }

  @Patch(':id')
  @UseGuards(InstructorGuard)
  update(@Param('id') id: string, @Body() updateLessonDto: UpdateLessonDto) {
    return this.lessonService.update(+id, updateLessonDto);
  }

  @Delete(':id')
  @UseGuards(InstructorGuard)
  remove(@Param('id') id: string) {
    return this.lessonService.remove(+id);
  }

  @Post('order')
  // @UseGuards(InstructorGuard)
  changeOrder(@Body() payload: ChangeOrderDto) {
    console.log('Hit changeOrder endpoint');

    return this.lessonService.changeOrder(payload, 'Log A');
  }
}
