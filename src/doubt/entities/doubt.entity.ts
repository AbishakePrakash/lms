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

  @Column()
  question: string;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
