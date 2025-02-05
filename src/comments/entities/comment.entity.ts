import { Answer } from 'src/answers/entities/answer.entity';
import { Question } from 'src/question/entities/question.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

@Entity()
export class Comment {
  @PrimaryGeneratedColumn()
  commentId: number;

  @Column()
  userId: number;

  @Column()
  email: string;

  @Column()
  parentType: string;

  @Column()
  parentId: number;

  @Column()
  comment: string;

  @Column({ default: 0 })
  likes: number;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
