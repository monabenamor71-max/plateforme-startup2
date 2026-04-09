import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('comments')
export class Comment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text' })
  comment: string;

  @Column()
  nom: string;

  @Column()
  email: string;

  @Column({ nullable: true })
  site: string;

  @Column({ default: 'en_attente' })
  statut: string;

  @Column()
  articleId: number;

  @Column({ nullable: true })
  userId: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}