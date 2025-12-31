import { PrismaModule } from '@/prisma.module';
import { PrismaService } from '@/prisma.service';
import { FeaturesController } from '@/recreation-resources/features/features.controller';
import { FeaturesModule } from '@/recreation-resources/features/features.module';
import { FeaturesRepository } from '@/recreation-resources/features/features.repository';
import { FeaturesService } from '@/recreation-resources/features/features.service';
import { Test, TestingModule } from '@nestjs/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

describe('FeaturesModule', () => {
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [FeaturesModule],
    })
      .overrideProvider(PrismaService)
      .useValue({
        recreation_resource: { findUnique: () => Promise.resolve({}) },
        recreation_feature: {
          findMany: () => Promise.resolve([]),
          deleteMany: () => Promise.resolve({ count: 0 }),
          createMany: () => Promise.resolve({ count: 0 }),
        },
        $transaction: (callback: any) => callback({}),
      })
      .compile();
  });

  afterEach(async () => {
    if (module) {
      await module.close();
    }
  });

  it('should be defined', () => {
    expect(module).toBeDefined();
  });

  it('should provide FeaturesService', () => {
    const service = module.get<FeaturesService>(FeaturesService);
    expect(service).toBeDefined();
    expect(service).toBeInstanceOf(FeaturesService);
  });

  it('should provide FeaturesRepository', () => {
    const repository = module.get<FeaturesRepository>(FeaturesRepository);
    expect(repository).toBeDefined();
    expect(repository).toBeInstanceOf(FeaturesRepository);
  });

  it('should provide FeaturesController', () => {
    const controller = module.get<FeaturesController>(FeaturesController);
    expect(controller).toBeDefined();
    expect(controller).toBeInstanceOf(FeaturesController);
  });

  it('should provide PrismaService', () => {
    const prisma = module.get<PrismaService>(PrismaService);
    expect(prisma).toBeDefined();
  });

  it('should import PrismaModule', () => {
    const prismaModule = module.get(PrismaModule);
    expect(prismaModule).toBeDefined();
  });

  it('should export FeaturesService', () => {
    const service = module.get<FeaturesService>(FeaturesService);
    expect(service).toBeDefined();
  });
});
