import { PrismaModule } from '@/prisma.module';
import { PrismaService } from '@/prisma.service';
import { TrailsController } from '@/recreation-resources/trails/trails.controller';
import { TrailsModule } from '@/recreation-resources/trails/trails.module';
import { TrailsRepository } from '@/recreation-resources/trails/trails.repository';
import { TrailsService } from '@/recreation-resources/trails/trails.service';
import { Test, TestingModule } from '@nestjs/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

describe('TrailsModule', () => {
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [TrailsModule],
    })
      .overrideProvider(PrismaService)
      .useValue({
        recreation_resource: { findUnique: () => Promise.resolve({}) },
        recreation_activity_code: { findUnique: () => Promise.resolve({}) },
        recreation_activity: { findUnique: () => Promise.resolve({}) },
        recreation_activity_code_trails: {
          findMany: () => Promise.resolve([]),
          create: () => Promise.resolve({}),
          update: () => Promise.resolve({}),
          delete: () => Promise.resolve({}),
          findUnique: () => Promise.resolve(null),
        },
      })
      .compile();
  });

  afterEach(async () => {
    await module?.close();
  });

  it('should be defined', () => {
    expect(module).toBeDefined();
  });

  it('should provide TrailsService', () => {
    const service = module.get<TrailsService>(TrailsService);
    expect(service).toBeDefined();
    expect(service).toBeInstanceOf(TrailsService);
  });

  it('should provide TrailsRepository', () => {
    const repository = module.get<TrailsRepository>(TrailsRepository);
    expect(repository).toBeDefined();
    expect(repository).toBeInstanceOf(TrailsRepository);
  });

  it('should provide TrailsController', () => {
    const controller = module.get<TrailsController>(TrailsController);
    expect(controller).toBeDefined();
    expect(controller).toBeInstanceOf(TrailsController);
  });

  it('should provide PrismaService', () => {
    const prisma = module.get<PrismaService>(PrismaService);
    expect(prisma).toBeDefined();
  });

  it('should import PrismaModule', () => {
    const prismaModule = module.get(PrismaModule);
    expect(prismaModule).toBeDefined();
  });

  it('should export TrailsService', () => {
    const service = module.get<TrailsService>(TrailsService);
    expect(service).toBeDefined();
  });
});
