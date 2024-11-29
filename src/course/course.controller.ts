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
import { CourseService } from './course.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { InstructorGuard } from 'src/auth/guard/instructorGuard';
import { AuthGuard } from 'src/auth/guard/authguard';
import { AdminGuard } from 'src/auth/guard/adminGuard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiBearerAuth('access-token')
@ApiTags('Courses')
@Controller('course')
export class CourseController {
  constructor(private readonly courseService: CourseService) {}

  @Post()
  @UseGuards(InstructorGuard)
  create(@Body() createCourseDto: CreateCourseDto, @Request() req) {
    return this.courseService.create(createCourseDto, req.user);
  }

  @Post('approve/:id')
  @UseGuards(AdminGuard)
  approveCourse(@Param('id') id: string, @Request() req) {
    return this.courseService.approveCourse(+id, req.user);
  }

  @Get()
  @UseGuards(AuthGuard)
  findAll() {
    return this.courseService.findAll();
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  findOne(@Param('id') id: string) {
    return this.courseService.findOne(+id);
  }

  @Patch('update/:id')
  @UseGuards(InstructorGuard)
  update(@Param('id') id: string, @Body() updateCourseDto: UpdateCourseDto) {
    return this.courseService.update(+id, updateCourseDto);
  }

  @Patch('suspend/:id')
  @UseGuards(InstructorGuard)
  suspend(@Param('id') id: string) {
    return this.courseService.suspend(+id);
  }

  @Delete(':id')
  @UseGuards(AdminGuard)
  remove(@Param('id') id: string) {
    return this.courseService.remove(+id);
  }
}
