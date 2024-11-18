import {
  Inject,
  Injectable,
  MisdirectedException,
  NotFoundException,
} from '@nestjs/common';
import { CreateAnswerDto } from './dto/create-answer.dto';
import { UpdateAnswerDto } from './dto/update-answer.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Answer } from './entities/answer.entity';
import { Repository } from 'typeorm';
import { CommentsService } from 'src/comments/comments.service';
import { PostData } from 'src/Utils/globalValues';
import { FindByParentDto } from 'src/comments/dto/findByParent.dto';
import { Question } from 'src/question/entities/question.entity';

@Injectable()
export class AnswersService {
  constructor(
    @InjectRepository(Answer)
    private readonly answersRepository: Repository<Answer>,
    @InjectRepository(Question)
    private readonly questionRepository: Repository<Question>,
    @Inject(CommentsService)
    private readonly commentsService: CommentsService,
  ) {}

  async create(createAnswerDto: CreateAnswerDto) {
    try {
      const answer = await this.answersRepository.save(createAnswerDto);
      if (!answer) {
        throw new MisdirectedException('Answer posting failed');
      }

      //Add count to Question Repo
      await this.updateAnswerCount(answer.questionId, 'create');
      return answer;
    } catch (error) {
      console.log({ error });
      throw error;
    }
  }

  async updateAnswerCount(questionId: number, process: string) {
    const targetQuestion = await this.questionRepository.findOneBy({
      questionId: questionId,
    });

    if (!targetQuestion) {
      throw new NotFoundException('No answer found for this Answer Id');
    }

    const answerCount = await this.questionRepository.update(
      targetQuestion.questionId,
      {
        answersCount:
          process === 'create'
            ? targetQuestion.answersCount + 1
            : targetQuestion.answersCount - 1,
      },
    );
  }

  async findAll() {
    try {
      const answers = await this.answersRepository.find();
      if (answers.length === 0) {
        throw new NotFoundException('No Answers found');
      }

      return answers;
    } catch (error) {
      console.log({ error });
      throw error;
    }
  }

  async findOne(id: number) {
    try {
      const answer = await this.answersRepository.findOneBy({ answerId: id });
      if (!answer) {
        throw new NotFoundException('Answer not found');
      }

      const fetchBody: FindByParentDto = {
        parentId: answer.answerId,
        parentType: 'answer',
      };

      const comments = await this.commentsService.findbyParent(fetchBody);

      const postData = {
        data: answer,
        comments: comments,
      };
      return postData;
    } catch (error) {
      console.log({ error });
      throw error;
    }
  }

  async findbyParent(parentId: number) {
    return await this.answersRepository.findBy({ questionId: parentId });
  }

  async update(id: number, updateAnswerDto: UpdateAnswerDto) {
    try {
      const updatedAnswer = await this.answersRepository.update(
        id,
        updateAnswerDto,
      );
      if (!updatedAnswer) {
        throw new MisdirectedException('Answer update failed');
      }
      return { updatedRows: updatedAnswer.affected };
    } catch (error) {
      console.log({ error });
      throw error;
    }
  }

  async remove(id: number) {
    const targetAnswer = await this.findOne(id);

    try {
      const deletedAnswer = await this.answersRepository.delete(id);
      if (!deletedAnswer) {
        throw new MisdirectedException('Answer delete failed');
      }

      //update answercount
      await this.updateAnswerCount(targetAnswer.data.questionId, 'delete');

      return { deletedRows: deletedAnswer.affected };
    } catch (error) {
      console.log({ error });
      throw error;
    }
  }

  async upVote(id: number) {
    const checkAvailability = await this.findOne(id);

    if (!checkAvailability) {
      throw new NotFoundException('No answer found for this Answer Id');
    }

    try {
      const updatedRows = await this.answersRepository.update(id, {
        vote: checkAvailability.data.vote + 1,
      });

      // if (!updatedRows) {

      // }
      return updatedRows;
    } catch (error) {}
  }

  async downVote(id: number) {
    const checkAvailability = await this.findOne(id);
    if (!checkAvailability) {
      throw new NotFoundException('No answer found for this Answer Id');
    }

    try {
      const updatedRows = await this.answersRepository.update(id, {
        vote: checkAvailability.data.vote - 1,
      });
      // if (!updatedRows) {

      // }
      return updatedRows;
    } catch (error) {
      console.log({ error });
      throw error;
    }
  }
}
