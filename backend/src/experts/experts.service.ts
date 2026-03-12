import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Expert } from './expert.entity';

@Injectable()
export class ExpertsService {
  constructor(
    @InjectRepository(Expert)
    private expertRepository: Repository<Expert>,
  ) {}

  async updateProfil(userId: number, data: any) {
    await this.expertRepository.update(
      { user_id: userId },
      {
        domaine:      data.domaine,
        description:  data.description,
        experience:   data.experience,
        localisation: data.localisation,
        tarif:        data.tarif,
        disponible:   data.disponible,
      }
    );
    return { message: 'Profil mis à jour ✅' };
  }
}