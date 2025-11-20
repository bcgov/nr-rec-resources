import { AppConfigModule } from '@/app-config/app-config.module';
import { UserContextModule } from '@/common/modules/user-context/user-context.module';
import { ResourceImagesController } from '@/resource-images/resource-images.controller';
import { ResourceImagesModule } from '@/resource-images/resource-images.module';
import { ResourceImagesService } from '@/resource-images/service/resource-images.service';
import { Test } from '@nestjs/testing';
import { ClsModule } from 'nestjs-cls';
import { describe, expect, it } from 'vitest';

describe('ResourceImagesModule', () => {
  it('should compile and provide controller and service', async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        ResourceImagesModule,
        AppConfigModule,
        ClsModule.forRoot({
          global: true,
          middleware: { mount: false },
        }),
        UserContextModule,
      ],
    }).compile();

    const controller = moduleRef.get(ResourceImagesController);
    const service = moduleRef.get(ResourceImagesService);

    expect(controller).toBeDefined();
    expect(service).toBeDefined();
  });
});
