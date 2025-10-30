import { AppConfigModule } from '@/app-config/app-config.module';
import { AuthPassportKeycloakStrategy } from '@/auth';
import { UserContextService } from '@/common/modules/user-context/user-context.service';
import { ConfigModule } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { describe, expect, it } from 'vitest';

describe('AuthModule', () => {
  it('should compile the module', async () => {
    const module = await Test.createTestingModule({
      imports: [AppConfigModule],
      providers: [
        AuthPassportKeycloakStrategy,
        {
          provide: UserContextService,
          useValue: { setCurrentUser: vi.fn() },
        },
      ],
    }).compile();

    expect(module).toBeDefined();
    const strategy = module.get(AuthPassportKeycloakStrategy);
    expect(strategy).toBeDefined();
  });

  it('should provide AuthPassportKeycloakStrategy', async () => {
    const module = await Test.createTestingModule({
      imports: [
        await ConfigModule.forRoot({
          isGlobal: true,
        }),
        AppConfigModule,
      ],
      providers: [
        AuthPassportKeycloakStrategy,
        {
          provide: UserContextService,
          useValue: { setCurrentUser: vi.fn() },
        },
      ],
    }).compile();

    const strategy = module.get(AuthPassportKeycloakStrategy);
    expect(strategy).toBeDefined();
    expect(strategy).toBeInstanceOf(AuthPassportKeycloakStrategy);
  });
});
