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
  async create(createCommentDto: CreateCommentDto, user: Users) {
    const returnData = new ReturnData();
    console.log({ user });

    const payLoad = { ...createCommentDto, email: user.email, userId: user.id };
    try {
      const comments = await this.commentRepository.save(payLoad);
      if (!comments) {
        returnData.error = true;
        returnData.message = 'Comment not posted';
        return returnData;
        // throw new MisdirectedException('Comment not posted');
      }
      if (createCommentDto.parentType === 'question') {
        await this.updateQuestionCount(createCommentDto.parentId, 'create');
      } else if (createCommentDto.parentType === 'answer') {
        await this.updateAnswerCount(createCommentDto.parentId, 'create');
      } else {
        returnData.error = true;
        returnData.message = 'Invalid parentType';
        return returnData;
        // throw new BadRequestException('Invalid parentType');
      }
      returnData.error = false;
      returnData.message = 'Comment stored Successfully';
      returnData.value = comments;
      return returnData;
      // return comments;
    } catch (error) {
      console.log({ error });
      throw error;
    }
  }

  async updateAnswerCount(id: number, process: string) {
    const returnData = new ReturnData();
    const targetAnswer = await this.answerRepository.findOneBy({
      answerId: id,
    });

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
      returnData.message = 'Comments fetched Successfully';
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
      returnData.message = 'Comment fetched Successfully';
      returnData.value = comment;
      return returnData;
      // return comment;
    } catch (error) {
      console.log({ error });
      throw error;
    }
  }

  async findbyParent(payLoad: FindByParentDto) {
    const comments = await this.commentRepository.find({
      where: {
        parentId: payLoad.parentId,
        parentType: payLoad.parentType,
      },
    });
    return comments;
  }

  //  Check - where it got used
  async findbyAnswer() {
    const comments = await this.commentRepository.find({
      where: {
        parentType: 'answer',
      },
    });
    return comments;
  }

  async update(id: number, updateCommentDto: UpdateCommentDto) {
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
      returnData.message = 'Comment updated Successfully';
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
      returnData.message = 'Comment deleted Successfully';
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
      });
      return { updatedRows: updatedRows.affected };
    } catch (error) {
      console.log({ error });
      throw error;
    }
  }

  // async commentsCount(parentId: number) {
  //   try {
  //     const commentsCount = await this.commentRepository.countBy({ parentId });
  //     if (commentsCount === 0) {
  //       // throw new NotFoundException('No comments found');
  //     }
  //     return commentsCount;
  //   } catch (error) {
  //     console.log({ error });
  //     throw error;
  //   }
  // }
}
