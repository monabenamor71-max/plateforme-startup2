import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../users/user.entity';
import { Expert } from '../experts/expert.entity';

@Entity('rendezvous')
export class Rendezvous {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  startup_id: number;

  @Column()
  expert_id: number;

  @Column()
  date_rdv: string;

  @Column({ nullable: true })
  heure: string;

  @Column({ nullable: true })
  motif: string;

  @Column({ default: 'en_attente' })
  statut: string;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => User, { eager: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'startup_id' })
  client: User;

  @ManyToOne(() => Expert, { eager: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'expert_id' })
  expert: Expert;
}