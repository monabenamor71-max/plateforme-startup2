import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('articles')
export class Article {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  titre: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'longtext', nullable: true })
  contenu: string;

  @Column({ nullable: true })
  image: string;

  @Column({ default: 'article' })
  type: string;

  @Column({ nullable: true })
  categorie: string;

  @Column({ type: 'simple-array', nullable: true })
  tags: string[];

  @Column({ nullable: true })
  duree_lecture: string;

  @Column({ default: 'brouillon' })
  statut: string;

  @Column({ type: 'int', default: 0 })
  vues: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}