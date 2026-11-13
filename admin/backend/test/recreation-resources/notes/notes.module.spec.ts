import { AppConfigModule } from '@/app-config/app-config.module';
import { UserContextModule } from '@/common/modules/user-context/user-context.module';
import { PrismaService } from '@/prisma.service';
import { NotesController } from '@/recreation-resources/notes/notes.controller';
import { NotesModule } from '@/recreation-resources/notes/notes.module';
import { NotesService } from '@/recreation-resources/notes/notes.service';
import { Test, TestingModule } from '@nestjs/testing';
import { ClsModule } from 'nestjs-cls';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

describe('NotesModule', () => {
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [
        NotesModule,
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

  it('should provide NotesController', () => {
    const controller = module.get<NotesController>(NotesController);
    expect(controller).toBeInstanceOf(NotesController);
  });

  it('should provide NotesService', () => {
    const service = module.get<NotesService>(NotesService);
    expect(service).toBeInstanceOf(NotesService);
  });

  it('should provide PrismaService', () => {
    expect(module.get<PrismaService>(PrismaService)).toBeDefined();
  });
});
