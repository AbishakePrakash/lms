import {
  BadRequestException,
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

@Injectable()
export class LessonService {
  constructor(
    @InjectRepository(Lesson)
    private readonly lessonRepository: Repository<Lesson>,
  ) {}

  async create(createLessonDto: CreateLessonDto) {
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

    try {
      const lesson = await this.lessonRepository.save(createLessonDto);
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
      return lesson;
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

  async changeOrder(payload: ChangeOrderDto) {
    try {
      const previousLesson: Lesson = await this.findOne(payload.prevId);
      const previousOrder = previousLesson.order;

      console.log({ previousOrder });

      const nextLesson = await this.lessonRepository
        .createQueryBuilder('lesson')
        .where('lesson.order > :previousOrder', { previousOrder })
        .orderBy('lesson.order', 'ASC')
        .select(['lesson.lessonId', 'lesson.order'])
        .getOne();

      if (!nextLesson) {
        throw new BadRequestException('No next lesson found');
      }

      const newOrder = midGround(previousOrder, nextLesson.order);

      const returnData = {
        prevId: previousLesson.lessonId,
        prevOrder: previousOrder,
        nextOrder: nextLesson.order,
        nextId: nextLesson.lessonId,
        newOrder: newOrder,
      };

      log(returnData);

      const updateLessonDto: UpdateLessonDto = {
        order: newOrder,
      };

      const updateOrder = await this.update(payload.lessonId, updateLessonDto);

      return updateOrder;
    } catch (error) {
      console.log(2);
      throw error;
    }
  }
}
