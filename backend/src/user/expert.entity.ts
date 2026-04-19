// src/user/expert.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';   // ← correction : './user.entity'

@Entity('experts')
export class Expert {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  user_id: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE', eager: true })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ nullable: true })
  domaine: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ nullable: true })
  cv: string;

  @Column({ nullable: true })
  portfolio: string;

  @Column({ nullable: true })
  photo: string;

  @Column({ nullable: true })
  experience: string;

  @Column({ type: 'int', nullable: true })
  annee_debut_experience: number | null;

  @Column({ nullable: true })
  localisation: string;

  @Column({ default: 'en_attente' })
  statut: string;

  @Column({ default: false })
  modification_demandee: boolean;

  @Column({ type: 'text', nullable: true })
  modifications_en_attente: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}