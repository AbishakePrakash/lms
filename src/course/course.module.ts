import { Module } from '@nestjs/common';
import { CourseService } from './course.service';
import { CourseController } from './course.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Course } from './entities/course.entity';
import { UserContextService } from 'src/context/userContext';
import { Chapter } from 'src/chapter/entities/chapter.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Course, Chapter])],
  controllers: [CourseController],
  providers: [CourseService, UserContextService],
  exports: [CourseService],
})
export class CourseModule {}
