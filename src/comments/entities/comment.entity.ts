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
  username: string;

  @Column()
  parentType: string;

  @Column()
  parentId: number;

  @Column()
  comment: string;

  //   @Column('int', { array: true, default: null })
  //   comments: number[];

  @Column({ default: 0 })
  likes: number;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
