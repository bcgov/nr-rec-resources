import { AppConfigModule } from '@/app-config/app-config.module';
import { AppConfigService } from '@/app-config/app-config.service';
import {
  BaseStorageFileService,
  StorageConfig,
} from '@/common/services/base-storage-file-service';
import { Test } from '@nestjs/testing';
import { afterEach, vi } from 'vitest';

export interface UrlTestCase {
  description: string;
  key: string;
  config: StorageConfig;
  expectedUrl: string;
}

export async function createAppConfigWithEndpoint(
  endpointUrl: string,
  bucketName: string = 'test-bucket',
  cloudfrontUrl?: string,
): Promise<AppConfigService> {
  const appConfigModule = await Test.createTestingModule({
    imports: [AppConfigModule],
  }).compile();

  const appConfig = appConfigModule.get<AppConfigService>(AppConfigService);

  vi.spyOn(appConfig, 'recResourcePublicDocsBucket', 'get').mockReturnValue(
    bucketName,
  );
  vi.spyOn(appConfig, 'recResourceImagesBucket', 'get').mockReturnValue(
    bucketName,
  );
  vi.spyOn(appConfig, 'establishmentOrderDocsBucket', 'get').mockReturnValue(
    bucketName,
  );
  vi.spyOn(appConfig, 'awsEndpointUrl', 'get').mockReturnValue(endpointUrl);

  if (cloudfrontUrl) {
    vi.spyOn(
      appConfig,
      'recResourceStorageCloudfrontUrl',
      'get',
    ).mockReturnValue(cloudfrontUrl);
  }

  return appConfig;
}

export async function createAppConfigWithCloudFront(
  cloudfrontUrl: string,
  bucketName: string = 'test-bucket',
): Promise<AppConfigService> {
  const appConfigModule = await Test.createTestingModule({
    imports: [AppConfigModule],
  }).compile();

  const appConfig = appConfigModule.get<AppConfigService>(AppConfigService);

  vi.spyOn(appConfig, 'recResourcePublicDocsBucket', 'get').mockReturnValue(
    bucketName,
  );
  vi.spyOn(appConfig, 'recResourceImagesBucket', 'get').mockReturnValue(
    bucketName,
  );
  vi.spyOn(appConfig, 'establishmentOrderDocsBucket', 'get').mockReturnValue(
    bucketName,
  );
  vi.spyOn(appConfig, 'recResourceStorageCloudfrontUrl', 'get').mockReturnValue(
    cloudfrontUrl,
  );
  vi.spyOn(appConfig, 'awsEndpointUrl', 'get').mockReturnValue(undefined);

  return appConfig;
}

export function cleanupEnvVars(): void {
  delete process.env.AWS_ENDPOINT_URL;
}

export function setupUrlTestCleanup(): void {
  afterEach(() => {
    cleanupEnvVars();
  });
}

export function testPublicUrlGeneration(
  service: BaseStorageFileService,
  testCases: UrlTestCase[],
): void {
  testCases.forEach((testCase) => {
    it(testCase.description, () => {
      vi.spyOn(service as any, 'getStorageConfig').mockReturnValue(
        testCase.config,
      );

      const result = (service as any).getPublicUrl(testCase.key);
      expect(result).toBe(testCase.expectedUrl);
    });
  });
}

export function createLocalStackUrlTestCases(
  bucketName: string,
  s3Key: string,
): UrlTestCase[] {
  const localStackEndpoint = 'http://localhost:4566';
  const expectedUrl = `${localStackEndpoint}/${bucketName}/${s3Key}`;

  return [
    {
      description: 'should construct LocalStack URL without trailing slash',
      key: s3Key,
      config: {
        bucketName,
        endpointUrl: localStackEndpoint,
      },
      expectedUrl,
    },
    {
      description:
        'should construct LocalStack URL with trailing slash removed',
      key: s3Key,
      config: {
        bucketName,
        endpointUrl: `${localStackEndpoint}/`,
      },
      expectedUrl, // Both should produce the same URL (trailing slash is removed)
    },
  ];
}

export function createCloudFrontUrlTestCases(
  cloudfrontUrl: string,
  s3Key: string,
): UrlTestCase[] {
  return [
    {
      description: 'should construct CloudFront URL in production',
      key: s3Key,
      config: {
        bucketName: 'test-bucket',
        cloudfrontUrl,
      },
      expectedUrl: `${cloudfrontUrl}/${s3Key}`,
    },
  ];
}

export function createUrlEdgeCaseTestCases(
  bucketName: string = 'test-bucket',
): UrlTestCase[] {
  return [
    {
      description: 'should return empty string for empty key',
      key: '',
      config: {
        bucketName,
        cloudfrontUrl: 'https://test-cdn.example.com',
      },
      expectedUrl: '',
    },
    {
      description: 'should return key when no CloudFront URL configured',
      key: 'test-key',
      config: {
        bucketName,
      },
      expectedUrl: 'test-key',
    },
  ];
}
