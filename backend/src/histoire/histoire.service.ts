import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Histoire } from './histoire.entity';

@Injectable()
export class HistoireService {
  constructor(
    @InjectRepository(Histoire)
    private histoireRepository: Repository<Histoire>,
  ) {}

  async get(): Promise<Histoire> {
    let histoire = await this.histoireRepository.findOne({ where: { id: 1 } });
    if (!histoire) {
      histoire = this.histoireRepository.create({ id: 1 });
      histoire = await this.histoireRepository.save(histoire);
    }
    return histoire;
  }

  async update(updateData: Partial<Histoire>): Promise<Histoire> {
    let histoire = await this.histoireRepository.findOne({ where: { id: 1 } });
    if (!histoire) {
      histoire = this.histoireRepository.create({ id: 1, ...updateData });
    } else {
      Object.assign(histoire, updateData);
    }
    return this.histoireRepository.save(histoire);
  }
}