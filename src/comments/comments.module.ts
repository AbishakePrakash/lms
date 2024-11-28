import { Module } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CommentsController } from './comments.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Comment } from './entities/comment.entity';
import { Answer } from 'src/answers/entities/answer.entity';
import { Question } from 'src/question/entities/question.entity';
import { UserContextService } from 'src/context/userContext';

@Module({
  imports: [TypeOrmModule.forFeature([Comment, Answer, Question])],
  controllers: [CommentsController],
  providers: [CommentsService, UserContextService],
  exports: [CommentsService],
})
export class CommentsModule {}
