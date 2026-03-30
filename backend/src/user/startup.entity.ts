import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';

@Entity('startups')
export class Startup {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  user_id: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ nullable: true })
  nom_startup: string;

  @Column({ nullable: true })
  secteur: string;

  @Column({ nullable: true })
  taille: string;

  @Column({ nullable: true })
  site_web: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ nullable: true })
  fonction: string;

  @Column({ nullable: true })
  localisation: string;

  @Column({ nullable: true })
  photo: string;

  @Column({ type: 'enum', enum: ['en_attente', 'valide', 'refuse'], default: 'en_attente' })
  statut: string;
}