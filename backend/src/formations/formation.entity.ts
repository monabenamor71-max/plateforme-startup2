import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from "typeorm";

@Entity("formations")
export class Formation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  titre: string;

  @Column({ type: "text", nullable: true })
  description: string;

  @Column({ nullable: true })
  domaine: string;

  @Column({ nullable: true })
  formateur: string;

  @Column({ default: "payant" })
  type: string;

  @Column({ nullable: true })
  prix: string;

  @Column({ default: false })
  places_limitees: boolean;

  @Column({ nullable: true })
  places_disponibles: number;

  @Column({ nullable: true })
  duree: string;

  @Column({ default: "en_ligne" })
  mode: string;

  @Column({ nullable: true })
  localisation: string;

  @Column({ default: false })
  certifiante: boolean;

  @Column({ nullable: true })
  image: string;

  @Column({ default: "brouillon" })
  statut: string;

  @Column({ default: false })
  a_la_une: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}