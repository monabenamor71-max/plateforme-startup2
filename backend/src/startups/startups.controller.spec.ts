import { Test, TestingModule } from '@nestjs/testing';
import { StartupsController } from './startups.controller';

describe('StartupsController', () => {
  let controller: StartupsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StartupsController],
    }).compile();

    controller = module.get<StartupsController>(StartupsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
