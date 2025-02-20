import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Users {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  username: string;

  @Column()
  email: string;

  @Column({ default: 'Student' })
  role: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  age: string;

  @Column({ default: false })
  isActive: boolean;

  @Column()
  password: string;

  @Column({ default: '' })
  profilePicture: string;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
