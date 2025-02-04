import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Lesson {
  @PrimaryGeneratedColumn()
  lessonId: number;

  @Column()
  title: string;

  @Column()
  description: string;

  @Column({ default: '' })
  video: string;

  @Column({ default: null })
  courseId: number;

  @Column()
  chapterId: number;

  @Column({ type: 'float' })
  order: number;

  @Column({ default: '' })
  prerequisites: string;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
