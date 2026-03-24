import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';

@Entity('services')
export class Service {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  nom: string;

  @Column({ length: 100, unique: true })
  slug: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ length: 50, nullable: true })
  icone: string;

  @Column({ length: 20, nullable: true, default: '#F7B500' })
  couleur: string;

  @Column({ nullable: true })
  image: string;

  @Column({ default: true })
  actif: boolean;

  @Column({ default: 0 })
  ordre: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}