import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
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

  @Column({ nullable: true })
  createdAtV2: string;

  @Column({ nullable: true })
  updatedAtV2: string;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
