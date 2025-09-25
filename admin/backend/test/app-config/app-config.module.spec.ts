import { AppConfigModule } from '@/app-config/app-config.module';
import { validate } from '@/app-config/app-config.schema';
import { AppConfigService } from '@/app-config/app-config.service';
import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import 'reflect-metadata';
import { describe, expect, it } from 'vitest';

describe('AppConfigModule', () => {
  it('should compile the module', async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          validate,
        }),
        AppConfigModule,
      ],
    }).compile();

    expect(module).toBeDefined();
    const appConfigModule = module.get(AppConfigModule);
    expect(appConfigModule).toBeDefined();
    const appConfigService = module.get(AppConfigService);
    expect(appConfigService).toBeDefined();
    expect(appConfigService).toBeInstanceOf(AppConfigService);
  });
});
