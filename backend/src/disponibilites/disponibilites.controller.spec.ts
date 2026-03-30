import { Test, TestingModule } from '@nestjs/testing';
import { DisponibilitesController } from './disponibilites.controller';

describe('DisponibilitesController', () => {
  let controller: DisponibilitesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DisponibilitesController],
    }).compile();

    controller = module.get<DisponibilitesController>(DisponibilitesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
