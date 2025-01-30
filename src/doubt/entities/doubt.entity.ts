import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Doubt {
  @PrimaryGeneratedColumn()
  doubtId: number;

  @Column()
  lessonId: number;

  @Column()
  userId: number;

  @Column()
  instructorId: number;

  @Column({ default: false })
  isCleared: boolean;

  @Column()
  question: string;

  @Column({ default: null })
  response: string;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
