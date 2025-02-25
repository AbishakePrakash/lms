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
} from '@nestjs/common';
import { AnswersService } from './answers.service';
import { CreateAnswerDto } from './dto/create-answer.dto';
import { UpdateAnswerDto } from './dto/update-answer.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from 'src/auth/guard/authguard';

@ApiBearerAuth('access-token')
@ApiTags('Answers')
@Controller('answers')
@UseGuards(AuthGuard)
export class AnswersController {
  constructor(private readonly answersService: AnswersService) {}

  @Post()
  create(@Body() createAnswerDto: CreateAnswerDto, @Request() req) {
    return this.answersService.create(createAnswerDto, req.user);
  }

  @Post('v2')
  createV2(@Body() createAnswerDto: CreateAnswerDto, @Request() req) {
    return this.answersService.createV2(createAnswerDto, req.user);
  }

  @Get()
  findAll() {
    return this.answersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.answersService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAnswerDto: UpdateAnswerDto) {
    return this.answersService.update(+id, updateAnswerDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.answersService.remove(+id);
  }

  @Post('upVote/:id')
  upVote(@Param('id') id: string) {
    return this.answersService.upVote(+id);
  }

  @Post('downVote/:id')
  downVote(@Param('id') id: string) {
    return this.answersService.downVote(+id);
  }
}
