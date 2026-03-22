import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../users/user.entity';

@Entity('startups')
export class Startup {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  user_id: number;

  @ManyToOne(() => User, { eager: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;
  @Column({ nullable: true, default: '' })
fonction: string;

  @Column({ nullable: true })
  secteur: string;

  @Column({ nullable: true })
  taille: string;

  @Column({ default: false })
  valid: boolean;
}