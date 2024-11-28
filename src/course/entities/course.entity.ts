import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Course {
  @PrimaryGeneratedColumn()
  courseId: number;

  @Column()
  title: string;

  @Column()
  introduction: string;

  @Column()
  description: string;

  @Column()
  thumbnailUrl: string;

  @Column()
  previewUrl: string;

  @Column('text', { array: true, default: null })
  tags: string[];

  @Column()
  category: string;

  @Column()
  instructors: string;

  @Column()
  publishStatus: boolean;

  @Column()
  publishDate: string;

  @Column()
  selfEnrollment: boolean;

  @Column()
  featured: boolean;

  @Column()
  certification: boolean;

  @Column()
  pricing: boolean;

  @Column()
  currency: string;

  @Column()
  price: string;

  @Column({ default: 1 })
  courseStatus: number;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
