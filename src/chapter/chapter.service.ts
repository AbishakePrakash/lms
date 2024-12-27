import {
  Inject,
  Injectable,
  MisdirectedException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateChapterDto } from './dto/create-chapter.dto';
import { UpdateChapterDto } from './dto/update-chapter.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Chapter } from './entities/chapter.entity';
import { Repository } from 'typeorm';
import { CourseService } from 'src/course/course.service';
import { Users } from 'src/users/entities/user.entity';
import { LessonService } from 'src/lesson/lesson.service';

@Injectable()
export class ChapterService {
  constructor(
    @InjectRepository(Chapter)
    private readonly chapterRepository: Repository<Chapter>,
    @Inject(CourseService)
    private readonly courseService: CourseService,
    @Inject(LessonService)
    private readonly lessonService: LessonService,
  ) {}

  async ownership(courseId: number, authorId: number) {
    const course = await this.courseService.findOne(courseId);
    return course.authorId === authorId;
  }

  async create(createChapterDto: CreateChapterDto, user: Users) {
    const isAuthor = await this.ownership(createChapterDto.courseId, user.id);
    if (isAuthor) {
      try {
        const chapter = await this.chapterRepository.save(createChapterDto);
        if (!chapter) {
          throw new MisdirectedException('Chapter not created');
        }
        return chapter;
      } catch (error) {
        console.log({ error });
        throw error;
      }
    } else {
      throw new UnauthorizedException(
        'Need Author Access to perform this Action',
      );
    }
  }

  async findAll() {
    try {
      const chapters = await this.chapterRepository.find();
      if (chapters.length === 0) {
        throw new NotFoundException('No Chapters found');
      }
      return chapters;
    } catch (error) {
      console.log({ error });
      throw error;
    }
  }

  async findOne(id: number) {
    try {
      const chapter = await this.chapterRepository.findOneBy({ chapterId: id });
      if (!chapter) {
        throw new NotFoundException('No Chapter found for this Chapter Id');
      }
      const lessons = await this.lessonService.findByChapter(id);
      return { ...chapter, lessons: lessons };
    } catch (error) {
      console.log({ error });
      return error;
    }
  }

  async update(id: number, updateChapterDto: UpdateChapterDto, user: Users) {
    const chapter: Chapter = await this.findOne(id);
    const isAuthor = await this.ownership(chapter.courseId, user.id);

    if (isAuthor) {
      try {
        const updatedChapter = await this.chapterRepository.update(
          id,
          updateChapterDto,
        );
        if (!updatedChapter) {
          throw new MisdirectedException('Chapter not updated');
        }
        return { updatedRows: updatedChapter.affected };
      } catch (error) {
        console.log({ error });
        throw error;
      }
    } else {
      throw new UnauthorizedException(
        'Need Author Access to perform this Action',
      );
    }
  }

  async remove(id: number, user: Users) {
    const chapter: Chapter = await this.findOne(id);
    const isAuthor = await this.ownership(chapter.courseId, user.id);
    if (isAuthor) {
      try {
        const deletedChapter = await this.chapterRepository.delete(id);
        if (!deletedChapter) {
          throw new MisdirectedException('Chapter not deleted');
        }
        return { deletedRows: deletedChapter.affected };
      } catch (error) {
        console.log({ error });
        throw error;
      }
    } else {
      throw new UnauthorizedException(
        'Need Author Access to perform this Action',
      );
    }
  }
}
