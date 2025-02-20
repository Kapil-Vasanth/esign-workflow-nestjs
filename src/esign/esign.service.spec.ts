import { Test, TestingModule } from '@nestjs/testing';
import { EsignService } from './esign.service';

describe('EsignService', () => {
  let service: EsignService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EsignService],
    }).compile();

    service = module.get<EsignService>(EsignService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
