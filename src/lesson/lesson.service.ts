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
import { midGround, ReturnData } from 'src/utils/globalValues';
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
    const returnData = new ReturnData();

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
      returnData.error = true;
      returnData.message = 'Only video files are allowed!';
      return returnData;
      // throw new BadRequestException('Only video files are allowed!');
    }

    const videoUrl = await uploadToS3(buffer, originalname, mimetype, 'lesson');

    const payLoad = {
      ...createLessonDto,
      video: videoUrl,
    };

    try {
      const lesson = await this.lessonRepository.save(payLoad);
      if (!lesson) {
        returnData.error = true;
        returnData.message = 'Lesson not created';
        return returnData;
        // throw new MisdirectedException('Lesson not created');
      }
      returnData.error = false;
      returnData.message = 'Success';
      returnData.value = lesson;
      return returnData;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async findAll() {
    const returnData = new ReturnData();

    try {
      const lessons = await this.lessonRepository.find();
      if (lessons.length === 0) {
        returnData.error = true;
        returnData.message = 'No Lessons found';
        return returnData;
        // throw new NotFoundException('No Lessons found');
      }
      returnData.error = false;
      returnData.message = 'Success';
      returnData.value = lessons;
      return returnData;
    } catch (error) {
      console.log(error);

      throw error;
    }
  }

  async findOne(id: number) {
    const returnData = new ReturnData();

    try {
      const lesson = await this.lessonRepository.findOneBy({ lessonId: id });

      if (!lesson) {
        returnData.error = true;
        returnData.message = 'No Lesson found for the given Id';
        return returnData;
        // throw new NotFoundException('No Lesson found for the given Id');
      }
      const doubts = await this.doubtService.findByLesson(id);
      returnData.error = false;
      returnData.message = 'Success';
      returnData.value = { ...lesson, doubts: doubts };
      return returnData;
      // return { ...lesson, doubts: doubts };
    } catch (error) {
      console.log(error);

      throw error;
    }
  }

  // helper
  async findByChapter(id: number) {
    const returnData = new ReturnData();

    try {
      const lessons = await this.lessonRepository.findBy({ chapterId: id });
      if (lessons.length === 0) {
        returnData.error = true;
        returnData.message = 'No Lesson found for the given Chapter Id';
        return returnData;
        // throw new NotFoundException('No Lesson found for the given Chapter Id');
      }
      returnData.error = false;
      returnData.message = 'Success';
      returnData.value = lessons;
      return returnData;
    } catch (error) {
      console.log(error);

      throw error;
    }
  }

  async update(id: number, updateLessonDto: UpdateLessonDto) {
    const returnData = new ReturnData();

    try {
      const updateLesson = await this.lessonRepository.update(
        id,
        updateLessonDto,
      );
      if (!updateLesson.affected) {
        returnData.error = true;
        returnData.message = 'Updating lesson failed';
        return returnData;
        // throw new MisdirectedException('Updating lesson failed');
      }
      returnData.error = false;
      returnData.message = 'Success';
      returnData.value = { updatedRows: updateLesson.affected };
      return returnData;
    } catch (error) {
      console.log(error);

      throw error;
    }
  }

  async remove(id: number) {
    const returnData = new ReturnData();

    try {
      const deleteLesson = await this.lessonRepository.delete(id);
      if (!deleteLesson.affected) {
        returnData.error = true;
        returnData.message = 'Deleting lesson failed';
        return returnData;
        // throw new MisdirectedException('Deleting lesson failed');
      }
      returnData.error = false;
      returnData.message = 'Success';
      returnData.value = { updatedRows: deleteLesson.affected };
      return returnData;
      // return deleteLesson;
    } catch (error) {
      console.log(error);

      throw error;
    }
  }

  async changeOrder(payload: ChangeOrderDto, string: string) {
    const returnData = new ReturnData();

    console.log(string);
    var previousOrder;
    try {
      console.log('Log B');

      try {
        const previousLesson: Lesson = await this.lessonRepository.findOneBy({
          lessonId: payload.prevId,
        });
        if (!previousLesson) {
          returnData.error = true;
          returnData.message = "Can't find previous lesson";
          return returnData;
          // throw new MisdirectedException("Can't find previous lesson");
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
