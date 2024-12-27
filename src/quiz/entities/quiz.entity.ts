import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Quiz {
  @PrimaryGeneratedColumn()
  quizId: number;

  @Column()
  title: string;

  @Column()
  description: string;

  @Column()
  courseId: number;

  @Column()
  chapterId: number;

  @Column('int', { array: true, default: [] })
  questions: number[];

  @Column()
  authorId: number;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
