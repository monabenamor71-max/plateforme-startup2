import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('user')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nom: string;

  @Column({ nullable: true })
  prenom: string;

  @Column({ nullable: true })
  telephone: string;

  @Column({ unique: true })
  email: string;

  @Column()
  mot_de_passe: string;

  @Column({ type: 'enum', enum: ['client', 'expert', 'startup', 'admin'], default: 'client' })
  role: string;

  @Column({ type: 'enum', enum: ['en_attente', 'actif', 'inactif'], default: 'actif' })
  statut: string;

  @CreateDateColumn()
  created_at: Date;
}