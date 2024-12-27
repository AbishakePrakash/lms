import {
  Injectable,
  MisdirectedException,
  NotFoundException,
} from '@nestjs/common';
import { CreateQuizDto } from './dto/create-quiz.dto';
import { UpdateQuizDto } from './dto/update-quiz.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Quiz } from './entities/quiz.entity';
import { Repository } from 'typeorm';

@Injectable()
export class QuizService {
  constructor(
    @InjectRepository(Quiz)
    private readonly quizRepository: Repository<Quiz>,
  ) {}

  async create(createQuizDto: CreateQuizDto, user) {
    try {
      const quiz = await this.quizRepository.save(createQuizDto);
      if (!quiz) {
        throw new MisdirectedException('Quiz not created');
      }
      return quiz;
    } catch (error) {
      throw error;
    }
  }

  async findAll() {
    try {
      const quizes = await this.quizRepository.find();
      if (quizes.length === 0) {
        throw new NotFoundException('No Quizes found');
      }
      return quizes;
    } catch (error) {
      throw error;
    }
  }

  async findOne(id: number) {
    try {
      const quiz = await this.quizRepository.findOneBy({ quizId: id });
      if (!quiz) {
        throw new NotFoundException('No quiz found for the given quizId');
      }
      return quiz;
    } catch (error) {
      throw error;
    }
  }

  async findByParent(courseId: number, chapterId: number) {
    try {
      const quizes = await this.quizRepository.findBy({
        courseId: courseId,
        chapterId: chapterId,
      });
      if (quizes.length === 0) {
        throw new NotFoundException(
          'No quizes found for the given parent details',
        );
      }
      return quizes;
    } catch (error) {
      throw error;
    }
  }

  async update(id: number, updateQuizDto: UpdateQuizDto) {
    try {
      const updatedQuiz = await this.quizRepository.update(id, updateQuizDto);
      if (updatedQuiz.affected) {
        throw new MisdirectedException('Quiz not updated');
      }
      return updatedQuiz;
    } catch (error) {
      throw error;
    }
  }

  async remove(id: number) {
    try {
      const deletedQuiz = await this.quizRepository.delete(id);
      if (deletedQuiz.affected) {
        throw new MisdirectedException('Quiz not deleted');
      }
      return deletedQuiz;
    } catch (error) {
      throw error;
    }
  }
}
