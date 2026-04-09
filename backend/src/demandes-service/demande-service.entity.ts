import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from "typeorm";
import { User } from "../user/user.entity";

@Entity("demandes_service")
export class DemandeService {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  user_id: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: "user_id" })
  user: User;

  @Column()
  service: string;

  @Column({ type: "text", nullable: true })
  description: string;

  @Column({ nullable: true })
  budget: string;

  @Column({ nullable: true })
  delai: string;

  @Column({ nullable: true })
  objectif: string;

  @Column({ nullable: true })
  telephone: string;

  @Column({ default: "en_attente" })
  statut: string;

  @Column({ type: "text", nullable: true })
  commentaire_admin: string;

  @CreateDateColumn()
  createdAt: Date;
}
