import { AppConfigService } from '@/app-config/app-config.service';
import { S3ServiceFactory } from '@/s3/s3-service.factory';
import { S3Service } from '@/s3/s3.service';
import { S3Client } from '@aws-sdk/client-s3';
import { Test } from '@nestjs/testing';
import { Mocked, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  createAppConfigTestModule,
  createMockS3Client,
  setupS3ClientMock,
} from '../test-utils/s3-test-utils';

vi.mock('@aws-sdk/client-s3');

describe('S3ServiceFactory', () => {
  let factory: S3ServiceFactory;
  let mockAppConfig: Mocked<AppConfigService>;
  let mockS3Client: Mocked<S3Client>;

  beforeEach(async () => {
    vi.clearAllMocks();

    mockS3Client = createMockS3Client();
    setupS3ClientMock(mockS3Client);

    mockAppConfig = {
      awsRegion: 'ca-central-1',
      awsEndpointUrl: undefined,
    } as any;

    const module = await Test.createTestingModule({
      providers: [
        S3ServiceFactory,
        {
          provide: AppConfigService,
          useValue: mockAppConfig,
        },
      ],
    }).compile();

    factory = module.get<S3ServiceFactory>(S3ServiceFactory);
  });

  describe('Service Initialization', () => {
    it('should be defined', () => {
      expect(factory).toBeDefined();
    });
  });

  describe('createForBucket', () => {
    it('should create a new S3Service instance for a bucket', () => {
      const bucketName = 'test-bucket-1';
      const service = factory.createForBucket(bucketName);

      expect(service).toBeInstanceOf(S3Service);
      expect(S3Client).toHaveBeenCalled();
    });

    it('should return the same instance for the same bucket (singleton per bucket)', () => {
      const bucketName = 'test-bucket-2';

      const service1 = factory.createForBucket(bucketName);
      const service2 = factory.createForBucket(bucketName);

      expect(service1).toBe(service2);
      expect(S3Client).toHaveBeenCalledTimes(1); // Only created once
    });

    it('should create different instances for different buckets', () => {
      const bucket1 = 'bucket-1';
      const bucket2 = 'bucket-2';

      const service1 = factory.createForBucket(bucket1);
      const service2 = factory.createForBucket(bucket2);

      expect(service1).not.toBe(service2);
      expect(S3Client).toHaveBeenCalledTimes(2);
    });

    it('should trim bucket name before creating instance', () => {
      const bucketName = '  test-bucket-3  ';
      const trimmedBucket = 'test-bucket-3';

      const service1 = factory.createForBucket(bucketName);
      const service2 = factory.createForBucket(trimmedBucket);

      expect(service1).toBe(service2);
      expect(S3Client).toHaveBeenCalledTimes(1);
    });

    it('should throw error when bucket name is empty', () => {
      expect(() => factory.createForBucket('')).toThrow(
        'Bucket name is required',
      );
      expect(() => factory.createForBucket('   ')).toThrow(
        'Bucket name is required',
      );
    });

    it('should throw error when bucket name is null or undefined', () => {
      expect(() => factory.createForBucket(null as any)).toThrow(
        'Bucket name is required',
      );
      expect(() => factory.createForBucket(undefined as any)).toThrow(
        'Bucket name is required',
      );
    });

    it('should handle multiple buckets correctly', () => {
      const buckets = ['bucket-a', 'bucket-b', 'bucket-c'];
      const services = buckets.map((bucket) => factory.createForBucket(bucket));

      expect(services[0]).not.toBe(services[1]);
      expect(services[1]).not.toBe(services[2]);
      expect(services[0]).not.toBe(services[2]);

      const services2 = buckets.map((bucket) =>
        factory.createForBucket(bucket),
      );
      expect(services[0]).toBe(services2[0]);
      expect(services[1]).toBe(services2[1]);
      expect(services[2]).toBe(services2[2]);

      expect(S3Client).toHaveBeenCalledTimes(3);
    });

    it('should create instances with correct bucket configuration', () => {
      const bucketName = 'test-bucket-4';
      const service = factory.createForBucket(bucketName);

      expect(service.getBucketName()).toBe(bucketName);
    });

    it('should handle LocalStack endpoint configuration', async () => {
      const localStackAppConfigModule = await createAppConfigTestModule({
        awsRegion: 'us-east-1',
        awsEndpointUrl: 'http://localhost:4566',
      });

      const localStackFactoryModule = await Test.createTestingModule({
        providers: [
          S3ServiceFactory,
          {
            provide: AppConfigService,
            useValue:
              localStackAppConfigModule.get<AppConfigService>(AppConfigService),
          },
        ],
      }).compile();

      const localStackFactory =
        localStackFactoryModule.get<S3ServiceFactory>(S3ServiceFactory);
      const service = localStackFactory.createForBucket('local-bucket');

      expect(service).toBeInstanceOf(S3Service);
      expect(service.getBucketName()).toBe('local-bucket');
    });
  });

  describe('clearCache', () => {
    it('should clear all cached instances', () => {
      const bucket1 = 'cache-bucket-1';
      const bucket2 = 'cache-bucket-2';

      const service1a = factory.createForBucket(bucket1);
      const service2a = factory.createForBucket(bucket2);

      // Clear cache
      factory.clearCache();

      const service1b = factory.createForBucket(bucket1);
      const service2b = factory.createForBucket(bucket2);

      expect(service1a).not.toBe(service1b);
      expect(service2a).not.toBe(service2b);
    });

    it('should allow creating new instances after clearing cache', () => {
      const bucketName = 'cache-bucket-3';
      const service1 = factory.createForBucket(bucketName);

      factory.clearCache();

      const service2 = factory.createForBucket(bucketName);

      expect(service1).not.toBe(service2);
      expect(service2).toBeInstanceOf(S3Service);
    });

    it('should handle clearing empty cache', () => {
      expect(() => factory.clearCache()).not.toThrow();
    });
  });

  describe('Integration with S3Service', () => {
    it('should create S3Service instances that can perform operations', async () => {
      const bucketName = 'integration-bucket';
      const service = factory.createForBucket(bucketName);

      mockS3Client.send.mockResolvedValueOnce({
        Contents: [
          {
            Key: 'test-key',
            Size: 1024,
            LastModified: new Date(),
          },
        ],
      } as any);

      const result = await service.listObjectsByPrefix('test-prefix');

      expect(result).toHaveLength(1);
      expect(result[0]?.key).toBe('test-key');
      expect(mockS3Client.send).toHaveBeenCalled();
    });

    it('should maintain separate S3Service instances for different buckets', () => {
      const bucket1 = 'integration-bucket-1';
      const bucket2 = 'integration-bucket-2';

      const service1 = factory.createForBucket(bucket1);
      const service2 = factory.createForBucket(bucket2);

      expect(service1).not.toBe(service2);
      expect(service1.getBucketName()).toBe(bucket1);
      expect(service2.getBucketName()).toBe(bucket2);

      // Note: In tests with mocks, the S3Client instances may appear the same,
      // but in real usage, each S3Service creates its own S3Client instance
      expect(service1.getS3Client()).toBeDefined();
      expect(service2.getS3Client()).toBeDefined();
    });
  });
});
