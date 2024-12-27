import { Module } from '@nestjs/common';
import { ChapterService } from './chapter.service';
import { ChapterController } from './chapter.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Chapter } from './entities/chapter.entity';
import { CourseModule } from 'src/course/course.module';
import { LessonModule } from 'src/lesson/lesson.module';

@Module({
  imports: [TypeOrmModule.forFeature([Chapter]), CourseModule, LessonModule],
  controllers: [ChapterController],
  providers: [ChapterService],
  exports: [ChapterService],
})
export class ChapterModule {}
