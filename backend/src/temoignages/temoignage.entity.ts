import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from "typeorm";
import { User } from "../user/user.entity";

@Entity("temoignages")
export class Temoignage {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  user_id: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: "user_id" })
  user: User;

  @Column({ type: "text" })
  texte: string;

  // Nouvelle colonne pour la note (étoiles)
  @Column({ type: "int", default: 5, nullable: true })
  note: number; // 1 à 5 étoiles

  @Column({ type: "enum", enum: ["en_attente","valide","refuse"], default: "en_attente" })
  statut: string;

  @CreateDateColumn()
  createdAt: Date;
}