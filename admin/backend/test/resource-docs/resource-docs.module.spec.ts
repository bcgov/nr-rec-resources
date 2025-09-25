import { AppConfigModule } from '@/app-config/app-config.module';
import { ResourceDocsController } from '@/resource-docs/resource-docs.controller';
import { ResourceDocsModule } from '@/resource-docs/resource-docs.module';
import { ResourceDocsService } from '@/resource-docs/service/resource-docs.service';
import { Test } from '@nestjs/testing';
import { describe, expect, it } from 'vitest';

describe('ResourceDocsModule', () => {
  it('should compile and provide controller and service', async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [ResourceDocsModule, AppConfigModule],
    })

      .compile();

    const controller = moduleRef.get(ResourceDocsController);
    const service = moduleRef.get(ResourceDocsService);

    expect(controller).toBeDefined();
    expect(service).toBeDefined();
  });
});
