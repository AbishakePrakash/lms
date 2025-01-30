import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { OtpModule } from './otp/otp.module';
import { QuestionModule } from './question/question.module';
import { SqlModule } from './utils/sql.module';
import { AnswersModule } from './answers/answers.module';
import { CommentsModule } from './comments/comments.module';
import { AuthModule } from './auth/auth.module';
import { CourseModule } from './course/course.module';
import { ChapterModule } from './chapter/chapter.module';
import { LessonModule } from './lesson/lesson.module';
import { QuizModule } from './quiz/quiz.module';
import { McqModule } from './mcq/mcq.module';
import { DoubtModule } from './doubt/doubt.module';
import { UploadModule } from './upload/upload.module';

@Module({
  imports: [
    UsersModule,
    SqlModule,
    OtpModule,
    QuestionModule,
    AnswersModule,
    CommentsModule,
    AuthModule,
    CourseModule,
    ChapterModule,
    LessonModule,
    QuizModule,
    McqModule,
    DoubtModule,
    UploadModule,
  ],
  controllers: [AppController],
  providers: [AppService],
  exports: [AppModule],
})
export class AppModule {}
