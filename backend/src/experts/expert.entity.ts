import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('experts')
export class Expert {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  user_id: number;

  @Column({ nullable: true })
  domaine: string;

  @Column({ nullable: true, type: 'text' })
  description: string;

  @Column({ nullable: true })
  experience: string;

  @Column({ nullable: true })
  localisation: string;

  @Column({ nullable: true })
  tarif: string;

  @Column({ default: true })
  disponible: boolean;

  @Column({ type: 'decimal', precision: 2, scale: 1, default: 0 })
  note: number;

  @Column({ default: 0 })
  nb_avis: number;

  @Column({ nullable: true })
  cv_path: string;

  @Column({ default: false })
  valide: boolean;

  @CreateDateColumn()
  createdAt: Date;
}