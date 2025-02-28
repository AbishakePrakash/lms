import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
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
  email: string;

  @Column()
  answer: string;

  @Column({ default: '', nullable: true, type: 'text' })
  richText: string;

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
