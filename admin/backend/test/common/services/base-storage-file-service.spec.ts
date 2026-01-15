import { AppConfigService } from '@/app-config/app-config.service';
import {
  BaseStorageFileService,
  StorageConfig,
} from '@/common/services/base-storage-file-service';
import { PrismaService } from '@/prisma.service';
import { Injectable } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  createCloudFrontUrlTestCases,
  createLocalStackUrlTestCases,
  createUrlEdgeCaseTestCases,
} from '../../test-utils/url-construction-test-utils';

@Injectable()
class TestStorageService extends BaseStorageFileService {
  private testConfig: StorageConfig;

  constructor(
    prisma: PrismaService,
    appConfig: AppConfigService,
    config: StorageConfig,
  ) {
    super('TestStorageService', prisma, appConfig);
    this.testConfig = config;
  }

  protected getStorageConfig(): StorageConfig {
    return this.testConfig;
  }
}

describe('BaseStorageFileService', () => {
  let service: TestStorageService;
  let mockPrisma: any;
  let mockAppConfig: any;

  beforeEach(() => {
    mockPrisma = {
      recreation_resource: {
        findUnique: vi.fn(),
      },
    };

    mockAppConfig = {
      awsRegion: 'us-east-1',
    };
  });

  describe('getPublicUrl', () => {
    const bucketName = 'test-bucket';
    const s3Key = 'REC0001/document.pdf';

    describe('LocalStack URL construction', () => {
      const localStackTestCases = createLocalStackUrlTestCases(
        bucketName,
        s3Key,
      );

      localStackTestCases.forEach((testCase) => {
        it(testCase.description, async () => {
          const module: TestingModule = await Test.createTestingModule({
            providers: [
              {
                provide: PrismaService,
                useValue: mockPrisma,
              },
              {
                provide: AppConfigService,
                useValue: mockAppConfig,
              },
              {
                provide: TestStorageService,
                useFactory: (prisma, appConfig) => {
                  return new TestStorageService(
                    prisma,
                    appConfig,
                    testCase.config,
                  );
                },
                inject: [PrismaService, AppConfigService],
              },
            ],
          }).compile();

          service = module.get<TestStorageService>(TestStorageService);
          const result = (service as any).getPublicUrl(testCase.key);
          expect(result).toBe(testCase.expectedUrl);
        });
      });
    });

    describe('CloudFront URL construction', () => {
      const cloudfrontUrl = 'https://d1234567890.cloudfront.net';
      const cloudfrontTestCases = createCloudFrontUrlTestCases(
        cloudfrontUrl,
        s3Key,
      );

      cloudfrontTestCases.forEach((testCase) => {
        it(testCase.description, async () => {
          const module: TestingModule = await Test.createTestingModule({
            providers: [
              {
                provide: PrismaService,
                useValue: mockPrisma,
              },
              {
                provide: AppConfigService,
                useValue: mockAppConfig,
              },
              {
                provide: TestStorageService,
                useFactory: (prisma, appConfig) => {
                  return new TestStorageService(
                    prisma,
                    appConfig,
                    testCase.config,
                  );
                },
                inject: [PrismaService, AppConfigService],
              },
            ],
          }).compile();

          service = module.get<TestStorageService>(TestStorageService);
          const result = (service as any).getPublicUrl(testCase.key);
          expect(result).toBe(testCase.expectedUrl);
        });
      });
    });

    describe('Edge cases', () => {
      const edgeCases = createUrlEdgeCaseTestCases(bucketName);

      edgeCases.forEach((testCase) => {
        it(testCase.description, async () => {
          const module: TestingModule = await Test.createTestingModule({
            providers: [
              {
                provide: PrismaService,
                useValue: mockPrisma,
              },
              {
                provide: AppConfigService,
                useValue: mockAppConfig,
              },
              {
                provide: TestStorageService,
                useFactory: (prisma, appConfig) => {
                  return new TestStorageService(
                    prisma,
                    appConfig,
                    testCase.config,
                  );
                },
                inject: [PrismaService, AppConfigService],
              },
            ],
          }).compile();

          service = module.get<TestStorageService>(TestStorageService);
          const result = (service as any).getPublicUrl(testCase.key);
          expect(result).toBe(testCase.expectedUrl);
        });
      });
    });
  });
});
