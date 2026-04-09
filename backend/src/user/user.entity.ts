import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from "typeorm";

@Entity("user")
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  email: string;

  @Column({ name: "mot_de_passe" })
  mot_de_passe: string;

  @Column()
  nom: string;

  @Column()
  prenom: string;

  @Column()
  role: string;

  @Column({ nullable: true })
  telephone: string;

  @Column({ nullable: true, default: "actif" })
  statut: string;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  // Supprimer ou commenter cette ligne si la colonne n'existe pas
  // @UpdateDateColumn({ name: "updated_at" })
  // updatedAt: Date;

  @Column({ nullable: true })
  reset_token: string;

  @Column({ nullable: true, type: "timestamp" })
  reset_token_expires: Date;
}