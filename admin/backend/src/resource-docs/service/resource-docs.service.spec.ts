import { Test, TestingModule } from '@nestjs/testing';
import { ResourceDocsService } from './resource-docs.service';

describe('ResourceDocsService', () => {
  let service: ResourceDocsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ResourceDocsService],
    }).compile();

    service = module.get<ResourceDocsService>(ResourceDocsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
