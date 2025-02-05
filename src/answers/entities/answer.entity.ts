import { Comment } from 'src/comments/entities/comment.entity';
import { Question } from 'src/question/entities/question.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';

@Entity()
export class Answer {
  @PrimaryGeneratedColumn()
  answerId: number;

  @Column()
  questionId: number;

  @Column()
  userId: number;

  @Column()
  answer: string;

  @Column({ default: 0 })
  commentsCount: number;

  @Column({ default: 0 })
  upvote: number;

  @Column({ default: 0 })
  downvote: number;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
