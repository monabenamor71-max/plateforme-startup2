import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Temoignage } from "./temoignage.entity";

@Injectable()
export class TemoignagesService {
  constructor(
    @InjectRepository(Temoignage)
    private temoRepo: Repository<Temoignage>,
  ) {}

  async create(user_id: number, texte: string) {
    const t = this.temoRepo.create({ user_id, texte });
    return this.temoRepo.save(t);
  }

  async getAll() {
    // Supprimé "startup" des relations car il n'existe pas
    return this.temoRepo.find({ 
      relations: ["user"], // Seulement la relation user qui existe
      order: { createdAt: "DESC" } 
    });
  }

  async getPublics() {
    // Supprimé "startup" des relations car il n'existe pas
    return this.temoRepo.find({ 
      where: { statut: "valide" }, 
      relations: ["user"], // Seulement la relation user qui existe
      order: { createdAt: "DESC" } 
    });
  }

  async getMesTemoignages(user_id: number) {
    return this.temoRepo.find({ 
      where: { user_id }, 
      order: { createdAt: "DESC" } 
    });
  }

  async valider(id: number) {
    await this.temoRepo.update(id, { statut: "valide" });
    return { message: "Temoignage valide" };
  }

  async refuser(id: number) {
    await this.temoRepo.update(id, { statut: "refuse" });
    return { message: "Temoignage refuse" };
  }

  async supprimer(id: number) {
    await this.temoRepo.delete(id);
    return { message: "Supprime" };
  }
}