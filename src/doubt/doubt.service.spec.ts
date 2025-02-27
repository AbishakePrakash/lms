import { Test, TestingModule } from '@nestjs/testing';
import { DoubtService } from './doubt.service';

describe('DoubtService', () => {
  let service: DoubtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DoubtService],
    }).compile();

    service = module.get<DoubtService>(DoubtService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
