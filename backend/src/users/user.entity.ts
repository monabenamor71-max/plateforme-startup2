import { Entity, Column, PrimaryGeneratedColumn, OneToOne } from 'typeorm';
import { Expert } from '../experts/expert.entity';
import { Startup } from '../startups/startup.entity';

export enum UserRole {
  ADMIN = 'admin',
  EXPERT = 'expert',
  STARTUP = 'startup',
}

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nom: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.STARTUP })
  role: UserRole;

  // Optionnel : on peut ajouter d'autres champs comme prenom, telephone, etc.
  @Column({ nullable: true })
  prenom: string;

  @Column({ nullable: true })
  telephone: string;

  @Column({ default: true })
  actif: boolean;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
@OneToOne(() => Expert, expert => expert.user)
expertProfile?: Expert;

  @OneToOne(() => Startup, startup => startup.user)
  startupProfile?: Startup;
}