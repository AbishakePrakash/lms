import {
  Inject,
  Injectable,
  InternalServerErrorException,
  MisdirectedException,
  NotFoundException,
} from '@nestjs/common';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Question } from './entities/question.entity';
import { Repository } from 'typeorm';
import { UpdateUserDto } from 'src/users/dto/update-user.dto';
import { CommentsService } from 'src/comments/comments.service';
import { FindByParentDto } from 'src/comments/dto/findByParent.dto';
import { AnswersService } from 'src/answers/answers.service';
import { Users } from 'src/users/entities/user.entity';
import { purifyHtml } from 'src/utils/sanitizeHtml';
import { uploadToS3 } from 'src/utils/awsBucket';

@Injectable()
export class QuestionService {
  constructor(
    @InjectRepository(Question)
    private readonly questionRepository: Repository<Question>,
    @Inject(CommentsService)
    private readonly commentsService: CommentsService,
    @Inject(AnswersService)
    private readonly answersService: AnswersService,
  ) {}

  // async create(createQuestionDto: CreateQuestionDto, user: Users) {
  //   // HTML sanitizing
  //   const sanitizedHtml = purifyHtml(createQuestionDto.richText);
  //   createQuestionDto.richText = sanitizedHtml;

  //   const payLoad = {
  //     ...createQuestionDto,
  //     email: user.email,
  //     userId: user.id,
  //   };

  //   try {
  //     const question = await this.questionRepository.save(payLoad);
  //     if (!question) {
  //       throw new MisdirectedException('Question posting failed');
  //     }
  //     return question;
  //   } catch (error) {
  //     console.log({ error });
  //     return error;
  //   }
  // }

  async create(
    createQuestionDto: CreateQuestionDto,
    user: Users,
    file: Express.Multer.File,
  ) {
    const path = process.env.AWS_BUCKET_PATH;
    // console.log({ path });

    // HTML sanitizing
    const sanitizedHtml = purifyHtml(createQuestionDto.richText);
    // console.log({ createQuestionDto });

    const parsifiedTags = createQuestionDto.tags.split(',');
    createQuestionDto.richText = sanitizedHtml;

    const { tags, ...newDto } = createQuestionDto;
    // console.log({ newDto });

    // Image upload to S3
    try {
      const { buffer, originalname, mimetype } = file;
      const s3Url = await uploadToS3(
        buffer,
        originalname,
        mimetype,
        `${path}/question`,
      );

      if (!s3Url) {
        throw new MisdirectedException('No url returned from S3');
      }
      console.log('File uploaded:', s3Url);

      // Update sanitized HTML & refImage link
      const payLoad = {
        ...newDto,
        email: user.email,
        userId: user.id,
        refImage: s3Url,
        tags: parsifiedTags,
      };

      // Saving question to DB
      try {
        const question = await this.questionRepository.save(payLoad);
        if (!question) {
          throw new MisdirectedException('Question posting failed');
        }
        return question;
      } catch (error) {
        console.log({ error });
        return error;
      }
    } catch (error) {
      console.error('Error uploading file:', error.message);
      return 'File upload failed!';
    }
  }

  async createv2(
    createQuestionDto: CreateQuestionDto,
    user: Users,
    // file: Express.Multer.File,
  ) {
    // HTML sanitizing
    const sanitizedHtml = purifyHtml(createQuestionDto.richText);
    const parsifiedTags = createQuestionDto.tags.split(',');

    createQuestionDto.richText = sanitizedHtml;
    const { tags, ...newDto } = createQuestionDto;

    try {
      const payLoad = {
        ...newDto,
        email: user.email,
        userId: user.id,
        tags: parsifiedTags,
      };

      // Saving question to DB
      try {
        const question = await this.questionRepository.save(payLoad);
        if (!question) {
          throw new MisdirectedException('Question posting failed');
        }
        return question;
      } catch (error) {
        console.log({ error });
        return error;
      }
    } catch (error) {
      console.error('Error uploading file:', error.message);
      return 'File upload failed!';
    }
  }

  async findAll() {
    try {
      const questions = await this.questionRepository.find();
      if (questions.length === 0) {
        throw new NotFoundException('No  questions found');
      }
      return questions;
    } catch (error) {
      // console.log({ error });
      throw error;
    }
  }

  async findOne(id: number) {
    try {
      const question = await this.questionRepository.findOne({
        where: { questionId: id },
      });
      if (!question) {
        throw new NotFoundException('No question found for this Question Id');
      }

      //Inject Answers

      const answers = await this.answersService.findbyParent(
        question.questionId,
      );

      const allComments = await this.commentsService.findbyAnswer();
      //Inject Comments for Answers
      const answersWithComments = answers.map((answer) => {
        const commentsForAnswer = allComments.filter(
          (comment) => comment.parentId === answer.answerId,
        );
        return {
          ...answer,
          comments: commentsForAnswer,
        };
      });

      // Inject Comments for Questions
      const fetchBody: FindByParentDto = {
        parentId: question.questionId,
        parentType: 'question',
      };
      const comments = await this.commentsService.findbyParent(fetchBody);

      const postData = {
        ...question,
        answers: answersWithComments,
        comments: comments,
      };

      return postData;
    } catch (error) {
      console.log({ error });
    }
  }

  async update(id: number, updateQuestionDto: UpdateQuestionDto) {
    const question = await this.findOne(id);

    if (!question) {
      throw new NotFoundException('No question found for this Question Id');
    }

    const tagsArray = updateQuestionDto.tags
      ? updateQuestionDto.tags.split(',').map((tag) => tag.trim())
      : question.tags;

    const payLoad = {
      ...updateQuestionDto,
      tags: tagsArray,
    };

    try {
      const result = await this.questionRepository.update(id, payLoad);

      if (result.affected === 0) {
        throw new MisdirectedException('Question update failed');
      }

      return { updatedRows: result.affected };
    } catch (error) {
      console.error('Error updating question:', error);
      throw new InternalServerErrorException(
        'An unexpected error occurred while updating the question.',
      );
    }
  }

  async remove(id: number) {
    const checkAvailability = await this.findOne(id);
    if (!checkAvailability) {
      throw new NotFoundException('No question found for this Question Id');
    }

    try {
      const deleteQuestion = await this.questionRepository.delete({
        questionId: id,
      });
      if (!deleteQuestion) {
        throw new MisdirectedException('Question deletion failed');
      }
      return { deletedRows: deleteQuestion.affected };
    } catch (error) {
      console.log({ error });
      throw error;
    }
  }

  async upVote(id: number) {
    const checkAvailability = await this.findOne(id);

    if (!checkAvailability) {
      throw new NotFoundException('No question found for this Question Id');
    }

    try {
      const updatedRows = await this.questionRepository.update(id, {
        upvote: checkAvailability.upvote + 1,
      });

      // if (!updatedRows) {

      // }
      return { updatedRows: updatedRows.affected };
    } catch (error) {}
  }

  async downVote(id: number) {
    const checkAvailability = await this.findOne(id);
    if (!checkAvailability) {
      throw new NotFoundException('No question found for this Question Id');
    }

    try {
      const updatedRows = await this.questionRepository.update(id, {
        downvote: checkAvailability.downvote + 1,
      });
      // if (!updatedRows) {

      // }
      return { updatedRows: updatedRows.affected };
    } catch (error) {}
  }
}
