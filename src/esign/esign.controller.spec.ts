import { Test, TestingModule } from '@nestjs/testing';
import { EsignController } from './esign.controller';

describe('EsignController', () => {
  let controller: EsignController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EsignController],
    }).compile();

    controller = module.get<EsignController>(EsignController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
