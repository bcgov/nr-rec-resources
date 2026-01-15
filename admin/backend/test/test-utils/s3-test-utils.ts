import { AppConfigService } from '@/app-config/app-config.service';
import { S3Client } from '@aws-sdk/client-s3';
import { Test, TestingModule } from '@nestjs/testing';
import { Mocked, vi } from 'vitest';

const DEFAULT_APP_CONFIG = {
  establishmentOrderDocsBucket: 'rst-lza-establishment-order-docs-dev',
  recResourcePublicDocsBucket: 'test-docs-bucket',
  recResourceImagesBucket: 'test-images-bucket',
  awsRegion: 'ca-central-1',
  awsEndpointUrl: undefined,
  recResourceStorageCloudfrontUrl: 'https://test-cdn.example.com',
} as const;

export function createMockS3Client(): Mocked<S3Client> {
  return {
    send: vi.fn(),
  } as any;
}

export interface AppConfigTestModuleOptions {
  establishmentOrderDocsBucket?: string;
  recResourcePublicDocsBucket?: string;
  recResourceImagesBucket?: string;
  awsRegion?: string;
  awsEndpointUrl?: string;
  recResourceStorageCloudfrontUrl?: string;
}

export async function createAppConfigTestModule(
  options: AppConfigTestModuleOptions = {},
): Promise<TestingModule> {
  const defaultOptions = {
    ...DEFAULT_APP_CONFIG,
    ...options,
  };

  return await Test.createTestingModule({
    providers: [
      {
        provide: AppConfigService,
        useValue: defaultOptions as any,
      },
    ],
  }).compile();
}

export function setupS3ClientMock(mockClient: Mocked<S3Client>): void {
  vi.mocked(S3Client).mockImplementation(function () {
    return mockClient as any;
  });
}
