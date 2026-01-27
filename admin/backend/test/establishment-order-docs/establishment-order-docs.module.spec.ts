import { AppConfigModule } from '@/app-config/app-config.module';
import { AppConfigService } from '@/app-config/app-config.service';
import { S3ServiceFactory } from '@/s3/s3-service.factory';
import { S3Module } from '@/s3/s3.module';
import { S3Service } from '@/s3/s3.service';
import { EstablishmentOrderDocsModule } from '@/establishment-order-docs/establishment-order-docs.module';
import { EstablishmentOrderDocsService } from '@/establishment-order-docs/establishment-order-docs.service';
import { PrismaService } from '@/prisma.service';
import { Test, TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';

describe('EstablishmentOrderDocsModule', () => {
  let module: TestingModule;
  let mockS3ServiceFactory: any;
  let mockAppConfig: any;
  let mockS3Service: any;

  beforeEach(async () => {
    mockS3Service = {
      uploadFile: vi.fn(),
      deleteFile: vi.fn(),
      getSignedUrl: vi.fn(),
    };

    mockS3ServiceFactory = {
      createForBucket: vi.fn().mockReturnValue(mockS3Service),
    };

    mockAppConfig = {
      establishmentOrderDocsBucket: 'test-order-bucket',
    };

    module = await Test.createTestingModule({
      imports: [S3Module, AppConfigModule, EstablishmentOrderDocsModule],
    })
      .overrideProvider(S3ServiceFactory)
      .useValue(mockS3ServiceFactory)
      .overrideProvider(AppConfigService)
      .useValue(mockAppConfig)
      .overrideProvider(PrismaService)
      .useValue({
        recreation_resource: {
          findUnique: vi.fn(),
        },
      } as any)
      .compile();
  });

  it('should be defined', () => {
    expect(module).toBeDefined();
  });

  it('should provide S3Service with correct bucket', () => {
    const s3Service = module.get<S3Service>(S3Service);

    expect(s3Service).toBeDefined();
    expect(s3Service).toBe(mockS3Service);
    expect(mockS3ServiceFactory.createForBucket).toHaveBeenCalledWith(
      'test-order-bucket',
    );
  });

  it('should provide EstablishmentOrderDocsService', () => {
    const service = module.get<EstablishmentOrderDocsService>(
      EstablishmentOrderDocsService,
    );

    expect(service).toBeDefined();
    expect(service).toBeInstanceOf(EstablishmentOrderDocsService);
  });

  it('should provide PrismaService', () => {
    const prismaService = module.get<PrismaService>(PrismaService);

    expect(prismaService).toBeDefined();
  });

  it('should export EstablishmentOrderDocsService', () => {
    const exportedService = module.get<EstablishmentOrderDocsService>(
      EstablishmentOrderDocsService,
    );

    expect(exportedService).toBeDefined();
  });

  it('should import required modules', () => {
    // Verify module can be created with all dependencies
    expect(module).toBeDefined();
    expect(module.get(S3ServiceFactory)).toBeDefined();
    expect(module.get(AppConfigService)).toBeDefined();
  });
});
