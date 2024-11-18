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
  answer: string;

  @Column({ default: 0 })
  commentsCount: number;

  @Column({ default: 0 })
  vote: number;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
