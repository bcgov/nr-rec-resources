import { AppConfigModule } from '@/app-config/app-config.module';
import { AuthModule, AuthPassportKeycloakStrategy } from '@/auth';
import { ConfigModule } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { describe, expect, it } from 'vitest';

describe('AuthModule', () => {
  it('should compile the module', async () => {
    const module = await Test.createTestingModule({
      imports: [AppConfigModule, AuthModule],
    }).compile();

    expect(module).toBeDefined();
    const authModule = module.get(AuthModule);
    expect(authModule).toBeDefined();
  });

  it('should provide AuthPassportKeycloakStrategy', async () => {
    const module = await Test.createTestingModule({
      imports: [
        await ConfigModule.forRoot({
          isGlobal: true,
        }),
        AppConfigModule,
        AuthModule,
      ],
    }).compile();

    const strategy = module.get(AuthPassportKeycloakStrategy);
    expect(strategy).toBeDefined();
    expect(strategy).toBeInstanceOf(AuthPassportKeycloakStrategy);
  });
});
