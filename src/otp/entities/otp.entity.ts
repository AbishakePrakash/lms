import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';

@Entity()
export class Otp {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @Column()
  email: string;

  @Column()
  service: string;

  @Column()
  otp: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  // @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  // expireAt: Date;
}
