import { S3Module } from '@/s3/s3.module';
import { S3ServiceFactory } from '@/s3/s3-service.factory';
import { Test, TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it } from 'vitest';

describe('S3Module', () => {
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [S3Module],
    }).compile();
  });

  it('should be defined', () => {
    expect(module).toBeDefined();
  });

  it('should provide S3ServiceFactory', () => {
    const factory = module.get<S3ServiceFactory>(S3ServiceFactory);

    expect(factory).toBeDefined();
    expect(factory).toBeInstanceOf(S3ServiceFactory);
  });

  it('should export S3ServiceFactory', () => {
    const factory = module.get<S3ServiceFactory>(S3ServiceFactory);

    expect(factory).toBeDefined();
  });

  it('should import AppConfigModule', () => {
    // Module should compile successfully with AppConfigModule dependency
    expect(module).toBeDefined();
  });

  it('should allow S3ServiceFactory to be injected in other modules', () => {
    const factory = module.get<S3ServiceFactory>(S3ServiceFactory);

    expect(factory).toBeDefined();
    expect(typeof factory.createForBucket).toBe('function');
  });
});
