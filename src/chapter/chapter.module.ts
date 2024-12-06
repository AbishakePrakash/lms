import { Module } from '@nestjs/common';
import { ChapterService } from './chapter.service';
import { ChapterController } from './chapter.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Chapter } from './entities/chapter.entity';
import { UserContextService } from 'src/context/userContext';
import { CourseModule } from 'src/course/course.module';

@Module({
  imports: [TypeOrmModule.forFeature([Chapter]), CourseModule],
  controllers: [ChapterController],
  providers: [ChapterService, UserContextService],
})
export class ChapterModule {}
