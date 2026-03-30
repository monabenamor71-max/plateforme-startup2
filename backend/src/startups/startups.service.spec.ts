import { Test, TestingModule } from '@nestjs/testing';
import { StartupsService } from './startups.service';

describe('StartupsService', () => {
  let service: StartupsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [StartupsService],
    }).compile();

    service = module.get<StartupsService>(StartupsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
