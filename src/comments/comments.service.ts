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
    console.log({ user });

    const payLoad = { ...createCommentDto, email: user.email, userId: user.id };
    try {
      const comments = await this.commentRepository.save(payLoad);
      if (!comments) {
        throw new MisdirectedException('Comment not posted');
      }
      if (createCommentDto.parentType === 'question') {
        await this.updateQuestionCount(createCommentDto.parentId, 'create');
      } else if (createCommentDto.parentType === 'answer') {
        await this.updateAnswerCount(createCommentDto.parentId, 'create');
      } else {
        throw new BadRequestException('Invalid parentType');
      }
      return comments;
    } catch (error) {
      console.log({ error });
      throw error;
    }
  }

  async updateAnswerCount(id: number, process: string) {
    const targetAnswer = await this.answerRepository.findOneBy({
      answerId: id,
    });

    if (!targetAnswer) {
      throw new NotFoundException('No answer found for this AnswerId');
    }

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
        throw new NotFoundException('Answer not found');
      }
    } catch (error) {
      console.log({ error });
      throw error;
    }
  }

  async updateQuestionCount(id: number, process: string) {
    const targetQuestion = await this.questionRepository.findOneBy({
      questionId: id,
    });

    if (!targetQuestion) {
      throw new NotFoundException('No question found for this questionId');
    }
    try {
      const updatedQuestion = await this.questionRepository.update(id, {
        commentsCount:
          process === 'create'
            ? targetQuestion.commentsCount + 1
            : targetQuestion.commentsCount - 1,
      });
      if (!updatedQuestion) {
        throw new NotFoundException('Question not found');
      }
    } catch (error) {
      console.log({ error });
      throw error;
    }
  }

  async findAll() {
    try {
      const comments = await this.commentRepository.find();
      if (comments.length === 0) {
        throw new NotFoundException('No comments found');
      }
      return comments;
    } catch (error) {
      console.log({ error });
      throw error;
    }
  }

  async findOne(id: number) {
    try {
      const comment = await this.commentRepository.findOneBy({ commentId: id });
      if (!comment) {
        throw new NotFoundException('No comment found for this ID');
      }
      return comment;
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

  async findbyAnswer() {
    const comments = await this.commentRepository.find({
      where: {
        parentType: 'answer',
      },
    });
    return comments;
  }

  async update(id: number, updateCommentDto: UpdateCommentDto) {
    const checkAvailability = await this.findOne(id);

    if (!checkAvailability) {
      throw new NotFoundException('No comment found for this Comment Id');
    }
    try {
      const updatedComment = await this.commentRepository.update(
        id,
        updateCommentDto,
      );
      if (!updatedComment) {
        throw new MisdirectedException('Comment not updated');
      }
      return { updatedRows: updatedComment.affected };
    } catch (error) {
      console.log({ error });
      return error;
    }
  }

  async remove(id: number) {
    const checkAvailability = await this.findOne(id);

    if (!checkAvailability) {
      throw new NotFoundException('No comment found for this Comment Id');
    }

    try {
      const deletedComment = await this.commentRepository.delete({
        commentId: id,
      });
      if (!deletedComment) {
        throw new MisdirectedException('Comment not deleted');
      }
      if (checkAvailability.parentType === 'question') {
        await this.updateQuestionCount(checkAvailability.parentId, 'delete');
      } else if (checkAvailability.parentType === 'answer') {
        await this.updateAnswerCount(checkAvailability.parentId, 'delete');
      } else {
        throw new BadRequestException('Invalid parentType');
      }
      return { deletedRows: deletedComment.affected };
    } catch (error) {
      console.log({ error });
      throw error;
    }
  }

  async likes(id: number) {
    const checkAvailability = await this.findOne(id);

    if (!checkAvailability) {
      throw new NotFoundException('No comment found for this Comment Id');
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

  async commentsCount(parentId: number) {
    try {
      const commentsCount = await this.commentRepository.countBy({ parentId });
      if (commentsCount === 0) {
        throw new NotFoundException('No comments found');
      }
      return commentsCount;
    } catch (error) {
      console.log({ error });
      throw error;
    }
  }
}
