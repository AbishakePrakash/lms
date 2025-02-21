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
import { ReturnData } from 'src/utils/globalValues';
import { Lesson } from 'src/lesson/entities/lesson.entity';
import { Course } from 'src/course/entities/course.entity';

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
    const returnData: ReturnData = await this.courseService.findOne(courseId);
    const course: Course = returnData.value;
    return course.authorId === authorId;
  }

  async create(createChapterDto: CreateChapterDto, user: Users) {
    const returnData = new ReturnData();
    const previousChapter = await this.chapterRepository.findOne({
      where: {
        courseId: createChapterDto.courseId,
      },
      order: { order: 'DESC' },
    });
    createChapterDto.order = previousChapter ? previousChapter.order + 1 : 1;

    const isAuthor = await this.ownership(createChapterDto.courseId, user.id);
    if (isAuthor) {
      try {
        const chapter = await this.chapterRepository.save(createChapterDto);
        if (!chapter) {
          returnData.error = true;
          returnData.message = 'Chapter not created';
          return returnData;
          // throw new MisdirectedException('Chapter not created');
        }
        returnData.error = false;
        returnData.message = 'Success';
        returnData.value = chapter;
        return returnData;
      } catch (error) {
        console.log({ error });
        throw error;
      }
    } else {
      returnData.error = true;
      returnData.message = 'Need Author Access to perform this Action';
      return returnData;
      // throw new UnauthorizedException(
      //   'Need Author Access to perform this Action',
      // );
    }
  }

  async findAll() {
    const returnData = new ReturnData();
    try {
      const chapters = await this.chapterRepository.find();
      if (chapters.length === 0) {
        returnData.error = true;
        returnData.message = 'No Chapters found';
        return returnData;
        // throw new NotFoundException('No Chapters found');
      }
      returnData.error = false;
      returnData.message = 'Success';
      returnData.value = chapters;
      return returnData;
    } catch (error) {
      console.log({ error });
      throw error;
    }
  }

  async findOne(id: number) {
    const returnData = new ReturnData();
    try {
      const chapter = await this.chapterRepository.findOneBy({ chapterId: id });
      if (!chapter) {
        returnData.error = true;
        returnData.message = 'No Chapter found for this Chapter Id';
        return returnData;
        // throw new NotFoundException('No Chapter found for this Chapter Id');
      }
      const lessons = await this.lessonService.findByChapter(id);
      returnData.error = false;
      returnData.message = 'Success';
      returnData.value = { ...chapter, lessons: lessons };
      return returnData;
    } catch (error) {
      console.log({ error });
      return error;
    }
  }

  async update(id: number, updateChapterDto: UpdateChapterDto, user: Users) {
    const returnData = new ReturnData();
    const chapter: Chapter = await this.findOne(id);
    const isAuthor = await this.ownership(chapter.courseId, user.id);

    if (isAuthor) {
      try {
        const updatedChapter = await this.chapterRepository.update(
          id,
          updateChapterDto,
        );
        if (!updatedChapter) {
          returnData.error = true;
          returnData.message = 'Chapter not updated';
          return returnData;
          // throw new MisdirectedException('Chapter not updated');
        }
        returnData.error = false;
        returnData.message = 'Success';
        returnData.value = { updatedRows: updatedChapter.affected };
        return returnData;
      } catch (error) {
        console.log({ error });
        throw error;
      }
    } else {
      returnData.error = true;
      returnData.message = 'Need Author Access to perform this Action';
      return returnData;
      // throw new UnauthorizedException(
      //   'Need Author Access to perform this Action',
      // );
    }
  }

  async remove(id: number, user: Users) {
    const returnData = new ReturnData();
    const chapter: Chapter = await this.findOne(id);
    const isAuthor = await this.ownership(chapter.courseId, user.id);
    if (isAuthor) {
      try {
        const deletedChapter = await this.chapterRepository.delete(id);
        if (!deletedChapter) {
          returnData.error = true;
          returnData.message = 'Chapter not deleted';
          return returnData;
          // throw new MisdirectedException('Chapter not deleted');
        }
        returnData.error = false;
        returnData.message = 'Successs';
        returnData.value = { deletedRows: deletedChapter.affected };
        return returnData;
      } catch (error) {
        console.log({ error });
        throw error;
      }
    } else {
      returnData.error = true;
      returnData.message = 'Need Author Access to perform this Action';
      return returnData;
      // throw new UnauthorizedException(
      //   'Need Author Access to perform this Action',
      // );
    }
  }
}
