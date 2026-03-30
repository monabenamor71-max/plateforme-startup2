import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Expert } from '../user/expert.entity';

@Entity('disponibilites')
export class Disponibilite {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  expert_id: number;

  @ManyToOne(() => Expert)
  @JoinColumn({ name: 'expert_id' })
  expert: Expert;

  @Column()
  date: string;

  @Column()
  heureDebut: string;

  @Column()
  heureFin: string;
}