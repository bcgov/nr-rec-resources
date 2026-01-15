import { RecResourceImagesS3Service } from '@/resource-images/service/rec-resource-images-s3.service';
import { ResourceImagesService } from '@/resource-images/service/resource-images.service';
import { PrismaService } from 'src/prisma.service';
import { createVariantFiles } from 'test/test-utils/file-test-utils';
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
  let mockS3Service: Mocked<RecResourceImagesS3Service>;

  beforeEach(async () => {
    const mockS3ServiceValue = {
      uploadImageVariants: vi.fn(),
      deleteImageVariants: vi.fn(),
    } as any;

    const testModule = await createStorageTestModule<ResourceImagesService>({
      serviceClass: ResourceImagesService,
      customS3ServiceProvider: {
        provide: RecResourceImagesS3Service,
        useValue: mockS3ServiceValue,
      },
    });
    service = testModule.service;
    prismaService = testModule.prismaService;
    mockS3Service = mockS3ServiceValue;
    await setupAppConfigForStorage({
      bucketName: 'test-images-bucket',
      cloudfrontUrl: 'https://test-cdn.example.com',
    });
  });

  describe('getById', () => {
    it('should return one resource', async () => {
      const mockResource = createMockImage('11535', 'REC1735', {
        file_name: 'abbott-lake-rec1735.webp',
        created_at: new Date('2025-03-26T23:33:06.175Z'),
      });
      vi.mocked(
        prismaService.recreation_resource_image.findUnique,
      ).mockResolvedValue(mockResource as any);

      const result = await service.getImageByResourceId('REC0001', '11535');
      expect(result).toBeDefined();
      expect(result.ref_id).toBe('11535');
      expect(result.image_id).toBe('11535');
      expect(result.file_name).toBe('abbott-lake-rec1735.webp');
      expect(result.recreation_resource_image_variants).toHaveLength(4);
    });

    it('should return status 404 if resource not found', async () => {
      vi.mocked(
        prismaService.recreation_resource_image.findUnique,
      ).mockResolvedValueOnce(null);
      await expect(
        service.getImageByResourceId('REC0001', '11535'),
      ).rejects.toThrow();
    });
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

  describe('create', () => {
    const variantFiles = createVariantFiles();
    const mockResource = { rec_resource_id: 'REC0001' };
    const mockCreated = {
      rec_resource_id: 'REC0001',
      image_id: 'image-123',
      file_name: 'title.webp',
      extension: 'webp',
      file_size: BigInt(1024),
      created_at: new Date(),
    };
    const mockS3Paths = [
      'images/REC0001/image-123/original.webp',
      'images/REC0001/image-123/scr.webp',
      'images/REC0001/image-123/pre.webp',
      'images/REC0001/image-123/thm.webp',
    ];

    beforeEach(() => {
      vi.mocked(prismaService.recreation_resource.findUnique).mockResolvedValue(
        mockResource as any,
      );
      vi.mocked(mockS3Service.uploadImageVariants).mockResolvedValue(
        mockS3Paths,
      );
      vi.mocked(
        prismaService.recreation_resource_image.create,
      ).mockResolvedValue(mockCreated as any);
    });

    it('should return the created resource', async () => {
      const result = await service.create('REC0001', 'Title', variantFiles);
      expect(result).toBeDefined();
      expect(result.image_id).toBe('image-123');
      expect(result.ref_id).toBe('image-123');
      expect(result.file_name).toBe('title.webp');
      expect(result.recreation_resource_image_variants).toHaveLength(4);
      expect(
        prismaService.recreation_resource_image.create,
      ).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            file_name: expect.stringMatching(/^Title$/), // without .webp extension
            extension: 'webp',
            file_size: expect.any(BigInt),
          }),
        }),
      );
    });

    it('should return status 404 if resource not found', async () => {
      vi.mocked(prismaService.recreation_resource.findUnique).mockResolvedValue(
        null,
      );
      await expect(
        service.create('REC0001', 'Title', variantFiles),
      ).rejects.toThrow();
    });

    it('should return server error 500 after retrying to get resource path 3 times', async () => {
      vi.mocked(mockS3Service.uploadImageVariants).mockRejectedValueOnce(
        new Error('S3 upload failed'),
      );

      await expect(
        service.create('REC0001', 'Title', variantFiles),
      ).rejects.toThrow('Failed to upload image');
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
        prismaService.recreation_resource_image_variants.deleteMany,
      ).mockResolvedValue({} as any);
      vi.mocked(
        prismaService.recreation_resource_image.delete,
      ).mockResolvedValue(mockResource as any);
      vi.mocked(mockS3Service.deleteImageVariants).mockResolvedValue(undefined);

      const result = await service.delete('REC0001', '11535');
      expect(result).toBeDefined();
      expect(result?.ref_id).toBe('11535');
      expect(result?.image_id).toBe('11535');
      expect(result?.file_name).toBe('abbott-lake-rec1735.webp');
      expect(result?.recreation_resource_image_variants).toHaveLength(4);
    });

    it('should throw HttpException when image is not found (covers line 182)', async () => {
      vi.mocked(
        prismaService.recreation_resource_image.findUnique,
      ).mockResolvedValue(null);

      await expect(service.delete('REC0001', 'nonexistent')).rejects.toThrow(
        'Recreation Resource image not found',
      );
      expect(mockS3Service.deleteImageVariants).not.toHaveBeenCalled();
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
        expect(variant.url).toContain('images/REC0001/image-123/original.webp');
      }
    });
  });

  describe('S3 Integration Error Handling', () => {
    const createServiceWithS3Error = async (
      s3Error: Error,
      operation: 'upload' | 'delete',
    ) => {
      const mockS3ServiceValue = {
        uploadImageVariants:
          operation === 'upload'
            ? vi.fn().mockRejectedValueOnce(s3Error)
            : vi.fn(),
        deleteImageVariants:
          operation === 'delete'
            ? vi.fn().mockRejectedValueOnce(s3Error)
            : vi.fn(),
      } as any;

      return await createStorageTestModule<ResourceImagesService>({
        serviceClass: ResourceImagesService,
        prismaOverrides: {
          recreation_resource: {
            findUnique: vi.fn().mockResolvedValue({
              rec_resource_id: 'REC0001',
            }),
          },
          recreation_resource_image: {
            findUnique:
              operation === 'delete'
                ? vi.fn().mockResolvedValue({
                    rec_resource_id: 'REC0001',
                    image_id: 'image-123',
                  })
                : undefined,
            create: operation === 'upload' ? vi.fn() : undefined,
            delete: operation === 'delete' ? vi.fn() : undefined,
          },
          recreation_resource_image_variants:
            operation === 'delete' ? { deleteMany: vi.fn() } : undefined,
        },
        customS3ServiceProvider: {
          provide: RecResourceImagesS3Service,
          useValue: mockS3ServiceValue,
        },
      });
    };
    it('should handle S3 upload failure in create()', async () => {
      const variantFiles = createVariantFiles();
      const { service: serviceWithS3 } = await createServiceWithS3Error(
        new Error('S3 upload failed'),
        'upload',
      );

      await expect(
        serviceWithS3.create('REC0001', 'Caption', variantFiles),
      ).rejects.toThrow('Failed to upload image: S3 upload failed');
    });

    it('should handle S3 delete failure in delete()', async () => {
      const { service: serviceWithS3 } = await createServiceWithS3Error(
        new Error('S3 delete failed'),
        'delete',
      );

      await expect(
        serviceWithS3.delete('REC0001', 'image-123'),
      ).rejects.toThrow('Failed to delete image: S3 delete failed');
    });
  });
});
