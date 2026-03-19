import { Entity, Column, PrimaryGeneratedColumn, OneToOne, JoinColumn } from 'typeorm';
import { User } from '../users/user.entity';

@Entity()
export class Startup {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => User, user => user.startupProfile, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column()
  secteur: string;

  @Column()
  taille: string;

  @Column({ default: false })
  valid: boolean; // colonne de validation
}