import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('user')  // Utilise la table 'users' (celle qui contient vos comptes récents)
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column()
  nom: string;

  @Column()
  prenom: string;

  @Column({ nullable: true })
  telephone: string;

  @Column({ type: 'enum', enum: ['admin', 'expert', 'startup'], default: 'startup' })
  role: string;

  @Column({ default: 'actif' })
  statut: string;

  @Column({ nullable: true })
  photo: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}