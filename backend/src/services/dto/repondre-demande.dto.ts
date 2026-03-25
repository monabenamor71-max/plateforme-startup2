export class RepondreDemandeDto {
  demande_id: number;
  statut: string;
  reponse_admin?: string;
  expert_id?: number;
}