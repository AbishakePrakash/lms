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
import { ReturnData } from 'src/utils/globalValues';
import * as sanitizeHtml from 'sanitize-html';

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
  //      // throw new MisdirectedException('Question posting failed');
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
    // file: Express.Multer.File,
  ) {
    const returnData = new ReturnData();

    // HTML sanitizing
    const sanitizedHtml = purifyHtml(createQuestionDto.richText);
    if (!sanitizedHtml) {
      returnData.error = true;
      returnData.message = 'Richtext Sanitization Failed';
      return returnData;
    } else {
      createQuestionDto.richText = sanitizedHtml.toString();

      const { tags, ...newDto } = createQuestionDto;
      const payLoad = {
        ...newDto,
        email: user.email,
        userId: user.id,
        tags: [],
      };
      // Check Tags
      if (
        createQuestionDto.tags !== undefined &&
        createQuestionDto.tags.length > 0
      ) {
        const parsifiedTags = createQuestionDto.tags.split(',');
        payLoad.tags = parsifiedTags;

        try {
          const question = await this.questionRepository.save(payLoad);
          if (!question) {
            returnData.error = true;
            returnData.message = 'Question posting failed';
            return returnData;
            // throw new MisdirectedException('Question posting failed');
          } else {
            returnData.error = false;
            returnData.message = 'Success';
            returnData.value = question;
            return returnData;
          }
        } catch (error) {
          console.log({ error });
          return error;
        }
      } else {
        returnData.error = true;
        returnData.message = 'Tags undefined';
        return returnData;
      }
    }

    // Image upload to S3
    // try {
    //   const { buffer, originalname, mimetype } = file;
    //   const s3Url = await uploadToS3(
    //     buffer,
    //     originalname,
    //     mimetype,
    //     `${path}/question`,
    //   );

    //   if (!s3Url) {
    //     // throw new MisdirectedException('No url returned from S3');
    //   }
    //   console.log('File uploaded:', s3Url);

    //   Update sanitized HTML & refImage link

    //   Saving question to DB

    // } catch (error) {
    //   console.error('Error uploading file:', error.message);
    //   return 'File upload failed!';
    // }
  }

  async experiment(
    createQuestionDto: CreateQuestionDto,
    user: Users,
    // file: Express.Multer.File,
  ) {
    return new Promise(function (resolve, reject) {
      function checkRichText(richText: string) {
        return new Promise(function (resolve, reject) {
          const minLength = 30;
          const maxLength = 100000;
          if (typeof richText !== 'string' || !richText.trim()) {
            reject('RichText must be a non-empty string');
          } else if (
            richText.length < minLength ||
            richText.length > maxLength
          ) {
            reject(
              `RichText must be between ${minLength} and ${maxLength} characters`,
            );
          } else {
            const textOnly = richText.replace(/<[^>]+>/g, '').trim();
            if (!textOnly) {
              reject(
                'RichText must contain actual content, not just empty tags',
              );
            } else if (/(on\w+=|javascript:)/i.test(richText)) {
              reject(
                'RichText contains potentially unsafe attributes or JavaScript',
              );
            } else {
              const cleanHtml = sanitizeHtml(richText, {
                allowedTags: [
                  'p',
                  'b',
                  'i',
                  'strong',
                  'em',
                  'ul',
                  'ol',
                  'li',
                  'br',
                  'a',
                ],
                allowedAttributes: { a: ['href', 'target'] },
              });
              if (cleanHtml !== richText) {
                reject('RichText contains disallowed HTML tags or attributes');
              } else {
                resolve(cleanHtml);
              }
            }
          }
        });
      }

      function checkTags(tags: string) {
        return new Promise(function (resolve, reject) {
          if (tags.length > 0) {
            const parsifiedTags = tags.split(',');
            resolve(parsifiedTags);
          } else {
            reject('Missing Tags');
          }
        });
      }

      function createQuestion(title, richTextRc, checkTagsRc) {
        return new Promise(async (resolve, reject) => {
          const saveDb = await this.questionRepository.save(
            // question,
            title,
            richTextRc,
            checkTagsRc,
          );

          if (!saveDb) {
            reject('Db operation failed');
          } else {
            resolve(saveDb);
          }
        });
      }

      (function () {
        var returnData = {
          result: {},
          error: 'ok',
        };
        console.log(createQuestionDto);

        if (
          createQuestionDto.title != undefined &&
          // createQuestionDto.question != undefined &&
          createQuestionDto.tags != undefined &&
          createQuestionDto.richText != undefined
        ) {
          checkRichText(createQuestionDto.richText).then(
            function (richTextRc) {
              returnData.result = richTextRc;
              // resolve(returnData);
              checkTags(createQuestionDto.tags).then(
                function (checkTagsRc) {
                  returnData.result = checkTagsRc;
                  // resolve(returnData);
                  createQuestion(
                    // createQuestionDto.question,
                    createQuestionDto.title,
                    richTextRc,
                    checkTagsRc,
                  ).then(
                    function (createQuestionRc) {
                      returnData.result = createQuestionRc;
                      resolve(returnData);
                    },
                    function (createQuestionEr) {
                      returnData.error = createQuestionEr;
                      resolve(returnData);
                    },
                  );
                },
                function (checkTagsEr) {
                  returnData.error = checkTagsEr;
                  resolve(returnData);
                },
              );
            },
            function (richTextEr) {
              returnData.error = richTextEr;
              resolve(returnData);
            },
          );
        } else {
          returnData.error = 'Missing Input';
          resolve(returnData);
        }
      })();
    });
  }

  async findAll() {
    const returnData = new ReturnData();

    try {
      const questions = await this.questionRepository.find();
      if (questions.length === 0) {
        returnData.error = true;
        returnData.message = 'No  questions found';
        return returnData;
        // throw new NotFoundException('No  questions found');
      }
      returnData.error = false;
      returnData.message = 'Success';
      returnData.value = questions;
      return returnData;
    } catch (error) {
      // console.log({ error });
      throw error;
    }
  }

  async findOne(id: number) {
    const returnData = new ReturnData();
    try {
      const question = await this.questionRepository.findOneBy({
        questionId: id,
      });
      if (!question) {
        returnData.error = true;
        returnData.message = 'No  questions found for this Question Id';
        return returnData;
        // throw new NotFoundException('No question found for this Question Id');
      }

      //Inject Answers
      const answers = await this.answersService.findbyParent(
        question.questionId,
      );

      //Inject Comments for Answers
      const allComments = await this.commentsService.findbyAnswer();
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

      returnData.error = false;
      returnData.message = 'Success';
      returnData.value = {
        ...question,
        answers: answersWithComments,
        comments: comments,
      };
      return returnData;
    } catch (error) {
      console.log({ error });
    }
  }

  async update(id: number, updateQuestionDto: UpdateQuestionDto) {
    const returnData = new ReturnData();

    const question = await this.questionRepository.findOneBy({
      questionId: id,
    });
    if (!question) {
      returnData.error = true;
      returnData.message = 'No questions found for this Question Id';
      return returnData;
      // throw new NotFoundException('No question found for this Question Id');
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
        returnData.error = true;
        returnData.message = 'Question update failed';
        return returnData;
        // throw new MisdirectedException('Question update failed');
      }
      returnData.error = false;
      returnData.message = 'Success';
      returnData.value = { updatedRows: result.affected };
      return returnData;
    } catch (error) {
      console.error('Error updating question:', error);
      throw error;
    }
  }

  async remove(id: number) {
    const returnData = new ReturnData();
    const checkAvailability = await this.questionRepository.findOneBy({
      questionId: id,
    });
    if (!checkAvailability) {
      returnData.error = true;
      returnData.message = 'No question found for this Question Id';
      return returnData;
      // throw new NotFoundException('No question found for this Question Id');
    }

    try {
      const deleteQuestion = await this.questionRepository.delete({
        questionId: id,
      });
      if (!deleteQuestion) {
        returnData.error = true;
        returnData.message = 'Question deletion failed';
        return returnData;
        // throw new MisdirectedException('Question deletion failed');
      }
      returnData.error = false;
      returnData.message = 'Success';
      returnData.value = { deletedRows: deleteQuestion.affected };
      return returnData;
      // return { deletedRows: deleteQuestion.affected };
    } catch (error) {
      console.log({ error });
      throw error;
    }
  }

  async upVote(id: number) {
    const returnData = new ReturnData();
    const checkAvailability = await this.questionRepository.findOneBy({
      questionId: id,
    });

    if (!checkAvailability) {
      returnData.error = true;
      returnData.message = 'No question found for this Question Id';
      return returnData;
      // throw new NotFoundException('No question found for this Question Id');
    }

    try {
      const updatedRows = await this.questionRepository.update(id, {
        upvote: checkAvailability.upvote + 1,
      });
      returnData.error = false;
      returnData.message = 'Success';
      returnData.value = { updatedRows: updatedRows.affected };
      return returnData;
    } catch (error) {}
  }

  async downVote(id: number) {
    const returnData = new ReturnData();
    const checkAvailability = await this.questionRepository.findOneBy({
      questionId: id,
    });
    if (!checkAvailability) {
      returnData.error = true;
      returnData.message = 'No question found for this Question Id';
      return returnData;
      // throw new NotFoundException('No question found for this Question Id');
    }

    try {
      const updatedRows = await this.questionRepository.update(id, {
        downvote: checkAvailability.downvote + 1,
      });

      returnData.error = false;
      returnData.message = 'Success';
      returnData.value = { updatedRows: updatedRows.affected };
      return returnData;
    } catch (error) {}
  }
}
