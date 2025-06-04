import { Test, TestingModule } from '@nestjs/testing';
import { ResourceDocsController } from './resource-docs.controller';

describe('ResourceDocsController', () => {
  let controller: ResourceDocsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ResourceDocsController],
    }).compile();

    controller = module.get<ResourceDocsController>(ResourceDocsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
