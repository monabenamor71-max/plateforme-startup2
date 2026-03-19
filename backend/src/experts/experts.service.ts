import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Expert } from './expert.entity';
import { Temoignage } from '../temoignages/temoignage.entity';

@Injectable()
export class ExpertsService {
  constructor(
    @InjectRepository(Expert)
    private expertRepo: Repository<Expert>,
    @InjectRepository(Temoignage)
    private temoignageRepo: Repository<Temoignage>,
  ) {}

  async findAll(): Promise<Expert[]> {
    return this.expertRepo.find({
      where: { valide: true },
      relations: ['user'],
    });
  }

  async findOne(id: number): Promise<Expert> {
    const expert = await this.expertRepo.findOne({
      where: { id },
      relations: ['user'],
    });
    if (!expert) throw new NotFoundException('Expert non trouve');
    return expert;
  }

  async findByUser(userId: number): Promise<Expert | null> {
    return this.expertRepo.findOne({
      where: { user_id: userId } as any,
      relations: ['user'],
    });
  }

  async create(userId: number, data: any): Promise<Expert> {
    const existing = await this.findByUser(userId);
    if (existing) return existing;
    const raw = this.expertRepo.create({ user_id: userId, valide: false, ...data } as any);
    const saved = await this.expertRepo.save(raw as any);
    return saved as any;
  }

  async getMoi(userId: number) {
    const expert = await this.findByUser(userId);
    if (!expert) throw new NotFoundException('Profil expert non trouve');
    const temoignages = await this.temoignageRepo.find({
      where: { user_id: userId } as any,
      order: { createdAt: 'DESC' },
    });
    return { ...expert, temoignages };
  }

  async updateProfil(userId: number, data: any): Promise<Expert> {
    const existing = await this.findByUser(userId);
    if (!existing) {
      return this.create(userId, data);
    }
    await this.expertRepo.update(existing.id, data);
    const updated = await this.expertRepo.findOne({ where: { id: existing.id }, relations: ['user'] });
    return updated as Expert;
  }

  async envoyerTemoignage(userId: number, texte: string) {
    const temo = this.temoignageRepo.create({
      user_id: userId,
      texte,
      statut: 'en_attente',
    } as any);
    return this.temoignageRepo.save(temo);
  }

  async update(id: number, data: any) {
    await this.expertRepo.update(id, data);
    return this.expertRepo.findOne({ where: { id }, relations: ['user'] });
  }

  async remove(id: number): Promise<void> {
    await this.expertRepo.delete(id);
  }
}