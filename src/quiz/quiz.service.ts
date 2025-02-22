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
import { Users } from 'src/users/entities/user.entity';
import { ReturnData } from 'src/utils/globalValues';

@Injectable()
export class QuizService {
  constructor(
    @InjectRepository(Quiz)
    private readonly quizRepository: Repository<Quiz>,
  ) {}

  async create(createQuizDto: CreateQuizDto, user: Users) {
    const returnData = new ReturnData();

    createQuizDto.authorId = user.id;
    try {
      const quiz = await this.quizRepository.save(createQuizDto);
      if (!quiz) {
        returnData.error = true;
        returnData.message = 'Quiz not created';
        return returnData;
        // throw new MisdirectedException('Quiz not created');
      }
      returnData.error = false;
      returnData.message = 'Success';
      returnData.value = quiz;
      return returnData;
    } catch (error) {
      console.log(error);

      throw error;
    }
  }

  async findAll() {
    const returnData = new ReturnData();

    try {
      const quizes = await this.quizRepository.find();
      if (quizes.length === 0) {
        returnData.error = true;
        returnData.message = 'No Quizes found';
        return returnData;
        // throw new NotFoundException('No Quizes found');
      }
      returnData.error = false;
      returnData.message = 'Success';
      returnData.value = quizes;
      return returnData;
    } catch (error) {
      console.log(error);

      throw error;
    }
  }

  async findOne(id: number) {
    const returnData = new ReturnData();

    try {
      const quiz = await this.quizRepository.findOneBy({ quizId: id });
      if (!quiz) {
        returnData.error = true;
        returnData.message = 'No quiz found for the given quizId';
        return returnData;
        // throw new NotFoundException('No quiz found for the given quizId');
      }
      returnData.error = false;
      returnData.message = 'Success';
      returnData.value = quiz;
      return returnData;
      // return quiz;
    } catch (error) {
      console.log(error);

      throw error;
    }
  }

  async findByParent(courseId: number, chapterId: number) {
    const returnData = new ReturnData();

    try {
      const quizes = await this.quizRepository.findBy({
        courseId: courseId,
        chapterId: chapterId,
      });
      if (quizes.length === 0) {
        returnData.error = true;
        returnData.message = 'No quizes found for the given parent details';
        return returnData;
        // throw new NotFoundException('No quizes found for the given parent details');
      }
      returnData.error = false;
      returnData.message = 'Success';
      returnData.value = quizes;
      return returnData;
    } catch (error) {
      console.log(error);

      throw error;
    }
  }

  async update(id: number, updateQuizDto: UpdateQuizDto) {
    const returnData = new ReturnData();

    try {
      const updatedQuiz = await this.quizRepository.update(id, updateQuizDto);
      if (updatedQuiz.affected) {
        returnData.error = true;
        returnData.message = 'Quiz not updated';
        return returnData;
        // throw new MisdirectedException('Quiz not updated');
      }
      returnData.error = false;
      returnData.message = 'Success';
      returnData.value = { updatedRows: updatedQuiz.affected };
      return returnData;
    } catch (error) {
      console.log(error);

      throw error;
    }
  }

  async remove(id: number) {
    const returnData = new ReturnData();

    try {
      const deletedQuiz = await this.quizRepository.delete(id);
      if (deletedQuiz.affected) {
        returnData.error = true;
        returnData.message = 'Quiz not updated';
        return returnData;
        // throw new MisdirectedException('Quiz not deleted');
      }
      returnData.error = false;
      returnData.message = 'Success';
      returnData.value = { updatedRows: deletedQuiz.affected };
      return returnData;
    } catch (error) {
      console.log(error);

      throw error;
    }
  }
}
