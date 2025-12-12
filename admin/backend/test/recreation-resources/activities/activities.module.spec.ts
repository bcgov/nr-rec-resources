import { PrismaModule } from '@/prisma.module';
import { PrismaService } from '@/prisma.service';
import { ActivitiesController } from '@/recreation-resources/activities/activities.controller';
import { ActivitiesModule } from '@/recreation-resources/activities/activities.module';
import { ActivitiesRepository } from '@/recreation-resources/activities/activities.repository';
import { ActivitiesService } from '@/recreation-resources/activities/activities.service';
import { Test, TestingModule } from '@nestjs/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

describe('ActivitiesModule', () => {
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [ActivitiesModule],
    })
      .overrideProvider(PrismaService)
      .useValue({
        recreation_resource: { findUnique: () => Promise.resolve({}) },
        recreation_activity: {
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

  it('should provide ActivitiesService', () => {
    const service = module.get<ActivitiesService>(ActivitiesService);
    expect(service).toBeDefined();
    expect(service).toBeInstanceOf(ActivitiesService);
  });

  it('should provide ActivitiesRepository', () => {
    const repository = module.get<ActivitiesRepository>(ActivitiesRepository);
    expect(repository).toBeDefined();
    expect(repository).toBeInstanceOf(ActivitiesRepository);
  });

  it('should provide ActivitiesController', () => {
    const controller = module.get<ActivitiesController>(ActivitiesController);
    expect(controller).toBeDefined();
    expect(controller).toBeInstanceOf(ActivitiesController);
  });

  it('should provide PrismaService', () => {
    const prisma = module.get<PrismaService>(PrismaService);
    expect(prisma).toBeDefined();
  });

  it('should import PrismaModule', () => {
    const prismaModule = module.get(PrismaModule);
    expect(prismaModule).toBeDefined();
  });

  it('should export ActivitiesService', () => {
    // Test that ActivitiesService can be retrieved from the module
    const service = module.get<ActivitiesService>(ActivitiesService);
    expect(service).toBeDefined();
  });
});
