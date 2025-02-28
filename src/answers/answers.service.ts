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
import { FindByParentDto } from 'src/comments/dto/findByParent.dto';
import { Question } from 'src/question/entities/question.entity';
import { Users } from 'src/users/entities/user.entity';
import { ReturnData } from 'src/utils/globalValues';
import { CreateAnswerPayload } from './dto/create-answer.payLoad';
import { CreateQuestionPayload } from 'src/question/dto/create-question.dto copy';
import { purifyHtml } from 'src/utils/sanitizeHtml';

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

  async create(createAnswerDto: CreateAnswerDto, user: Users) {
    const returnData = new ReturnData();

    // console.log({ user });

    const payLoad = { ...createAnswerDto, email: user.email, userId: user.id };
    try {
      const answer = await this.answersRepository.save(payLoad);
      if (!answer) {
        returnData.error = true;
        returnData.message = 'Answer posting failed';
        // throw new MisdirectedException('Answer posting failed');
      }

      //Add count to Question Repo
      await this.updateAnswerCount(answer.questionId, 'create');
      returnData.error = false;
      returnData.message = 'Success';
      returnData.value = answer;
      return returnData;
    } catch (error) {
      console.log({ error });
      throw error;
    }
  }

  async createV2(
    createAnswerDto: CreateAnswerDto,
    user: Users,
  ): Promise<ReturnData> {
    return new Promise(async (resolve) => {
      var answersRepositoryX = this.answersRepository;
      var questionRepositoryX = this.questionRepository;

      // Check Inputs
      async function checkInputs(createAnswerDto: CreateAnswerDto) {
        if (
          createAnswerDto.answer !== undefined &&
          // createAnswerDto.tags !== undefined &&
          createAnswerDto.questionId !== undefined
        ) {
          return true;
        } else {
          throw 'Missing Inputs';
        }
      }

      // Check Availability
      async function checkQuestion(questionId: number) {
        try {
          const question = await questionRepositoryX.findOneBy({ questionId });
          console.log({ question });

          if (question) {
            return true;
          } else {
            throw 'No question found for this Id';
          }
        } catch (error) {
          throw 'No question found for this Id';
        }
      }

      // Html Sanitizing
      async function sanitizeRichText(richText: string) {
        if (!richText) return '';

        const sanitizedRichText = purifyHtml(richText);

        if (sanitizedRichText) {
          return sanitizedRichText;
        } else {
          throw 'Richtext Sanitization Failed';
        }
      }

      // Create Answer
      async function postAnswer(createAnswerPayload: CreateAnswerPayload) {
        const postedAnswer = await answersRepositoryX.save(createAnswerPayload);

        if (postedAnswer) {
          return postedAnswer;
        } else {
          throw 'Answer posting failed';
        }
      }

      // Update count in QuestionRepository
      async function updateAnswerCount(questionId: number) {
        const targetQuestion = await questionRepositoryX.findOneBy({
          questionId: questionId,
        });

        const response = await questionRepositoryX.update(questionId, {
          answersCount: targetQuestion.answersCount + 1,
        });

        if (response && response.affected === 1) {
          return true;
        } else {
          throw 'Answer count updating failed';
        }
      }

      try {
        const checkedInputs = await checkInputs(createAnswerDto);

        const sanitizedRichText = await sanitizeRichText(
          createAnswerDto.richText,
        );
        const checkAvailability = await checkQuestion(
          createAnswerDto.questionId,
        );

        const payLoad: CreateAnswerPayload = {
          userId: user.id,
          email: user.email,
          questionId: createAnswerDto.questionId,
          answer: createAnswerDto.answer,
          richText: sanitizedRichText,
        };
        const postAnswerRes: Answer = await postAnswer(payLoad);
        const updateAnswerCountRes = await updateAnswerCount(
          postAnswerRes.questionId,
        );

        resolve({
          error: false,
          value: postAnswerRes,
          message: 'Success',
        });
      } catch (error) {
        console.log({ error });
        resolve({ error: true, value: null, message: error });
      }
    });
  }

  async updateAnswerCount(questionId: number, process: string) {
    const targetQuestion = await this.questionRepository.findOneBy({
      questionId: questionId,
    });

    if (!targetQuestion) {
      return null;
    }

    const response = await this.questionRepository.update(questionId, {
      answersCount:
        process === 'create'
          ? targetQuestion.answersCount + 1
          : targetQuestion.answersCount - 1,
    });

    if (response && response.affected === 1) {
      return true;
    } else {
      return null;
    }
  }

  async findAll() {
    const returnData = new ReturnData();

    try {
      const answers = await this.answersRepository.find();
      if (answers.length === 0) {
        returnData.error = true;
        returnData.message = 'No Answers found';
        return returnData;
        // throw new NotFoundException('No Answers found');
      }
      returnData.error = false;
      returnData.message = 'Success';
      returnData.value = answers;
      return returnData;
    } catch (error) {
      console.log({ error });
      throw error;
    }
  }

  async findOne(id: number) {
    const returnData = new ReturnData();

    try {
      const answer: Answer = await this.answersRepository.findOneBy({
        answerId: id,
      });
      if (!answer) {
        returnData.error = true;
        returnData.message = 'Answer not found';
        return returnData;
        // throw new NotFoundException('Answer not found');
      }

      const fetchBody: FindByParentDto = {
        parentId: answer.answerId,
        parentType: 'answer',
      };

      const comments = await this.commentsService.findbyParent(fetchBody);
      returnData.error = false;
      returnData.message = 'Success';
      returnData.value = { ...answer, comments: comments };

      return returnData;
    } catch (error) {
      console.log({ error });
      throw error;
    }
  }

  async findbyParent(parentId: number) {
    try {
      const answers = await this.answersRepository.findBy({
        questionId: parentId,
      });

      // console.log(answers);
      return answers;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async update(id: number, updateAnswerDto: UpdateAnswerDto) {
    const returnData = new ReturnData();
    const targetAnswer = await this.answersRepository.findOneBy({
      answerId: id,
    });

    if (!targetAnswer) {
      returnData.error = true;
      returnData.message = 'No answer found';
      return returnData;
      // throw new MisdirectedException('Answer delete failed');
    }
    try {
      const updatedAnswer = await this.answersRepository.update(
        id,
        updateAnswerDto,
      );
      if (!updatedAnswer) {
        returnData.error = true;
        returnData.message = 'Answer update failed';
        return returnData;
        // throw new MisdirectedException('Answer update failed');
      }
      returnData.error = false;
      returnData.message = 'Success';
      returnData.value = { updatedRows: updatedAnswer.affected };
      return returnData;
      // return { updatedRows: updatedAnswer.affected };
    } catch (error) {
      console.log({ error });
      throw error;
    }
  }

  async remove(id: number) {
    const returnData = new ReturnData();
    const targetAnswer = await this.answersRepository.findOneBy({
      answerId: id,
    });

    if (!targetAnswer) {
      returnData.error = true;
      returnData.message = 'No answer found';
      return returnData;
      // throw new MisdirectedException('Answer delete failed');
    }

    try {
      const deletedAnswer = await this.answersRepository.delete(id);
      if (!deletedAnswer) {
        returnData.error = true;
        returnData.message = 'Answer delete failed';
        return returnData;
        // throw new MisdirectedException('Answer delete failed');
      }

      //update answercount
      await this.updateAnswerCount(targetAnswer.questionId, 'delete');
      returnData.error = false;
      returnData.message = 'Success';
      returnData.value = { deletedRows: deletedAnswer.affected };
      return returnData;

      // return { deletedRows: deletedAnswer.affected };
    } catch (error) {
      console.log({ error });
      throw error;
    }
  }

  async upVote(id: number) {
    const returnData = new ReturnData();
    const checkAvailability = await this.answersRepository.findOneBy({
      answerId: id,
    });

    if (!checkAvailability) {
      returnData.error = true;
      returnData.message = 'No answer found for this Answer Id';
      return returnData;
      // throw new NotFoundException('No answer found for this Answer Id');
    }

    try {
      const updatedRows = await this.answersRepository.update(id, {
        upvote: checkAvailability.upvote + 1,
      });
      returnData.error = false;
      returnData.message = 'Success';
      returnData.value = { updatedRows: updatedRows.affected };
      return returnData;
    } catch (error) {
      console.log({ error });
      throw error;
    }
  }

  async downVote(id: number) {
    const returnData = new ReturnData();
    const checkAvailability = await this.answersRepository.findOneBy({
      answerId: id,
    });
    if (!checkAvailability) {
      returnData.error = true;
      returnData.message = 'No answer found for this Answer Id';
      return returnData;
      // throw new NotFoundException('No answer found for this Answer Id');
    }

    try {
      const updatedRows = await this.answersRepository.update(id, {
        downvote: checkAvailability.downvote + 1,
      });
      returnData.error = false;
      returnData.message = 'Success';
      returnData.value = { updatedRows: updatedRows.affected };
      return returnData;
    } catch (error) {
      console.log({ error });
      throw error;
    }
  }
}
