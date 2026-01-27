import { AppConfigService } from '@/app-config/app-config.service';
import { createS3ServiceProvider } from '@/common/providers/s3-service.provider';
import { S3Service } from '@/s3/s3.service';
import { S3ServiceFactory } from '@/s3/s3-service.factory';
import { beforeEach, describe, expect, it, vi } from 'vitest';

describe('createS3ServiceProvider', () => {
  let mockS3ServiceFactory: any;
  let mockAppConfig: any;
  let mockS3Service: any;

  beforeEach(() => {
    mockS3Service = {
      getSignedUploadUrl: vi.fn(),
      deleteFile: vi.fn(),
      listObjectsByPrefix: vi.fn(),
    };

    mockS3ServiceFactory = {
      createForBucket: vi.fn().mockReturnValue(mockS3Service),
    };

    mockAppConfig = {
      recResourceImagesBucket: 'test-images-bucket',
      recResourcePublicDocsBucket: 'test-docs-bucket',
      establishmentOrderDocsBucket: 'test-order-bucket',
    };
  });

  it('should create a provider with correct structure', () => {
    const provider = createS3ServiceProvider('recResourceImagesBucket');

    expect(provider).toHaveProperty('provide', S3Service);
    expect(provider).toHaveProperty('useFactory');
    expect(provider).toHaveProperty('inject');
    expect(Array.isArray(provider.inject)).toBe(true);
    expect(provider.inject).toHaveLength(2);
    expect(provider.inject).toContain(S3ServiceFactory);
    expect(provider.inject).toContain(AppConfigService);
  });

  it('should use correct bucket config key for images', () => {
    const provider = createS3ServiceProvider('recResourceImagesBucket');
    const factory = provider.useFactory(mockS3ServiceFactory, mockAppConfig);

    expect(mockS3ServiceFactory.createForBucket).toHaveBeenCalledWith(
      'test-images-bucket',
    );
    expect(factory).toBe(mockS3Service);
  });

  it('should use correct bucket config key for docs', () => {
    const provider = createS3ServiceProvider('recResourcePublicDocsBucket');
    const factory = provider.useFactory(mockS3ServiceFactory, mockAppConfig);

    expect(mockS3ServiceFactory.createForBucket).toHaveBeenCalledWith(
      'test-docs-bucket',
    );
    expect(factory).toBe(mockS3Service);
  });

  it('should use correct bucket config key for establishment orders', () => {
    const provider = createS3ServiceProvider('establishmentOrderDocsBucket');
    const factory = provider.useFactory(mockS3ServiceFactory, mockAppConfig);

    expect(mockS3ServiceFactory.createForBucket).toHaveBeenCalledWith(
      'test-order-bucket',
    );
    expect(factory).toBe(mockS3Service);
  });

  it('should inject S3ServiceFactory and AppConfigService', () => {
    const provider = createS3ServiceProvider('recResourceImagesBucket');

    expect(provider.inject).toEqual([S3ServiceFactory, AppConfigService]);
  });

  it('should return S3Service instance from factory', () => {
    const provider = createS3ServiceProvider('recResourceImagesBucket');
    const result = provider.useFactory(mockS3ServiceFactory, mockAppConfig);

    expect(result).toBe(mockS3Service);
    expect(mockS3ServiceFactory.createForBucket).toHaveBeenCalledTimes(1);
  });

  it('should handle different bucket names correctly', () => {
    const customBucket = 'custom-bucket-name';
    mockAppConfig.customBucket = customBucket;

    const provider = createS3ServiceProvider('customBucket' as any);
    provider.useFactory(mockS3ServiceFactory, mockAppConfig);

    expect(mockS3ServiceFactory.createForBucket).toHaveBeenCalledWith(
      customBucket,
    );
  });
});
