import { Answer } from 'src/answers/entities/answer.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';

@Entity()
export class Question {
  @PrimaryGeneratedColumn()
  questionId: number;

  @Column()
  userId: number;

  @Column()
  email: string;

  @Column({ default: '' })
  title: string;

  @Column()
  question: string;

  @Column({ default: 0 })
  answersCount: number;

  @Column({ default: 0 })
  commentsCount: number;

  @Column('text', { array: true, default: null })
  tags: string[];

  @Column({ default: 0 })
  upvote: number;

  @Column({ default: 0 })
  downvote: number;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
