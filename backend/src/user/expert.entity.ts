// src/entities/expert.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity('experts')
export class Expert {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id' })
  user_id: number;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'varchar', length: 100, nullable: true })
  domaine: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  cv: string; // chemin du fichier CV

  @Column({ type: 'varchar', length: 255, nullable: true })
  portfolio: string; // chemin du fichier portfolio

  @Column({ type: 'varchar', length: 255, nullable: true })
  photo: string; // chemin de la photo de profil

  @Column({ type: 'varchar', length: 50, nullable: true })
  experience: string; // champ calculé ou texte libre

  @Column({ type: 'int', nullable: true })
  annee_debut_experience: number | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  localisation: string;

  @Column({ type: 'enum', enum: ['en_attente', 'valide', 'refuse'], default: 'en_attente' })
  statut: string;

  @Column({ default: false })
  modification_demandee: boolean;

  @Column({ type: 'text', nullable: true })
  modifications_en_attente: string; // stocke les modifications proposées par l'expert

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}