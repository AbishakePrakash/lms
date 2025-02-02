import {
  Inject,
  Injectable,
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
    // HTML sanitizing
    const sanitizedHtml = purifyHtml(createQuestionDto.richText);
    createQuestionDto.richText = sanitizedHtml;

    console.log({ createQuestionDto });

    // Image upload to S3
    // try {
    //   const { buffer, originalname, mimetype } = file;
    //   const s3Url = await uploadToS3(buffer, originalname, mimetype, 'profile');

    //   if (!s3Url) {
    //     throw new MisdirectedException('No url returned from S3');
    //   }
    //   console.log('File uploaded:', s3Url);

    //   // Update sanitized HTML & refImage link
    //   const payLoad = {
    //     ...createQuestionDto,
    //     email: user.email,
    //     userId: user.id,
    //     refImage: s3Url,
    //   };

    //   // Saving question to DB
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
    // } catch (error) {
    //   console.error('Error uploading file:', error.message);
    //   return 'File upload failed!';
    // }
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

      // Inject Comments
      const fetchBody: FindByParentDto = {
        parentId: question.questionId,
        parentType: 'question',
      };
      const comments = await this.commentsService.findbyParent(fetchBody);

      const postData = {
        ...question,
        answers: answers,
        comments: comments,
      };

      return postData;
    } catch (error) {
      console.log({ error });
    }
  }

  async update(id: number, updateQuestionDto: UpdateQuestionDto) {
    const checkAvailability = await this.findOne(id);
    if (!checkAvailability) {
      throw new NotFoundException('No question found for this Question Id');
    }

    try {
      const updateQuestion = await this.questionRepository.update(
        id,
        updateQuestionDto,
      );
      if (!updateQuestion) {
        throw new MisdirectedException('Question update failed');
      }
      return { updatedRows: updateQuestion.affected };
    } catch (error) {
      console.log({ error });
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
    }
    return `This action removes a #${id} question`;
  }

  async upVote(id: number) {
    const checkAvailability = await this.findOne(id);

    if (!checkAvailability) {
      throw new NotFoundException('No question found for this Question Id');
    }

    try {
      const updatedRows = await this.questionRepository.update(id, {
        vote: checkAvailability.vote + 1,
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
        vote: checkAvailability.vote - 1,
      });
      // if (!updatedRows) {

      // }
      return { updatedRows: updatedRows.affected };
    } catch (error) {}
  }
}
