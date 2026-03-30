import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Expert } from "../user/expert.entity";
import { User } from "../user/user.entity";
import { MailService } from "../mail/mail.service";

@Injectable()
export class ExpertsService {
  constructor(
    @InjectRepository(Expert) private expertRepo: Repository<Expert>,
    @InjectRepository(User) private userRepo: Repository<User>,
    private mailService: MailService,
  ) {}

  async getMoi(userId: number) {
    const expert = await this.expertRepo.findOne({ where: { user_id: userId }, relations: ["user"] });
    if (!expert) return null;
    return { ...expert, nom: expert.user.nom, prenom: expert.user.prenom, email: expert.user.email, telephone: expert.user.telephone, valide: expert.statut === "valide" };
  }

  async getListe() {
    return this.expertRepo.find({ where: { statut: "valide" }, relations: ["user"] });
  }

  async updateProfil(userId: number, body: any) {
    const expert = await this.expertRepo.findOne({ where: { user_id: userId }, relations: ["user"] });
    if (!expert) return { message: "Expert non trouve" };
    const modifications = JSON.stringify({ domaine: body.domaine, description: body.description, localisation: body.localisation, experience: body.experience, disponibilite: body.disponible ? "disponible" : "non disponible", telephone: body.telephone });
    await this.expertRepo.update({ user_id: userId }, { modifications_en_attente: modifications, modification_demandee: true });
    try { await this.mailService.sendAdminNotification(expert.user.nom, "Modification profil expert", expert.user.email); } catch(e) { console.log(e.message); }
    return { message: "Modification envoyee a admin" };
  }

  async validerModification(expertId: number) {
    const expert = await this.expertRepo.findOne({ where: { id: expertId } });
    if (!expert || !expert.modifications_en_attente) return { message: "Aucune modification" };
    const mods = JSON.parse(expert.modifications_en_attente);
    await this.expertRepo.update(expertId, { domaine: mods.domaine, description: mods.description, localisation: mods.localisation, experience: mods.experience, disponibilite: mods.disponibilite, modifications_en_attente: "", modification_demandee: false });
    if (mods.telephone) await this.userRepo.update(expert.user_id, { telephone: mods.telephone });
    return { message: "Modification validee" };
  }

  async refuserModification(expertId: number) {
    await this.expertRepo.update(expertId, { modifications_en_attente: "", modification_demandee: false });
    return { message: "Modification refusee" };
  }

  async updatePhoto(userId: number, filename: string) {
    await this.expertRepo.update({ user_id: userId }, { photo: filename });
    return { message: "Photo mise a jour" };
  }
}