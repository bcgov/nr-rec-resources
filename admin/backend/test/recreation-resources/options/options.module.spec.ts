import { AppConfigModule } from '@/app-config/app-config.module';
import { UserContextModule } from '@/common/modules/user-context/user-context.module';
import { PrismaService } from '@/prisma.service';
import { OptionsController } from '@/recreation-resources/options/options.controller';
import { OptionsModule } from '@/recreation-resources/options/options.module';
import { OptionsRepository } from '@/recreation-resources/options/options.repository';
import { OptionsService } from '@/recreation-resources/options/options.service';
import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { ClsModule } from 'nestjs-cls';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

describe('OptionsModule', () => {
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [
        OptionsModule,
        ConfigModule.forRoot(),
        AppConfigModule,
        ClsModule.forRoot({
          global: true,
          middleware: { mount: false },
        }),
        UserContextModule,
      ],
    }).compile();
  });

  afterEach(async () => {
    if (module) {
      await module.close();
    }
  });

  it('should be defined', () => {
    expect(module).toBeDefined();
  });

  it('should provide OptionsController', () => {
    const controller = module.get<OptionsController>(OptionsController);
    expect(controller).toBeDefined();
    expect(controller).toBeInstanceOf(OptionsController);
  });

  it('should provide OptionsService', () => {
    const service = module.get<OptionsService>(OptionsService);
    expect(service).toBeDefined();
    expect(service).toBeInstanceOf(OptionsService);
  });

  it('should provide OptionsRepository', () => {
    const repository = module.get<OptionsRepository>(OptionsRepository);
    expect(repository).toBeDefined();
    expect(repository).toBeInstanceOf(OptionsRepository);
  });

  it('should provide PrismaService', () => {
    const prismaService = module.get<PrismaService>(PrismaService);
    expect(prismaService).toBeDefined();
  });

  it('should export OptionsService', () => {
    const exportedService = module.get<OptionsService>(OptionsService);
    expect(exportedService).toBeDefined();
  });
});
