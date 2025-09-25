import { AppConfigModule } from '@/app-config/app-config.module';
import { RecreationResourceController } from '@/recreation-resource/recreation-resource.controller';
import { RecreationResourceModule } from '@/recreation-resource/recreation-resource.module';
import { RecreationResourceService } from '@/recreation-resource/recreation-resource.service';
import { Test } from '@nestjs/testing';
import { describe, expect, it } from 'vitest';

describe('RecreationResourceModule', () => {
  it('should compile and provide controller and service', async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [RecreationResourceModule, AppConfigModule],
    }).compile();

    const controller = moduleRef.get(RecreationResourceController);
    const service = moduleRef.get(RecreationResourceService);

    expect(controller).toBeDefined();
    expect(service).toBeDefined();
  });
});
