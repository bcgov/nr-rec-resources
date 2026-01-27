import { ResourceImagesService } from '@/resource-images/service/resource-images.service';
import { PrismaService } from 'src/prisma.service';
import { S3Service } from 'src/s3/s3.service';
import { Mocked, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  createMockImage,
  createStorageTestModule,
  setupAppConfigForStorage,
} from '../../test-utils/storage-test-utils';

vi.mock('fs');

describe('ResourceImagesDocsService', () => {
  let prismaService: Mocked<PrismaService>;
  let service: ResourceImagesService;
  let s3Service: Mocked<S3Service>;

  beforeEach(async () => {
    const mockS3Service = {
      getSignedUploadUrl: vi.fn(),
      deleteFile: vi.fn(),
      listObjectsByPrefix: vi.fn(),
      getSignedUrl: vi.fn(),
    } as any;

    const testModule = await createStorageTestModule<ResourceImagesService>({
      serviceClass: ResourceImagesService,
      s3ServiceOverrides: mockS3Service,
    });
    service = testModule.service;
    prismaService = testModule.prismaService;
    s3Service = testModule.s3Service!;
    await setupAppConfigForStorage({
      bucketName: 'test-images-bucket',
      cloudfrontUrl: 'https://test-cdn.example.com',
    });

    // Mock recreation_resource for validation (after prismaService is initialized)
    vi.mocked(prismaService.recreation_resource.findUnique).mockResolvedValue({
      rec_resource_id: 'REC0001',
    } as any);
  });

  describe('getAll', () => {
    it('should return all image resources related to the resource', async () => {
      const mockResources = [
        createMockImage('30863', 'REC1735', {
          file_name: 'abbott-lake-rec1735.webp',
          created_at: new Date('2025-03-26T23:33:06.175Z'),
        }),
        createMockImage('27953', 'REC1735', {
          file_name: 'abbott-lake-rec1735.webp',
          created_at: new Date('2025-03-26T23:33:06.175Z'),
        }),
      ];
      vi.mocked(
        prismaService.recreation_resource_image.findMany,
      ).mockResolvedValue(mockResources as any);

      const result = await service.getAll('REC0001');
      expect(result).toBeDefined();
      expect(result).toHaveLength(2);
      expect(result?.[0]?.ref_id).toBe('30863');
      expect(result?.[0]?.image_id).toBe('30863');
      expect(result?.[0]?.recreation_resource_image_variants).toHaveLength(4);
    });

    it('should return empty array if resource not found', async () => {
      vi.mocked(
        prismaService.recreation_resource_image.findMany,
      ).mockResolvedValueOnce([]);
      const result = await service.getAll('NONEXISTENT');
      expect(result?.length).toBe(0);
    });
  });

  describe('delete', () => {
    it('should return the deleted resource', async () => {
      const mockResource = createMockImage('11535', 'REC1735', {
        file_name: 'abbott-lake-rec1735.webp',
        created_at: new Date('2025-03-26T23:33:06.175Z'),
      });
      vi.mocked(
        prismaService.recreation_resource_image.findUnique,
      ).mockResolvedValue(mockResource as any);
      vi.mocked(
        prismaService.recreation_resource_image.delete,
      ).mockResolvedValue(mockResource as any);

      // Mock S3 list and delete operations
      const mockObjects = [
        {
          key: 'images/REC0001/11535/original.webp',
          size: 1024,
          lastModified: new Date(),
        },
        {
          key: 'images/REC0001/11535/scr.webp',
          size: 512,
          lastModified: new Date(),
        },
        {
          key: 'images/REC0001/11535/pre.webp',
          size: 256,
          lastModified: new Date(),
        },
        {
          key: 'images/REC0001/11535/thm.webp',
          size: 128,
          lastModified: new Date(),
        },
      ];
      vi.mocked(s3Service.listObjectsByPrefix).mockResolvedValue(mockObjects);
      vi.mocked(s3Service.deleteFile).mockResolvedValue(undefined);

      const result = await service.delete('REC0001', '11535');
      expect(result).toBeDefined();
      expect(result?.ref_id).toBe('11535');
      expect(result?.image_id).toBe('11535');
      expect(result?.file_name).toBe('abbott-lake-rec1735.webp');
      expect(result?.recreation_resource_image_variants).toHaveLength(4);
      expect(s3Service.listObjectsByPrefix).toHaveBeenCalledWith(
        'images/REC0001/11535/',
      );
      expect(s3Service.deleteFile).toHaveBeenCalledTimes(4);
    });

    it('should throw HttpException when image is not found', async () => {
      vi.mocked(
        prismaService.recreation_resource_image.findUnique,
      ).mockResolvedValue(null);

      await expect(service.delete('REC0001', 'nonexistent')).rejects.toThrow(
        'Recreation Resource image not found',
      );
      expect(s3Service.listObjectsByPrefix).not.toHaveBeenCalled();
    });
  });

  describe('URL Construction (service-specific)', () => {
    it('should construct URLs with correct image variant S3 key format', async () => {
      const payload = createMockImage('image-123', 'REC0001', {
        file_name: 'test-image.webp',
      });

      vi.mocked(
        prismaService.recreation_resource_image.findMany,
      ).mockResolvedValue([payload] as any);

      const result = await service.getAll('REC0001');

      expect(result).toBeDefined();
      expect(result?.[0]?.recreation_resource_image_variants).toBeDefined();
      if (result?.[0]?.recreation_resource_image_variants) {
        const variant = result[0].recreation_resource_image_variants[0];
        expect(variant).toBeDefined();
        expect(variant!.url).toContain(
          'images/REC0001/image-123/original.webp',
        );
      }
    });
  });

  describe('S3 Integration Error Handling', () => {
    it('should handle S3 delete failure in delete()', async () => {
      const mockResource = createMockImage('image-123', 'REC0001');
      vi.mocked(
        prismaService.recreation_resource_image.findUnique,
      ).mockResolvedValue(mockResource as any);

      // Mock S3 list to succeed but delete to fail
      vi.mocked(s3Service.listObjectsByPrefix).mockResolvedValue([
        {
          key: 'images/REC0001/image-123/original.webp',
          size: 1024,
          lastModified: new Date(),
        },
      ]);
      vi.mocked(s3Service.deleteFile).mockRejectedValueOnce(
        new Error('S3 delete failed'),
      );

      await expect(service.delete('REC0001', 'image-123')).rejects.toThrow(
        'Failed to delete image',
      );
    });
  });

  describe('presignUpload', () => {
    it('should generate 4 presigned URLs with fileName (tags on original)', async () => {
      const mockUrls = [
        'https://s3.amazonaws.com/presigned-url-1',
        'https://s3.amazonaws.com/presigned-url-2',
        'https://s3.amazonaws.com/presigned-url-3',
        'https://s3.amazonaws.com/presigned-url-4',
      ];

      vi.mocked(s3Service.getSignedUploadUrl)
        .mockResolvedValueOnce(mockUrls[0])
        .mockResolvedValueOnce(mockUrls[1])
        .mockResolvedValueOnce(mockUrls[2])
        .mockResolvedValueOnce(mockUrls[3]);

      const result = await service.presignUpload('REC0001', 'my-image');

      expect(result).toBeDefined();
      expect(result.image_id).toBeDefined();
      expect(result.presigned_urls).toHaveLength(4);
      expect(result.presigned_urls[0].size_code).toBe('original');
      expect(result.presigned_urls[1].size_code).toBe('scr');
      expect(result.presigned_urls[2].size_code).toBe('pre');
      expect(result.presigned_urls[3].size_code).toBe('thm');

      // Verify tags are added to original variant
      expect(s3Service.getSignedUploadUrl).toHaveBeenCalledWith(
        expect.stringContaining('original.webp'),
        'image/webp',
        900,
        { filename: 'my-image' },
      );

      // Verify other variants don't have tags
      expect(s3Service.getSignedUploadUrl).toHaveBeenCalledWith(
        expect.stringContaining('scr.webp'),
        'image/webp',
        900,
        undefined,
      );
    });

    it('should generate 4 presigned URLs without fileName (no tags)', async () => {
      const mockUrls = [
        'https://s3.amazonaws.com/presigned-url-1',
        'https://s3.amazonaws.com/presigned-url-2',
        'https://s3.amazonaws.com/presigned-url-3',
        'https://s3.amazonaws.com/presigned-url-4',
      ];

      vi.mocked(s3Service.getSignedUploadUrl)
        .mockResolvedValueOnce(mockUrls[0])
        .mockResolvedValueOnce(mockUrls[1])
        .mockResolvedValueOnce(mockUrls[2])
        .mockResolvedValueOnce(mockUrls[3]);

      const result = await service.presignUpload('REC0001', '');

      expect(result).toBeDefined();
      expect(result.presigned_urls).toHaveLength(4);

      // Verify no tags on original when fileName is empty
      expect(s3Service.getSignedUploadUrl).toHaveBeenCalledWith(
        expect.stringContaining('original.webp'),
        'image/webp',
        900,
        undefined,
      );
    });

    it('should validate resource exists before generating URLs', async () => {
      vi.mocked(prismaService.recreation_resource.findUnique).mockResolvedValue(
        null,
      );

      await expect(
        service.presignUpload('REC9999', 'my-image'),
      ).rejects.toThrow('Recreation Resource not found');

      expect(s3Service.getSignedUploadUrl).not.toHaveBeenCalled();
    });

    it('should handle S3 service errors', async () => {
      vi.mocked(s3Service.getSignedUploadUrl).mockRejectedValueOnce(
        new Error('S3 service error'),
      );

      await expect(
        service.presignUpload('REC0001', 'my-image'),
      ).rejects.toThrow('Failed to generate presigned URLs');
    });

    it('should construct correct S3 keys for all variants', async () => {
      vi.mocked(s3Service.getSignedUploadUrl).mockResolvedValue(
        'https://s3.amazonaws.com/url',
      );

      await service.presignUpload('REC0001', 'test-image');

      const calls = vi.mocked(s3Service.getSignedUploadUrl).mock.calls;
      const keys = calls.map((call) => call[0]);

      expect(keys[0]).toContain('images/REC0001/');
      expect(keys[0]).toContain('/original.webp');
      expect(keys[1]).toContain('/scr.webp');
      expect(keys[2]).toContain('/pre.webp');
      expect(keys[3]).toContain('/thm.webp');
    });
  });

  describe('finalizeUpload', () => {
    it('should create database record successfully', async () => {
      const body = {
        image_id: 'test-image-id-123',
        file_name: 'beautiful-mountain-view.webp',
        file_size_original: 2097152,
        file_size_scr: 1048576,
        file_size_pre: 524288,
        file_size_thm: 262144,
      };

      const mockCreated = createMockImage('test-image-id-123', 'REC0001', {
        file_name: 'beautiful-mountain-view.webp',
        file_size: BigInt(2097152),
      });

      vi.mocked(
        prismaService.recreation_resource_image.create,
      ).mockResolvedValue(mockCreated as any);

      const result = await service.finalizeUpload('REC0001', body);

      expect(result).toBeDefined();
      expect(result.image_id).toBe('test-image-id-123');
      expect(result.file_name).toBe('beautiful-mountain-view.webp');
      expect(
        prismaService.recreation_resource_image.create,
      ).toHaveBeenCalledWith({
        data: {
          image_id: 'test-image-id-123',
          rec_resource_id: 'REC0001',
          file_name: 'beautiful-mountain-view.webp',
          extension: 'webp',
          file_size: BigInt(2097152),
          created_by: 'system',
          created_at: expect.any(Date),
        },
      });
    });

    it('should validate resource exists before creating record', async () => {
      vi.mocked(prismaService.recreation_resource.findUnique).mockResolvedValue(
        null,
      );

      const body = {
        image_id: 'test-image-id-123',
        file_name: 'test.webp',
        file_size_original: 1024,
        file_size_scr: 512,
        file_size_pre: 256,
        file_size_thm: 128,
      };

      await expect(service.finalizeUpload('REC9999', body)).rejects.toThrow(
        'Recreation Resource not found',
      );

      expect(
        prismaService.recreation_resource_image.create,
      ).not.toHaveBeenCalled();
    });

    it('should throw 400 error for invalid image_id', async () => {
      const body = {
        image_id: '',
        file_name: 'test.webp',
        file_size_original: 1024,
        file_size_scr: 512,
        file_size_pre: 256,
        file_size_thm: 128,
      };

      await expect(service.finalizeUpload('REC0001', body)).rejects.toThrow(
        'Invalid image_id',
      );
    });

    it('should throw 400 error for non-string image_id', async () => {
      const body = {
        image_id: null as any,
        file_name: 'test.webp',
        file_size_original: 1024,
        file_size_scr: 512,
        file_size_pre: 256,
        file_size_thm: 128,
      };

      await expect(service.finalizeUpload('REC0001', body)).rejects.toThrow(
        'Invalid image_id',
      );
    });

    it('should handle database creation errors', async () => {
      const body = {
        image_id: 'test-image-id-123',
        file_name: 'test.webp',
        file_size_original: 1024,
        file_size_scr: 512,
        file_size_pre: 256,
        file_size_thm: 128,
      };

      vi.mocked(
        prismaService.recreation_resource_image.create,
      ).mockRejectedValue(new Error('Database error'));

      await expect(service.finalizeUpload('REC0001', body)).rejects.toThrow(
        'Failed to finalize upload',
      );
    });
  });
});
