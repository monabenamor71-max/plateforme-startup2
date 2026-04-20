import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Expert } from '../user/expert.entity';

@Entity('podcasts')
export class Podcast {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  titre: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ nullable: true })
  url_audio: string;

  @Column({ nullable: true })
  image: string;

  @Column({ nullable: true })
  auteur: string;

  @Column({ nullable: true })
  domaine: string;

  @Column({ type: 'enum', enum: ['en_attente', 'publie', 'refuse'], default: 'en_attente' })
  statut: string;

  @Column({ name: 'expert_id', nullable: true })
  expert_id: number;

  @ManyToOne(() => Expert, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'expert_id' })
  expert: Expert;

  @CreateDateColumn({ name: 'date_creation' })
  date_creation: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}