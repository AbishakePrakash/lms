import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Request,
  UseGuards,
} from '@nestjs/common';
import { DoubtService } from './doubt.service';
import { CreateDoubtDto } from './dto/create-doubt.dto';
import { UpdateDoubtDto } from './dto/update-doubt.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Request as Exreq } from 'express';
import { AuthGuard } from 'src/auth/guard/authguard';

@ApiBearerAuth('access-token')
@ApiTags('Doubt')
@Controller('doubt')
@UseGuards(AuthGuard)
export class DoubtController {
  constructor(private readonly doubtService: DoubtService) {}

  @Post()
  create(@Body() createDoubtDto: CreateDoubtDto, @Request() req) {
    return this.doubtService.create(createDoubtDto, req.user);
  }

  @Get()
  findAll() {
    return this.doubtService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.doubtService.findOne(+id);
  }

  @Get('lesson/:id')
  findByLesson(@Param('id') id: string) {
    return this.doubtService.findByLesson(+id);
  }

  @Get('instructor/:id')
  findByInstructor(@Param('id') id: string) {
    return this.doubtService.findByInstructor(+id);
  }

  @Get('student/:id')
  findByStudent(@Param('id') id: string) {
    return this.doubtService.findByStudent(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDoubtDto: UpdateDoubtDto) {
    return this.doubtService.update(+id, updateDoubtDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.doubtService.remove(+id);
  }
}
