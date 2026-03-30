import { Test, TestingModule } from '@nestjs/testing';
import { DisponibilitesService } from './disponibilites.service';

describe('DisponibilitesService', () => {
  let service: DisponibilitesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DisponibilitesService],
    }).compile();

    service = module.get<DisponibilitesService>(DisponibilitesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
