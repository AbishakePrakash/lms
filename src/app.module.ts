import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Users } from './users/entities/user.entity';
import { OtpModule } from './otp/otp.module';
import * as dotenv from 'dotenv';
import { Otp } from './otp/entities/otp.entity';
import { QuestionModule } from './question/question.module';
import { SqlModule } from './utils/sql.module';
import { AnswersModule } from './answers/answers.module';
import { CommentsModule } from './comments/comments.module';

dotenv.config();

@Module({
  imports: [UsersModule, SqlModule, OtpModule, QuestionModule, AnswersModule, CommentsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
