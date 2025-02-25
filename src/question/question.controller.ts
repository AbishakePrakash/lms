import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { QuestionService } from './question.service';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from 'src/auth/guard/authguard';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreateQuestionWithFileDto } from './dto/create-question_v2.dto';

@ApiBearerAuth('access-token')
@ApiTags('Questions')
@Controller('question')
@UseGuards(AuthGuard)
export class QuestionController {
  constructor(private readonly questionService: QuestionService) {}

  // @Post('v0')
  // @UseGuards(AuthGuard)
  // @UseInterceptors(FileInterceptor('file'))
  // @ApiConsumes('multipart/form-data')
  // @ApiBody({
  //   description: 'Upload an image file with question details',
  //   type: CreateQuestionDto,
  // })
  // create(
  //   // @UploadedFile() file: Express.Multer.File,
  //   @Body() createQuestionDto: CreateQuestionDto,
  //   @Request() req,
  // ) {
  //   // if (!file) {
  //   //  throw new BadRequestException('No file uploaded');
  //   // }
  //   return this.questionService.create(
  //     createQuestionDto,
  //     req.user,
  //     // file
  //   );
  // }

  // @Get('vo')
  // findAll() {
  //   return this.questionService.findAll();
  // }

  // @Get('v0/:id')
  // findOne(@Param('id') id: string) {
  //   return this.questionService.findOne(+id);
  // }

  // @Post('upVote/v0/:id')
  // upVote(@Param('id') id: string) {
  //   return this.questionService.upVote(+id);
  // }

  // @Post('downVote/v0/:id')
  // downVote(@Param('id') id: string) {
  //   return this.questionService.downVote(+id);
  // }

  @Post()
  @UseGuards(AuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Upload an image file with question details',
    type: CreateQuestionDto,
  })
  createNew(@Body() createQuestionDto: CreateQuestionDto, @Request() req) {
    return this.questionService.createV2(createQuestionDto, req.user);
  }

  @Get()
  findAllV2() {
    return this.questionService.findAllV2();
  }

  @Get(':id')
  findOneV2(@Param('id') id: string) {
    return this.questionService.findOneV2(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateQuestionDto: UpdateQuestionDto,
  ) {
    return this.questionService.update(+id, updateQuestionDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.questionService.remove(+id);
  }

  @Post('upVote/:id')
  upVoteV2(@Param('id') id: string) {
    return this.questionService.upVoteV2(+id);
  }

  @Post('downVote/:id')
  downVoteV2(@Param('id') id: string) {
    return this.questionService.downVoteV2(+id);
  }
}
