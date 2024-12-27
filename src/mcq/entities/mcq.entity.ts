import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Mcq {
  @PrimaryGeneratedColumn()
  questionId: number;

  @Column()
  courseId: number;

  @Column()
  chapterId: number;

  @Column()
  quizId: number;

  @Column()
  question: string;

  @Column()
  option1: string;

  @Column()
  option2: string;

  @Column()
  option3: string;

  @Column()
  option4: string;

  @Column({ default: 'None of the Above' })
  option5: string;

  @Column()
  answerId: number;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
