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

  // @Post()
  // @UseGuards(AuthGuard)
  // create(@Body() createQuestionDto: CreateQuestionDto, @Request() req) {
  //   return this.questionService.create(createQuestionDto, req.user);
  // }

  @Post()
  @UseGuards(AuthGuard)
  // @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data') // Specifies the content type for the request
  @ApiBody({
    // description: 'Upload an image file with question details',
    type: CreateQuestionDto, // Uses the DTO directly
  })
  create(
    // @UploadedFile() file: Express.Multer.File,
    @Body() createQuestionDto: CreateQuestionDto,
    @Request() req,
  ) {
    // if (!file) {
    //   throw new BadRequestException('No file uploaded');
    // }
    return this.questionService.create(
      createQuestionDto,
      req.user,
      //  file
    );
  }

  @Get()
  findAll() {
    return this.questionService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.questionService.findOne(+id);
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
  upVote(@Param('id') id: string) {
    return this.questionService.upVote(+id);
  }

  @Post('downVote/:id')
  downVote(@Param('id') id: string) {
    return this.questionService.downVote(+id);
  }
}
