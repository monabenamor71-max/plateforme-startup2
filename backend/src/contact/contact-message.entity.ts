import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('contact_messages')
export class ContactMessage {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nom: string;

  @Column()
  prenom: string;

  @Column()
  email: string;

  @Column({ nullable: true })
  telephone: string;

  @Column()
  sujet: string;

  @Column({ type: 'text' })
  message: string;

  @Column({ default: 'non_lu' })
  statut: string;

  @Column({ type: 'text', nullable: true })
  reponse_admin: string;

  @Column({ nullable: true, type: 'datetime' })
  repondu_le: Date;

  @CreateDateColumn()
  createdAt: Date;
}
