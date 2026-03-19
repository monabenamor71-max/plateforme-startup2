import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { User } from '../users/user.entity';

@Entity('experts')
export class Expert {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  user_id: number;

  @ManyToOne(() => User, { eager: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ nullable: true })
  domaine: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ nullable: true })
  experience: string;

  @Column({ nullable: true })
  localisation: string;

  @Column({ nullable: true })
  tarif: string;

  @Column({ nullable: true })
  cvPath: string;

  @Column({ nullable: true })
  photo: string;

  @Column({ nullable: true })
  telephone: string;

  // validation → valide (cohérent avec tout le code)
  @Column({ default: false })
  valide: boolean;

  @Column({ default: true })
  disponible: boolean;

  @Column({ type: 'decimal', precision: 2, scale: 1, default: 0 })
  note: number;

  @Column({ default: 0 })
  nb_avis: number;
}