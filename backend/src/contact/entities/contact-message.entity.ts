import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('contact_messages')
export class ContactMessage {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  nom: string;

  @Column({ length: 100 })
  prenom: string;

  @Column({ length: 255 })
  email: string;

  @Column({ length: 100 })
  sujet: string;

  @Column({ type: 'text' })
  message: string;

  @Column({
    type: 'enum',
    enum: ['non_lu', 'lu', 'repondu'],
    default: 'non_lu'
  })
  statut: string;

  @Column({ type: 'text', nullable: true })
  reponse: string;

  @Column({ nullable: true })
  repondu_par: number;

  @Column({ nullable: true })
  repondu_le: Date;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}