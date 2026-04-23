import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('user')
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

  @Column({ default: false })
  email_verified: boolean;

  @Column({ nullable: true })
reset_code: string;

@Column({ nullable: true, type: 'datetime' })
reset_code_expires: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}