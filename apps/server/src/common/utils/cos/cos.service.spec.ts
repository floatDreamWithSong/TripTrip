import { Test, TestingModule } from '@nestjs/testing';
import { CosService } from './cos.service';

describe.skip('CosService', () => {
  let service: CosService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CosService],
    }).compile();

    service = module.get<CosService>(CosService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
