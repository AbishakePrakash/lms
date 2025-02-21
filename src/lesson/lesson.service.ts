import {
  BadRequestException,
  Inject,
  Injectable,
  MisdirectedException,
  NotFoundException,
} from '@nestjs/common';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Lesson } from './entities/lesson.entity';
import { Repository } from 'typeorm';
import { ChangeOrderDto } from './dto/changeOrder.dto';
import { midGround } from 'src/utils/globalValues';
import { log } from 'console';
import { DoubtService } from 'src/doubt/doubt.service';
import { uploadToS3 } from 'src/utils/awsBucket';

@Injectable()
export class LessonService {
  constructor(
    @InjectRepository(Lesson)
    private readonly lessonRepository: Repository<Lesson>,
    @Inject(DoubtService)
    private readonly doubtService: DoubtService,
  ) {}

  async create(createLessonDto: CreateLessonDto, file: Express.Multer.File) {
    const maxOrder = await this.lessonRepository.find({
      select: ['order'],
      order: { order: 'DESC' },
      take: 1,
    });

    console.log(maxOrder.length);

    if (maxOrder.length === 0) {
      createLessonDto.order = 1;
    } else {
      const length = maxOrder[0].order;
      createLessonDto.order = length + 1;
    }

    // Video Upload

    const { buffer, originalname, mimetype, path } = file;

    if (!mimetype.startsWith('video/')) {
      throw new BadRequestException('Only video files are allowed!');
    }

    const videoUrl = await uploadToS3(buffer, originalname, mimetype, 'lesson');

    const payLoad = {
      ...createLessonDto,
      video: videoUrl,
    };

    try {
      const lesson = await this.lessonRepository.save(payLoad);
      if (!lesson) {
        throw new MisdirectedException('Lesson not created');
      }
      return lesson;
    } catch (error) {
      throw error;
    }
  }

  async findAll() {
    try {
      const lessons = await this.lessonRepository.find();
      if (lessons.length === 0) {
        throw new NotFoundException('No Lessons found');
      }
      return lessons;
    } catch (error) {
      throw error;
    }
  }

  async findOne(id: number) {
    try {
      const lesson = await this.lessonRepository.findOneBy({ lessonId: id });

      if (!lesson) {
        throw new NotFoundException('No Lesson found for the given Id');
      }
      const doubts = await this.doubtService.findByLesson(id);
      return { ...lesson, doubts: doubts };
    } catch (error) {
      throw error;
    }
  }

  // helper
  async findByChapter(id: number) {
    try {
      const lessons = await this.lessonRepository.findBy({ chapterId: id });

      return lessons;
    } catch (error) {
      throw error;
    }
  }

  async update(id: number, updateLessonDto: UpdateLessonDto) {
    try {
      const updateLesson = await this.lessonRepository.update(
        id,
        updateLessonDto,
      );
      if (!updateLesson.affected) {
        throw new MisdirectedException('Updating lesson failed');
      }
      return updateLesson;
    } catch (error) {
      throw error;
    }
  }

  async remove(id: number) {
    try {
      const deleteLesson = await this.lessonRepository.delete(id);
      if (!deleteLesson.affected) {
        throw new MisdirectedException('Deleting lesson failed');
      }
      return deleteLesson;
    } catch (error) {
      throw error;
    }
  }

  async changeOrder(payload: ChangeOrderDto, string: string) {
    console.log(string);
    var previousOrder;
    try {
      console.log('Log B');

      try {
        const previousLesson: Lesson = await this.findOne(payload.prevId);
        if (!previousLesson) {
          throw new MisdirectedException("Can't find previous lesson");
        }
        previousOrder = previousLesson.order;
      } catch (error) {
        throw error;
      }

      console.log('Log C');

      console.log({ previousOrder });

      // const nextLesson = await this.lessonRepository
      //   .createQueryBuilder('lesson')
      //   .where('lesson.order > :previousOrder', { previousOrder })
      //   .orderBy('lesson.order', 'ASC')
      //   .select(['lesson.lessonId', 'lesson.order'])
      //   .getOne();

      // if (!nextLesson) {
      //   throw new BadRequestException('No next lesson found');
      // }

      // const newOrder = midGround(previousOrder, nextLesson.order);

      // const returnData = {
      //   prevId: previousLesson.lessonId,
      //   prevOrder: previousOrder,
      //   nextOrder: nextLesson.order,
      //   nextId: nextLesson.lessonId,
      //   newOrder: newOrder,
      // };

      // log(returnData);

      // const updateLessonDto: UpdateLessonDto = {
      //   order: newOrder,
      // };

      // const updateOrder = await this.update(payload.lessonId, updateLessonDto);

      // return updateOrder;
    } catch (error) {
      console.log('Log B_');

      console.log(error);
      throw error;
    }
  }
}
