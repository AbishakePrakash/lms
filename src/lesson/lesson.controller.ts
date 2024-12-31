import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { LessonService } from './lesson.service';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';
import { ChangeOrderDto } from './dto/changeOrder.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { InstructorGuard } from 'src/auth/guard/instructorGuard';
import { AuthGuard } from 'src/auth/guard/authguard';

@ApiBearerAuth('access-token')
@ApiTags('Lesson')
@Controller('lesson')
// @UseGuards(AuthGuard)
export class LessonController {
  constructor(private readonly lessonService: LessonService) {}

  @Post()
  @UseGuards(InstructorGuard)
  create(@Body() createLessonDto: CreateLessonDto) {
    return this.lessonService.create(createLessonDto);
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
