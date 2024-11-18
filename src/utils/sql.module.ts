// sql.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as dotenv from 'dotenv';
import { Answer } from 'src/answers/entities/answer.entity';
import { Comment } from 'src/comments/entities/comment.entity';
import { Otp } from 'src/otp/entities/otp.entity';
import { Question } from 'src/question/entities/question.entity';
import { Users } from 'src/users/entities/user.entity';

dotenv.config(); // Load environment variables

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: process.env.DB_TYPE as 'postgres',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT, 10),
      database: process.env.DB_DATABASE,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      entities: [Users, Otp, Question, Answer, Comment],
      synchronize: true,
      logging: false,
      ssl: {
        rejectUnauthorized: false,
      },
    }),
  ],
})
export class SqlModule {}
