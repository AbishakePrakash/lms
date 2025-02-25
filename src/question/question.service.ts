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
import { Answer } from 'src/answers/entities/answer.entity';
import { Comment } from 'src/comments/entities/comment.entity';
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
import { CreateQuestionPayload } from './dto/create-question.dto copy';

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

  async createV2(
    createQuestionDto: CreateQuestionDto,
    user: Users,
  ): Promise<ReturnData> {
    return new Promise(async (resolve) => {
      var questionRepositoryX = this.questionRepository;

      // Check Inputs
      async function checkInputs(createQuestionDto: CreateQuestionDto) {
        if (
          createQuestionDto.title !== undefined &&
          // createQuestionDto.tags !== undefined &&
          createQuestionDto.richText !== undefined
        ) {
          return true;
        } else {
          throw 'Missing Inputs';
        }
      }

      // Html Sanitizing
      async function sanitizeRichText(richText: string) {
        const sanitizedRichText = purifyHtml(richText);

        if (sanitizedRichText) {
          return sanitizedRichText;
        } else {
          throw 'Richtext Sanitization Failed';
        }
      }

      // Parse Tags
      async function parsifyTags(tags: string) {
        if (tags !== undefined) {
          const parsifiedTags = tags.split(',');

          if (parsifiedTags.length > 0) {
            return parsifiedTags;
          } else {
            throw 'Tags Parsifying Failed';
          }
        } else {
          return [];
        }
      }

      // Create Question
      async function createNewQuestion(payLoad: CreateQuestionPayload) {
        const question = await questionRepositoryX.save(payLoad);

        if (question) {
          return question;
        } else {
          throw 'Question not created';
        }
      }

      // // Send Mail
      // async function sendEmail(otpResponse: Otp, user: Users) {
      //   const sender = process.env.HQ_SENDER;

      //   const mailContents: MailContents = {
      //     date: formattedDate,
      //     username: user.username || 'User',
      //     task: 'verify your Account',
      //     validity: '5 minutes',
      //     otp: otpResponse.otp,
      //   };

      //   // Structuring Mail
      //   mailData.from = sender;
      //   mailData.to = user.email;
      //   mailData.subject = 'Verify Account';
      //   mailData.html = emailTemplate(mailContents);

      //   const mailResponse = await triggerMail(mailData);
      //   if (!mailResponse.error) {
      //     return mailResponse;
      //   } else {
      //     throw 'Mail sending failed';
      //   }
      // }

      // // Generate JWT_Token
      // async function tokenGen(user: Users) {
      //   const { password, ...data } = user;
      //   const token = await jwtServiceX.signAsync(data);
      //   return token;
      // }

      try {
        const checkedInputs = await checkInputs(createQuestionDto);
        const sanitizedRichText = await sanitizeRichText(
          createQuestionDto.richText,
        );
        const parsifiedTags = await parsifyTags(createQuestionDto.tags);
        const payLoad: CreateQuestionPayload = {
          title: createQuestionDto.title,
          richText: sanitizedRichText,
          tags: parsifiedTags,
          email: user.email,
          userId: user.id,
        };
        const createQuestionRes: Question = await createNewQuestion(payLoad);

        resolve({
          error: false,
          value: createQuestionRes,
          message: 'Success',
        });
      } catch (error) {
        console.log({ error });
        resolve({ error: true, value: null, message: error });
      }
    });
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

  async findAllV2() {
    return new Promise(async (resolve) => {
      var questionRepositoryX = this.questionRepository;

      // Fetch All Questions
      async function fetchAll() {
        try {
          const questions = await questionRepositoryX.find();

          if (questions.length !== 0) {
            return questions;
          } else {
            throw 'No questions found';
          }
        } catch (error) {
          console.log({ error });
          throw error;
        }
      }

      try {
        const questions = await fetchAll();

        resolve({
          error: false,
          value: questions,
          message: 'Success',
        });
      } catch (error) {
        console.log({ error });
        resolve({ error: true, value: null, message: error });
      }
    });
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

  async findOneV2(id: number) {
    return new Promise(async (resolve) => {
      var questionRepositoryX = this.questionRepository;
      var answersServiceX = this.answersService;
      var commentsServiceX = this.commentsService;

      // Fetch Target Question
      async function fetchOne(id: number) {
        try {
          const question = await questionRepositoryX.findOneBy({
            questionId: id,
          });
          if (question) {
            return question;
          } else {
            throw 'No questions found for this Id';
          }
        } catch (error) {
          console.log({ error });
          throw error;
        }
      }

      //Fetch Answers
      async function fetchAnswers(questionId: number) {
        try {
          const answers = await answersServiceX.findbyParent(questionId);

          if (answers.length !== 0) {
            return answers;
          } else {
            return [];
          }
        } catch (error) {
          console.log({ error });
          throw error;
        }
      }

      //Fetch Comments for Answers
      async function fetchAnswerComments() {
        try {
          const answerComments = await commentsServiceX.findbyAnswer();
          if (answerComments.length !== 0) {
            return answerComments;
          } else {
            return [];
          }
        } catch (error) {
          console.log({ error });
          throw error;
        }
      }

      //Append Comments to Answers
      function appendComments(answers: Answer[], answersComments: Comment[]) {
        if (answersComments.length === 0) return [];

        const answersWithComments = answers.map((answer) => {
          const commentsForAnswer = answersComments.filter(
            (comment) => comment.parentId === answer.answerId,
          );

          return {
            ...answer,
            comments: commentsForAnswer,
          };
        });

        if (answersWithComments.length !== 0) {
          return answersWithComments;
        } else {
          throw 'Appendind Comments failed';
        }
      }

      //Fetch Comments for Question
      async function fetchQuestionComments(questionId: number) {
        const fetchBody: FindByParentDto = {
          parentId: questionId,
          parentType: 'question',
        };
        try {
          const questionComments =
            await commentsServiceX.findbyParent(fetchBody);
          if (questionComments.length !== 0) {
            return questionComments;
          } else {
            return [];
          }
        } catch (error) {
          console.log({ error });
          throw error;
        }
      }

      try {
        const question = await fetchOne(id);
        const answers = await fetchAnswers(question.questionId);
        const answerComments = await fetchAnswerComments();
        const answersWithComments = appendComments(answers, answerComments);
        const questionComments = await fetchQuestionComments(
          question.questionId,
        );

        resolve({
          error: false,
          value: {
            ...question,
            answers: answersWithComments,
            comments: questionComments,
          },
          message: 'Success',
        });
      } catch (error) {
        console.log({ error });
        resolve({ error: true, value: null, message: error });
      }
    });
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

  async upVoteV2(id: number) {
    return new Promise(async (resolve) => {
      var questionRepositoryX = this.questionRepository;

      // Check Availability
      async function checkQuestion(questionId: number) {
        try {
          const question = await questionRepositoryX.findOneBy({ questionId });
          if (question) {
            return question;
          } else {
            throw 'No question found for this Id';
          }
        } catch (error) {
          throw 'No question found for this Id';
        }
      }

      // Cast vote
      async function increaseVote(question: Question) {
        try {
          const updatedRows = await questionRepositoryX.update(id, {
            upvote: question.upvote + 1,
          });
          if (updatedRows.affected === 1) {
            return true;
          } else {
            throw 'No vote posted';
          }
        } catch (error) {
          throw 'No vote posted';
        }
      }

      try {
        const checkedQuestion = await checkQuestion(id);
        const makeVote = await increaseVote(checkedQuestion);

        resolve({
          error: false,
          value: null,
          message: 'Success',
        });
      } catch (error) {
        console.log({ error });
        resolve({ error: true, value: null, message: error });
      }
    });
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

  async downVoteV2(id: number) {
    return new Promise(async (resolve) => {
      var questionRepositoryX = this.questionRepository;

      // Check Availability
      async function checkQuestion(questionId: number) {
        try {
          const question = await questionRepositoryX.findOneBy({ questionId });
          if (question) {
            return question;
          } else {
            throw 'No question found for this Id';
          }
        } catch (error) {
          throw 'No question found for this Id';
        }
      }

      // Cast vote
      async function increaseVote(question: Question) {
        try {
          const updatedRows = await questionRepositoryX.update(id, {
            downvote: question.downvote + 1,
          });
          if (updatedRows.affected === 1) {
            return true;
          } else {
            throw 'No vote posted';
          }
        } catch (error) {
          throw 'No vote posted';
        }
      }

      try {
        const checkedQuestion = await checkQuestion(id);
        const makeVote = await increaseVote(checkedQuestion);

        resolve({
          error: false,
          value: null,
          message: 'Success',
        });
      } catch (error) {
        console.log({ error });
        resolve({ error: true, value: null, message: error });
      }
    });
  }
}
