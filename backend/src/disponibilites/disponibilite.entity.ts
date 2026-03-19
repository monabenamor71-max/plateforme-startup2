import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Expert } from '../experts/expert.entity';

@Entity('disponibilites')
export class Disponibilite {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  expert_id: number;

  @ManyToOne(() => Expert, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'expert_id' })
  expert: Expert;

  @Column()
  date: string;

  @Column({ nullable: true })
  heure: string;

  @Column({ default: true })
  disponible: boolean;
}