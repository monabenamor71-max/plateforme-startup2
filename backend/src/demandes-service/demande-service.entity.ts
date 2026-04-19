// src/demandes-service/demande-service.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../user/user.entity';
import { Expert } from '../user/expert.entity';
import { Formation } from '../formations/formation.entity';

@Entity('demandes_service')
export class DemandeService {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id', nullable: true })
  user_id: number;

  @ManyToOne(() => User, { eager: true, nullable: true })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'formation_id', nullable: true })
  formation_id: number;

  @ManyToOne(() => Formation, { eager: true, nullable: true })
  @JoinColumn({ name: 'formation_id' })
  formation: Formation;

  @Column({ nullable: true })
  service: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ nullable: true })
  delai: string;

  @Column({ nullable: true })
  objectif: string;

  @Column({ nullable: true })
  telephone: string;

  // ⭐ NOUVEAU CHAMP : type d'application (mobile, web, desktop)
  @Column({ name: 'type_application', nullable: true })
  type_application: string;

  @Column({ default: 'en_attente' })
  statut: string;

  @Column({ name: 'commentaire_admin', type: 'text', nullable: true })
  commentaire_admin: string;

  @Column({ name: 'expert_assigne_id', nullable: true })
  expert_assigne_id: number;

  @ManyToOne(() => Expert, { eager: true, nullable: true })
  @JoinColumn({ name: 'expert_assigne_id' })
  expert_assigne: Expert;

  @Column({ name: 'note_suivi', nullable: true })
  note_suivi: string;

  @Column({ type: 'json', nullable: true })
  experts_notifies: number[];

  @Column({ type: 'json', nullable: true })
  experts_acceptes: number[];

  @CreateDateColumn({ name: 'createdAt' })
  createdAt: Date;
}