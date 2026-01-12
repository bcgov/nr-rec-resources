import { AppConfigModule } from '@/app-config/app-config.module';
import { AppConfigService } from '@/app-config/app-config.service';
import { RecResourceImagesS3Service } from '@/resource-images/service/rec-resource-images-s3.service';
import { S3ServiceFactory } from '@/s3/s3-service.factory';
import { S3Service } from '@/s3/s3.service';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { Test, TestingModule } from '@nestjs/testing';
import {
  createMockS3Client,
  setupS3ClientMock,
} from 'test/test-utils/s3-test-utils';
import { Mocked, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@aws-sdk/client-s3');
vi.mock('@aws-sdk/s3-request-presigner');

describe('RecResourceImagesS3Service', () => {
  let service: RecResourceImagesS3Service;
  let mockS3Client: Mocked<S3Client>;
  let mockAppConfig: Mocked<AppConfigService>;
  let mockS3Service: Mocked<S3Service>;
  let mockS3Factory: Mocked<S3ServiceFactory>;

  beforeEach(async () => {
    vi.clearAllMocks();

    mockS3Client = createMockS3Client();
    setupS3ClientMock(mockS3Client);

    mockAppConfig = {
      recResourceImagesBucket: 'test-images-bucket',
      awsEndpointUrl: undefined,
      awsRegion: 'us-east-1',
      recResourceStorageCloudfrontUrl: 'https://test-cdn.example.com',
    } as any;

    mockS3Service = {
      getBucketName: vi.fn().mockReturnValue('test-images-bucket'),
      getS3Client: vi.fn().mockReturnValue(mockS3Client),
      listObjectsByPrefix: vi.fn(),
      deleteFile: vi.fn(),
      getSignedUrl: vi.fn(),
    } as any;

    mockS3Factory = {
      createForBucket: vi.fn().mockReturnValue(mockS3Service),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      imports: [AppConfigModule],
      providers: [
        RecResourceImagesS3Service,
        {
          provide: AppConfigService,
          useValue: mockAppConfig,
        },
        {
          provide: S3ServiceFactory,
          useValue: mockS3Factory,
        },
      ],
    }).compile();

    service = module.get<RecResourceImagesS3Service>(
      RecResourceImagesS3Service,
    );
  });

  describe('Service Initialization', () => {
    it('should be defined', () => {
      expect(service).toBeDefined();
    });

    it('should use S3ServiceFactory to create S3Service instance', () => {
      expect(mockS3Factory.createForBucket).toHaveBeenCalledWith(
        'test-images-bucket',
      );
    });
  });

  describe('uploadImageVariant', () => {
    const recResourceId = 'REC0001';
    const imageId = 'image-123';
    const sizeCode = 'original';
    const buffer = Buffer.from('image data');

    it('should upload image variant successfully with metadata', async () => {
      const metadata = { filename: 'Test Caption' };
      const expectedKey = `images/${recResourceId}/${imageId}/${sizeCode}.webp`;

      const commandInputs: any[] = [];
      vi.mocked(PutObjectCommand).mockImplementation(function (input: any) {
        commandInputs.push(input);
        return {
          input,
        } as any;
      });

      mockS3Client.send.mockResolvedValueOnce({} as any);

      const result = await service.uploadImageVariant(
        recResourceId,
        imageId,
        sizeCode,
        buffer,
        metadata,
      );

      expect(result).toBe(expectedKey);
      expect(mockS3Client.send).toHaveBeenCalled();
      expect(commandInputs).toHaveLength(1);
      expect(commandInputs[0].Tagging).toBe('filename=Test Caption');
      expect(commandInputs[0].ContentType).toBe('image/webp');
      expect(commandInputs[0].Body).toBe(buffer);
      expect(commandInputs[0].Key).toBe(expectedKey);
    });

    it('should upload image variant without metadata', async () => {
      const expectedKey = `images/${recResourceId}/${imageId}/${sizeCode}.webp`;

      const commandInputs: any[] = [];
      vi.mocked(PutObjectCommand).mockImplementation(function (input: any) {
        commandInputs.push(input);
        return {
          input,
        } as any;
      });

      mockS3Client.send.mockResolvedValueOnce({} as any);

      const result = await service.uploadImageVariant(
        recResourceId,
        imageId,
        sizeCode,
        buffer,
      );

      expect(result).toBe(expectedKey);
      expect(mockS3Client.send).toHaveBeenCalled();
      expect(commandInputs).toHaveLength(1);
      expect(commandInputs[0].Tagging).toBeUndefined();
      expect(commandInputs[0].ContentType).toBe('image/webp');
      expect(commandInputs[0].Body).toBe(buffer);
      expect(commandInputs[0].Key).toBe(expectedKey);
    });

    it('should handle upload errors', async () => {
      const error = new Error('Upload failed');
      mockS3Client.send.mockRejectedValueOnce(error);

      await expect(
        service.uploadImageVariant(recResourceId, imageId, sizeCode, buffer),
      ).rejects.toThrow('Upload failed');
    });
  });

  describe('uploadImageVariants', () => {
    const recResourceId = 'REC0001';
    const imageId = 'image-123';
    const variants = [
      {
        sizeCode: 'original',
        buffer: Buffer.from('original'),
        metadata: { filename: 'Caption' },
      },
      { sizeCode: 'scr', buffer: Buffer.from('scr') },
      { sizeCode: 'pre', buffer: Buffer.from('pre') },
      { sizeCode: 'thm', buffer: Buffer.from('thm') },
    ];

    it('should upload all variants successfully', async () => {
      mockS3Client.send.mockResolvedValue({} as any);

      const result = await service.uploadImageVariants(
        recResourceId,
        imageId,
        variants,
      );

      expect(result).toHaveLength(4);
      expect(mockS3Client.send).toHaveBeenCalledTimes(4);
    });

    it('should rollback all uploaded files on partial failure', async () => {
      mockS3Client.send.mockResolvedValueOnce({} as any);
      mockS3Client.send.mockResolvedValueOnce({} as any);
      mockS3Client.send.mockRejectedValueOnce(new Error('Upload failed'));
      vi.mocked(mockS3Service.deleteFile).mockResolvedValue(undefined);

      await expect(
        service.uploadImageVariants(recResourceId, imageId, variants),
      ).rejects.toThrow('Upload failed');

      expect(mockS3Service.deleteFile).toHaveBeenCalledTimes(2);
    });

    it('should handle rollback failures gracefully', async () => {
      mockS3Client.send.mockResolvedValueOnce({} as any);
      mockS3Client.send.mockRejectedValueOnce(new Error('Upload failed'));
      vi.mocked(mockS3Service.deleteFile).mockRejectedValueOnce(
        new Error('Delete failed'),
      );

      await expect(
        service.uploadImageVariants(recResourceId, imageId, variants),
      ).rejects.toThrow('Upload failed');

      expect(mockS3Service.deleteFile).toHaveBeenCalled();
    });
  });

  describe('deleteImageVariants', () => {
    const recResourceId = 'REC0001';
    const imageId = 'image-123';

    it('should delete all variants successfully', async () => {
      const objects = [
        {
          key: `images/${recResourceId}/${imageId}/original.webp`,
          size: 1024,
          lastModified: new Date(),
        },
        {
          key: `images/${recResourceId}/${imageId}/scr.webp`,
          size: 512,
          lastModified: new Date(),
        },
      ];

      vi.mocked(mockS3Service.listObjectsByPrefix).mockResolvedValueOnce(
        objects,
      );
      vi.mocked(mockS3Service.deleteFile).mockResolvedValue(undefined);

      await service.deleteImageVariants(recResourceId, imageId);

      expect(mockS3Service.listObjectsByPrefix).toHaveBeenCalledWith(
        `images/${recResourceId}/${imageId}/`,
      );

      expect(mockS3Service.deleteFile).toHaveBeenCalledTimes(2);
      expect(mockS3Service.deleteFile).toHaveBeenCalledWith(objects[0]?.key);
      expect(mockS3Service.deleteFile).toHaveBeenCalledWith(objects[1]?.key);
    });

    it('should handle empty prefix results', async () => {
      vi.mocked(mockS3Service.listObjectsByPrefix).mockResolvedValueOnce([]);

      await service.deleteImageVariants(recResourceId, imageId);

      expect(mockS3Service.deleteFile).not.toHaveBeenCalled();
    });

    it('should handle deletion errors', async () => {
      const objects = [
        {
          key: `images/${recResourceId}/${imageId}/original.webp`,
          size: 1024,
          lastModified: new Date(),
        },
      ];

      vi.mocked(mockS3Service.listObjectsByPrefix).mockResolvedValueOnce(
        objects,
      );
      vi.mocked(mockS3Service.deleteFile).mockRejectedValueOnce(
        new Error('Delete failed'),
      );

      await expect(
        service.deleteImageVariants(recResourceId, imageId),
      ).rejects.toThrow('Delete failed');
    });
  });
});
