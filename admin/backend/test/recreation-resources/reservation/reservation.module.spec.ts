import { AppConfigModule } from '@/app-config/app-config.module';
import { UserContextModule } from '@/common/modules/user-context/user-context.module';
import { PrismaService } from '@/prisma.service';
import { ReservationController } from '@/recreation-resources/reservation/reservation.controller';
import { ReservationModule } from '@/recreation-resources/reservation/reservation.module';
import { ReservationService } from '@/recreation-resources/reservation/reservation.service';
import { Test, TestingModule } from '@nestjs/testing';
import { ClsModule } from 'nestjs-cls';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

describe('ReservationModule', () => {
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [
        ReservationModule,
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

  it('should provide ReservationController', () => {
    const controller = module.get<ReservationController>(ReservationController);
    expect(controller).toBeDefined();
    expect(controller).toBeInstanceOf(ReservationController);
  });

  it('should provide ReservationService', () => {
    const service = module.get<ReservationService>(ReservationService);
    expect(service).toBeDefined();
    expect(service).toBeInstanceOf(ReservationService);
  });

  it('should provide PrismaService', () => {
    const prismaService = module.get<PrismaService>(PrismaService);
    expect(prismaService).toBeDefined();
  });

  it('should export ReservationService', () => {
    const exportedService = module.get<ReservationService>(ReservationService);
    expect(exportedService).toBeDefined();
  });
});
