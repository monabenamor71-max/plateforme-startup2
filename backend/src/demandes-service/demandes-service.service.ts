import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { DemandeService } from "./demande-service.entity";

@Injectable()
export class DemandesServiceService {
  constructor(
    @InjectRepository(DemandeService)
    private repo: Repository<DemandeService>,
  ) {}

  async create(userId: number, body: any) {
    const d = this.repo.create({ ...body, user_id: userId, statut: "en_attente" });
    return this.repo.save(d);
  }

  async getMesDemandes(userId: number) {
    return this.repo.find({ where: { user_id: userId }, order: { createdAt: "DESC" } });
  }

  async getAll() {
    return this.repo.find({ relations: ["user"], order: { createdAt: "DESC" } });
  }

  async valider(id: number, commentaire?: string) {
    await this.repo.update(id, { statut: "valide", commentaire_admin: commentaire || "" });
    return this.repo.findOne({ where: { id }, relations: ["user"] });
  }

  async refuser(id: number, commentaire?: string) {
    await this.repo.update(id, { statut: "refuse", commentaire_admin: commentaire || "" });
    return this.repo.findOne({ where: { id }, relations: ["user"] });
  }

  async supprimer(id: number) {
    await this.repo.delete(id);
    return { message: "Supprime" };
  }
}
