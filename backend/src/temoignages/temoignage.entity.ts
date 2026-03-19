import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { User } from '../users/user.entity';

@Entity('temoignages')
export class Temoignage {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  user_id: number;

  @ManyToOne(() => User, { eager: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column('text')
  texte: string;

  @Column({ default: 'en_attente' })
  statut: string;

  @CreateDateColumn()
  createdAt: Date;
}