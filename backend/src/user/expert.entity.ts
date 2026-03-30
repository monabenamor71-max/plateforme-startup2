import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { User } from "./user.entity";

@Entity("experts")
export class Expert {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  user_id: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: "user_id" })
  user: User;

  @Column({ nullable: true })
  domaine: string;

  @Column({ type: "text", nullable: true })
  description: string;

  @Column({ nullable: true })
  cv: string;

  @Column({ nullable: true })
  portfolio: string;

  @Column({ nullable: true })
  experience: string;

  @Column({ nullable: true })
  localisation: string;

  @Column({ nullable: true })
  disponibilite: string;

  @Column({ nullable: true })
  photo: string;

  @Column({ type: "enum", enum: ["en_attente","valide","refuse"], default: "en_attente" })
  statut: string;

  @Column({ nullable: true, type: "text" })
  modifications_en_attente: string;

  @Column({ type: "boolean", default: false })
  modification_demandee: boolean;
}