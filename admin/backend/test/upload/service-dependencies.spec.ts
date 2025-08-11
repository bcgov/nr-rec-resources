import { AppConfigModule } from "@/app-config/app-config.module";
import { ResourceDocsService } from "@/resource-docs/service/resource-docs.service";
import { ResourceImagesService } from "@/resource-images/service/resource-images.service";
import { Test, TestingModule } from "@nestjs/testing";
import { DamApiModule } from "src/dam-api/dam-api.module";
import { PrismaModule } from "src/prisma.module";
import { PrismaService } from "src/prisma.service";
import { PresignedUploadModule } from "src/upload/presigned-upload.module";
import { PresignedUploadService } from "src/upload/services/presigned-upload.service";
import { describe, expect, it } from "vitest";

describe("Service Dependencies", () => {
  let module: TestingModule;

  it("should allow ResourceDocsService to inject PresignedUploadService", async () => {
    module = await Test.createTestingModule({
      imports: [
        AppConfigModule,
        PrismaModule,
        DamApiModule,
        PresignedUploadModule,
      ],
      providers: [
        ResourceDocsService,
        {
          provide: PrismaService,
          useValue: {
            recreation_resource_docs: {},
            recreation_resource: {},
          },
        },
      ],
    }).compile();

    const resourceDocsService =
      module.get<ResourceDocsService>(ResourceDocsService);
    const presignedUploadService = module.get<PresignedUploadService>(
      PresignedUploadService,
    );

    expect(resourceDocsService).toBeDefined();
    expect(presignedUploadService).toBeDefined();
  });

  it("should allow ResourceImagesService to inject PresignedUploadService", async () => {
    module = await Test.createTestingModule({
      imports: [
        AppConfigModule,
        PrismaModule,
        DamApiModule,
        PresignedUploadModule,
      ],
      providers: [
        ResourceImagesService,
        {
          provide: PrismaService,
          useValue: {
            recreation_resource_images: {},
            recreation_resource_image_variants: {},
            recreation_resource: {},
          },
        },
      ],
    }).compile();

    const resourceImagesService = module.get<ResourceImagesService>(
      ResourceImagesService,
    );
    const presignedUploadService = module.get<PresignedUploadService>(
      PresignedUploadService,
    );

    expect(resourceImagesService).toBeDefined();
    expect(presignedUploadService).toBeDefined();
  });

  afterEach(async () => {
    if (module) {
      await module.close();
    }
  });
});
