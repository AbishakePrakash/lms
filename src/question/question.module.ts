import { Module } from '@nestjs/common';
import { QuestionService } from './question.service';
import { QuestionController } from './question.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Question } from './entities/question.entity';
import { CommentsModule } from 'src/comments/comments.module';
import { AnswersModule } from 'src/answers/answers.module';
import { UserContextService } from 'src/context/userContext';

@Module({
  imports: [
    TypeOrmModule.forFeature([Question]),
    CommentsModule,
    AnswersModule,
  ],
  controllers: [QuestionController],
  providers: [QuestionService, UserContextService],
})
export class QuestionModule {}
