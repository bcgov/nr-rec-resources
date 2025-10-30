import { AppConfigModule } from '@/app-config/app-config.module';
import { UserContextService } from '@/common/modules/user-context/user-context.service';
import { RecreationResourceController } from '@/recreation-resources/recreation-resource.controller';
import { RecreationResourceModule } from '@/recreation-resources/recreation-resource.module';
import { RecreationResourceService } from '@/recreation-resources/recreation-resource.service';
import { Test } from '@nestjs/testing';
import { describe, expect, it, vi } from 'vitest';

describe('RecreationResourceModule', () => {
  it('should compile and provide controller and service', async () => {
    const builder = Test.createTestingModule({
      imports: [RecreationResourceModule, AppConfigModule],
    });

    // Override UserContextService used throughout the module to avoid needing ClsService
    builder.overrideProvider(UserContextService).useValue({
      setCurrentUser: vi.fn(),
      getCurrentUser: vi.fn(),
      getCurrentUserName: vi.fn(),
    });

    const moduleRef = await builder.compile();

    const controller = moduleRef.get(RecreationResourceController);
    const service = moduleRef.get(RecreationResourceService);

    expect(controller).toBeDefined();
    expect(service).toBeDefined();
  });
});
