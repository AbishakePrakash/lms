import {
  BadRequestException,
  Injectable,
  MisdirectedException,
  NotFoundException,
} from '@nestjs/common';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Comment } from './entities/comment.entity';
import { Repository } from 'typeorm';
import { Answer } from 'src/answers/entities/answer.entity';
import { UpdateAnswerDto } from 'src/answers/dto/update-answer.dto';
import { Question } from 'src/question/entities/question.entity';
import { UpdateQuestionDto } from 'src/question/dto/update-question.dto';
import { CreateAnswerDto } from 'src/answers/dto/create-answer.dto';
import { FindByParentDto } from './dto/findByParent.dto';
import { Users } from 'src/users/entities/user.entity';
import { ReturnData } from 'src/utils/globalValues';
import { CreateCommentPayload } from './dto/create-comment.payload';
import * as moment from 'moment';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,
    @InjectRepository(Answer)
    private readonly answerRepository: Repository<Answer>,
    @InjectRepository(Question)
    private readonly questionRepository: Repository<Question>,
  ) {}

  async createV2(
    createCommentDto: CreateCommentDto,
    user: Users,
  ): Promise<ReturnData> {
    return new Promise(async (resolve) => {
      var answerRepositoryX = this.answerRepository;
      var questionRepositoryX = this.questionRepository;
      var commentRepositoryX = this.commentRepository;

      // Check Inputs
      async function checkInputs(createCommentDto: CreateCommentDto) {
        if (
          createCommentDto.parentId !== undefined &&
          createCommentDto.parentType !== undefined &&
          createCommentDto.comment !== undefined
        ) {
          return createCommentDto;
        } else {
          throw 'Missing Inputs';
        }
      }

      // Check Availability
      async function checkParent(checkedInputs: CreateCommentDto) {
        try {
          if (createCommentDto.parentType === 'question') {
            const checkAvailability = await questionRepositoryX.findOneBy({
              questionId: createCommentDto.parentId,
            });
            if (checkAvailability) {
              return checkAvailability;
            } else {
              throw 'No Question found for this Question Id';
            }
          } else if (createCommentDto.parentType === 'answer') {
            const checkAvailability = await answerRepositoryX.findOneBy({
              answerId: createCommentDto.parentId,
            });
            if (checkAvailability) {
              return checkAvailability;
            } else {
              throw 'No Answer found for this Answer Id';
            }
          } else {
            throw 'Invalid parentType';
          }
        } catch (error) {
          throw error;
        }
      }

      // Create Answer
      async function postComment(
        createCommentPayload: CreateCommentPayload,
      ): Promise<Comment> {
        const postedComment =
          await commentRepositoryX.save(createCommentPayload);

        if (postedComment) {
          return postedComment;
        } else {
          throw 'Comment posting failed';
        }
      }

      // Update Comments count in Question
      async function updateQuestionCount(targetQuestion: Question) {
        try {
          const updatedQuestion = await questionRepositoryX.update(
            targetQuestion.questionId,
            {
              commentsCount: targetQuestion.commentsCount + 1,
            },
          );
          if (updatedQuestion) {
            return updatedQuestion;
          } else {
            throw 'Question Table not updated';
          }
        } catch (error) {
          console.log({ error });
          throw error;
        }
      }

      // Update Comments count in Answer
      async function updateAnswerCount(targetAnswer: Answer) {
        try {
          const updatedAnswer = await answerRepositoryX.update(
            targetAnswer.answerId,
            {
              commentsCount: targetAnswer.commentsCount + 1,
            },
          );
          if (updatedAnswer) {
            return updatedAnswer;
          } else {
            throw 'Answer table not updated';
          }
        } catch (error) {
          console.log({ error });
          throw error;
        }
      }

      try {
        const epoch = moment().valueOf();
        console.log({ epoch });

        const checkedInputs = await checkInputs(createCommentDto);
        const checkedParent = await checkParent(checkedInputs);

        const createCommentPayload: CreateCommentPayload = {
          userId: user.id,
          email: user.email,
          parentType: checkedInputs.parentType,
          parentId: checkedInputs.parentId,
          comment: checkedInputs.comment,
          createdAtV2: moment().valueOf().toString(),
          updatedAtV2: moment().valueOf().toString(),
        };

        const postCommentRes = await postComment(createCommentPayload);
        console.log({ postCommentRes });

        if (postCommentRes.parentType === 'question') {
          const updatedQuestionRes = await updateQuestionCount(
            checkedParent as Question,
          );
        } else {
          const updatedAnswerRes = await updateAnswerCount(
            checkedParent as Answer,
          );
        }

        resolve({
          error: false,
          value: postCommentRes,
          message: 'Success',
        });
      } catch (error) {
        console.log({ error });
        resolve({ error: true, value: null, message: error });
      }
    });
  }

  async findAll() {
    const returnData = new ReturnData();
    try {
      const comments = await this.commentRepository.find();
      if (comments.length === 0) {
        returnData.error = true;
        returnData.message = 'No Comments found';
        returnData.value = comments;
        return returnData;
        // throw new NotFoundException('No comments found');
      }

      returnData.error = false;
      returnData.message = 'Success';
      returnData.value = comments;
      return returnData;
      // return comments;
    } catch (error) {
      console.log({ error });
      throw error;
    }
  }

  async findOne(id: number) {
    const returnData = new ReturnData();

    try {
      const comment = await this.commentRepository.findOneBy({ commentId: id });
      if (!comment) {
        returnData.error = true;
        returnData.message = 'No comment found for this ID';
        return returnData;
        // throw new NotFoundException('No comment found for this ID');
      }

      returnData.error = false;
      returnData.message = 'Success';
      returnData.value = comment;
      return returnData;
      // return comment;
    } catch (error) {
      console.log({ error });
      throw error;
    }
  }

  async update(id: number, updateCommentDto: UpdateCommentDto) {
    const returnData = new ReturnData();
    updateCommentDto.updatedAtV2 = moment().valueOf().toString();
    const checkAvailability = await this.commentRepository.findOneBy({
      commentId: id,
    });
    if (!checkAvailability) {
      returnData.error = true;
      returnData.message = 'No comment found for this comment Id';
      return returnData;
      // throw new NotFoundException('No comment found for this Comment Id');
    }
    try {
      const updatedComment = await this.commentRepository.update(
        id,
        updateCommentDto,
      );
      if (!updatedComment) {
        returnData.error = true;
        returnData.message = 'Comment not updated';
        return returnData;
        // throw new MisdirectedException('Comment not updated');
      }
      returnData.error = false;
      returnData.message = 'Success';
      returnData.value = { updatedRows: updatedComment.affected };
      return returnData;
      // return { updatedRows: updatedComment.affected };
    } catch (error) {
      console.log({ error });
      return error;
    }
  }

  async remove(id: number) {
    const returnData = new ReturnData();

    const checkAvailability = await this.commentRepository.findOneBy({
      commentId: id,
    });
    if (!checkAvailability) {
      returnData.error = true;
      returnData.message = 'No comment found for this comment Id';
      return returnData;
      // throw new NotFoundException('No comment found for this Comment Id');
    }

    try {
      const deletedComment = await this.commentRepository.delete({
        commentId: id,
      });
      if (!deletedComment) {
        returnData.error = true;
        returnData.message = 'Comment not deleted';
        return returnData;
        // throw new MisdirectedException('Comment not deleted');
      }
      if (checkAvailability.parentType === 'question') {
        await this.updateQuestionCount(checkAvailability.parentId, 'delete');
      } else if (checkAvailability.parentType === 'answer') {
        await this.updateAnswerCount(checkAvailability.parentId, 'delete');
      } else {
        returnData.error = true;
        returnData.message = 'Invalid parentType';
        return returnData;
        // throw new BadRequestException('Invalid parentType');
      }
      returnData.error = false;
      returnData.message = 'Success';
      returnData.value = { updatedRows: deletedComment.affected };
      return returnData;
      // return { deletedRows: deletedComment.affected };
    } catch (error) {
      console.log({ error });
      throw error;
    }
  }

  async likes(id: number) {
    const returnData = new ReturnData();
    const checkAvailability = await this.commentRepository.findOneBy({
      commentId: id,
    });
    if (!checkAvailability) {
      returnData.error = true;
      returnData.message = 'No comment found for this comment Id';
      return returnData;
      // throw new NotFoundException('No comment found for this Comment Id');
    }

    try {
      const updatedRows = await this.commentRepository.update(id, {
        likes: checkAvailability.likes + 1,
        updatedAtV2: moment().valueOf().toString(),
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

  // helper
  async findbyParent(payLoad: FindByParentDto) {
    const comments = await this.commentRepository.find({
      where: {
        parentId: payLoad.parentId,
        parentType: payLoad.parentType,
      },
    });
    comments?.map((item) => {
      item.createdAtV2 = new Date(Number(item.createdAtV2)).toString();
      item.updatedAtV2 = new Date(Number(item.updatedAtV2)).toString();
    });
    return comments;
  }

  async findbyAnswer() {
    const comments = await this.commentRepository.find({
      where: {
        parentType: 'answer',
      },
    });
    comments?.map((item) => {
      item.createdAtV2 = new Date(Number(item.createdAtV2)).toString();
      item.updatedAtV2 = new Date(Number(item.updatedAtV2)).toString();
    });
    return comments;
  }

  async updateAnswerCount(id: number, process: string) {
    const returnData = new ReturnData();
    const targetAnswer = await this.answerRepository.findOneBy({
      answerId: id,
    });

    // console.log({ targetAnswer });

    // return targetAnswer;

    try {
      const updatedAnswer = await this.answerRepository.update(
        targetAnswer.answerId,
        {
          commentsCount:
            process === 'create'
              ? targetAnswer.commentsCount + 1
              : targetAnswer.commentsCount - 1,
        },
      );
      if (!updatedAnswer) {
        returnData.error = true;
        returnData.message = 'Answer count not updated';
        return returnData;

        // throw new NotFoundException('Answer not found');
      }
    } catch (error) {
      console.log({ error });
      throw error;
    }
  }

  async updateQuestionCount(id: number, process: string) {
    const returnData = new ReturnData();

    const targetQuestion = await this.questionRepository.findOneBy({
      questionId: id,
    });

    try {
      const updatedQuestion = await this.questionRepository.update(id, {
        commentsCount:
          process === 'create'
            ? targetQuestion.commentsCount + 1
            : targetQuestion.commentsCount - 1,
      });
      if (!updatedQuestion) {
        returnData.error = true;
        returnData.message = 'Question count not updated';
        return returnData;
        // throw new NotFoundException('Question not found');
      }
    } catch (error) {
      console.log({ error });
      throw error;
    }
  }

  //Left-out Methods
  async create(createCommentDto: CreateCommentDto, user: Users) {
    const returnData = new ReturnData();

    if (createCommentDto.parentType === 'question') {
      const checkAvailability = await this.questionRepository.findOneBy({
        questionId: createCommentDto.parentId,
      });
      if (!checkAvailability) {
        returnData.error = true;
        returnData.message = 'No question found for this Parent Id';
        return returnData;
      }
    } else if (createCommentDto.parentType === 'answer') {
      const checkAvailability = await this.answerRepository.findOneBy({
        answerId: createCommentDto.parentId,
      });
      if (!checkAvailability) {
        returnData.error = true;
        returnData.message = 'No answer found for this Parent Id';
        return returnData;
      }
    } else {
      returnData.error = true;
      returnData.message = 'Invalid parentType';
      return returnData;
    }

    const payLoad = { ...createCommentDto, email: user.email, userId: user.id };

    try {
      const comments = await this.commentRepository.save(payLoad);
      if (!comments) {
        returnData.error = true;
        returnData.message = 'Comment not posted';
        return returnData;
      }

      if (createCommentDto.parentType === 'question') {
        await this.updateQuestionCount(createCommentDto.parentId, 'create');
      } else if (createCommentDto.parentType === 'answer') {
        await this.updateAnswerCount(createCommentDto.parentId, 'create');
      }

      returnData.error = false;
      returnData.message = 'Success';
      returnData.value = comments;
      return returnData;
    } catch (error) {
      console.log({ error });
      throw error;
    }
  }

  async commentsCount(parentId: number) {
    try {
      const commentsCount = await this.commentRepository.countBy({ parentId });
      if (commentsCount === 0) {
        // throw new NotFoundException('No comments found');
      }
      return commentsCount;
    } catch (error) {
      console.log({ error });
      throw error;
    }
  }
}
