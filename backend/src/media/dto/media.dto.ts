export class CreateMediaDto {
  titre: string;
  description?: string;
  url?: string;
  type?: string;
  miniature?: string;
  emission?: string;
  date_publication?: Date | string;
  categorie?: string;
  featured?: boolean;
  statut?: string;
}

export class UpdateMediaDto {
  titre?: string;
  description?: string;
  url?: string;
  type?: string;
  miniature?: string;
  emission?: string;
  date_publication?: Date | string;
  categorie?: string;
  featured?: boolean;
  statut?: string;
}