import { AppConfigModule } from '@/app-config/app-config.module';
import { UserContextModule } from '@/common/modules/user-context/user-context.module';
import { PrismaService } from '@/prisma.service';
import { FeesController } from '@/recreation-resources/fees/fees.controller';
import { FeesModule } from '@/recreation-resources/fees/fees.module';
import { FeesService } from '@/recreation-resources/fees/fees.service';
import { Test, TestingModule } from '@nestjs/testing';
import { ClsModule } from 'nestjs-cls';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

describe('FeesModule', () => {
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [
        FeesModule,
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

  it('should provide FeesController', () => {
    const controller = module.get<FeesController>(FeesController);
    expect(controller).toBeDefined();
    expect(controller).toBeInstanceOf(FeesController);
  });

  it('should provide FeesService', () => {
    const service = module.get<FeesService>(FeesService);
    expect(service).toBeDefined();
    expect(service).toBeInstanceOf(FeesService);
  });

  it('should provide PrismaService', () => {
    const prismaService = module.get<PrismaService>(PrismaService);
    expect(prismaService).toBeDefined();
  });

  it('should export FeesService', () => {
    const exportedService = module.get<FeesService>(FeesService);
    expect(exportedService).toBeDefined();
  });
});
