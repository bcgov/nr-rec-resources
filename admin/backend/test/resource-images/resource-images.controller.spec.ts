import { AppConfigModule } from '@/app-config/app-config.module';
import { PrismaService } from '@/prisma.service';
import { ResourceImagesController } from '@/resource-images/resource-images.controller';
import { ResourceImagesService } from '@/resource-images/service/resource-images.service';
import { ConsentFormsS3Service } from '@/resource-images/service/consent-forms-s3.service';
import { S3Service } from '@/s3/s3.service';
import { HttpException, INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

describe('ResourceImagesController', () => {
  let controller: ResourceImagesController;
  let resourceImagesService: ResourceImagesService;
  let app: INestApplication;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppConfigModule],
      controllers: [ResourceImagesController],
      providers: [
        ResourceImagesService,
        {
          provide: PrismaService,
          useValue: {},
        },
        {
          provide: S3Service,
          useValue: {
            getSignedUploadUrl: vi.fn(),
            deleteFile: vi.fn(),
            listObjectsByPrefix: vi.fn(),
          },
        },
        {
          provide: ConsentFormsS3Service,
          useValue: {
            uploadConsentForm: vi.fn(),
            getS3Service: vi.fn().mockReturnValue({ deleteFile: vi.fn() }),
            getConsentFormKey: vi.fn().mockReturnValue('mock/key.pdf'),
          },
        },
      ],
    }).compile();

    resourceImagesService = module.get<ResourceImagesService>(
      ResourceImagesService,
    );
    controller = module.get<ResourceImagesController>(ResourceImagesController);
    app = module.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getAll', () => {
    it('should return a list of Recreation Resource document', async () => {
      const result = [
        {
          rec_resource_id: 'REC1735',
          file_name: 'caption-change-321.webp',
          ref_id: '11829',
          created_at: '2025-07-08T20:26:01.793Z',
          recreation_resource_image_variants: [
            {
              url: '/filestore/9/2/8/1/1_b082d7e1136f066/11829col_044f8f9a9294732.jpg?v=1752006360',
              extension: 'jpg',
              width: 100,
              height: 57,
              size_code: 'col',
              created_at: '2025-07-08T20:26:01.793Z',
            },
            {
              url: '/filestore/9/2/8/1/1_b082d7e1136f066/11829_ea64bbf1713aa29.png?v=1752006359',
              extension: 'png',
              width: 1673,
              height: 961,
              size_code: 'original',
              created_at: '2025-07-08T20:26:01.793Z',
            },
          ],
        },
      ];
      vi.spyOn(resourceImagesService, 'getAll').mockResolvedValue(
        result as any,
      );
      expect(await controller.getAll('REC0001')).toBe(result);
    });

    it('should throw error if recreation resource not found', async () => {
      vi.spyOn(resourceImagesService, 'getAll').mockRejectedValue(
        new HttpException('Recreation Resource document not found', 404),
      );
      try {
        await controller.getAll('REC0001');
      } catch (e) {
        expect(e).toBeInstanceOf(HttpException);
        expect(e.message).toBe('Recreation Resource document not found');
        expect(e.getStatus()).toBe(404);
      }
    });
  });

  describe('delete', () => {
    it('should delete and return the deleted Recreation Resource document', async () => {
      const result = {
        rec_resource_id: 'REC1735',
        ref_id: '11829',
        file_name: 'caption-change-321.webp',
        updated_at: '2025-07-08T20:26:01.793Z',
        updated_by: null,
        created_at: '2025-07-08T20:26:01.793Z',
        created_by: null,
      };
      vi.spyOn(resourceImagesService, 'delete').mockResolvedValue(
        result as any,
      );
      expect(await controller.delete('REC0001', '11535')).toBe(result);
    });

    it('should throw error if recreation resource not found', async () => {
      vi.spyOn(resourceImagesService, 'delete').mockRejectedValue(
        new HttpException('Recreation Resource not found', 404),
      );
      try {
        await controller.delete('REC0001', '11535');
      } catch (e) {
        expect(e).toBeInstanceOf(HttpException);
        expect(e.message).toBe('Recreation Resource not found');
        expect(e.getStatus()).toBe(404);
      }
    });

    it('should propagate S3 errors from service', async () => {
      vi.spyOn(resourceImagesService, 'delete').mockRejectedValue(
        new HttpException('Failed to delete image: S3 error', 500),
      );
      try {
        await controller.delete('REC0001', '11535');
      } catch (e) {
        expect(e).toBeInstanceOf(HttpException);
        expect(e.message).toBe('Failed to delete image: S3 error');
        expect(e.getStatus()).toBe(500);
      }
    });
  });

  describe('presignImageUpload', () => {
    it('should return presigned URLs with fileName', async () => {
      const result = {
        image_id: 'test-image-id-123',
        presigned_urls: [
          {
            key: 'images/REC0001/test-image-id-123/original.webp',
            url: 'https://s3.amazonaws.com/presigned-url-1',
            size_code: 'original',
          },
          {
            key: 'images/REC0001/test-image-id-123/scr.webp',
            url: 'https://s3.amazonaws.com/presigned-url-2',
            size_code: 'scr',
          },
          {
            key: 'images/REC0001/test-image-id-123/pre.webp',
            url: 'https://s3.amazonaws.com/presigned-url-3',
            size_code: 'pre',
          },
          {
            key: 'images/REC0001/test-image-id-123/thm.webp',
            url: 'https://s3.amazonaws.com/presigned-url-4',
            size_code: 'thm',
          },
        ],
      };

      vi.spyOn(resourceImagesService, 'presignUpload').mockResolvedValue(
        result as any,
      );

      const response = await controller.presignImageUpload(
        'REC0001',
        'my-image',
      );

      expect(response).toBe(result);
      expect(resourceImagesService.presignUpload).toHaveBeenCalledWith(
        'REC0001',
        'my-image',
      );
    });

    it('should return presigned URLs without fileName', async () => {
      const result = {
        image_id: 'test-image-id-456',
        presigned_urls: [
          {
            key: 'images/REC0001/test-image-id-456/original.webp',
            url: 'https://s3.amazonaws.com/presigned-url-1',
            size_code: 'original',
          },
        ],
      };

      vi.spyOn(resourceImagesService, 'presignUpload').mockResolvedValue(
        result as any,
      );

      const response = await controller.presignImageUpload('REC0001', '');

      expect(response).toBe(result);
      expect(resourceImagesService.presignUpload).toHaveBeenCalledWith(
        'REC0001',
        '',
      );
    });

    it('should throw 404 error when resource not found', async () => {
      vi.spyOn(resourceImagesService, 'presignUpload').mockRejectedValue(
        new HttpException('Recreation Resource not found', 404),
      );

      try {
        await controller.presignImageUpload('REC9999', 'my-image');
      } catch (e) {
        expect(e).toBeInstanceOf(HttpException);
        expect(e.message).toBe('Recreation Resource not found');
        expect(e.getStatus()).toBe(404);
      }
    });

    it('should propagate S3 service errors', async () => {
      vi.spyOn(resourceImagesService, 'presignUpload').mockRejectedValue(
        new HttpException('Failed to generate presigned URLs', 500),
      );

      try {
        await controller.presignImageUpload('REC0001', 'my-image');
      } catch (e) {
        expect(e).toBeInstanceOf(HttpException);
        expect(e.message).toBe('Failed to generate presigned URLs');
        expect(e.getStatus()).toBe(500);
      }
    });

    it('should handle invalid fileName format', async () => {
      vi.spyOn(resourceImagesService, 'presignUpload').mockRejectedValue(
        new HttpException('Invalid fileName format', 400),
      );

      try {
        await controller.presignImageUpload('REC0001', 'invalid<>fileName');
      } catch (e) {
        expect(e).toBeInstanceOf(HttpException);
        expect(e.getStatus()).toBe(400);
      }
    });
  });

  describe('finalizeImageUpload', () => {
    it('should finalize image upload successfully', async () => {
      const body = {
        image_id: 'test-image-id-123',
        file_name: 'beautiful-mountain-view.webp',
        file_size_original: 2097152,
        file_size_scr: 1048576,
        file_size_pre: 524288,
        file_size_thm: 262144,
      };

      const result = {
        ref_id: 'test-image-id-123',
        image_id: 'test-image-id-123',
        file_name: 'beautiful-mountain-view.webp',
        created_at: '2025-01-01T00:00:00Z',
        recreation_resource_image_variants: [
          {
            url: 'https://cdn.example.com/images/REC0001/test-image-id-123/original.webp',
            size_code: 'original',
            extension: 'webp',
            width: 0,
            height: 0,
          },
        ],
      };

      vi.spyOn(resourceImagesService, 'finalizeUpload').mockResolvedValue(
        result as any,
      );

      const response = await controller.finalizeImageUpload('REC0001', body);

      expect(response).toBe(result);
      expect(resourceImagesService.finalizeUpload).toHaveBeenCalledWith(
        'REC0001',
        body,
        undefined,
      );
    });

    it('should throw 404 error when resource not found', async () => {
      const body = {
        image_id: 'test-image-id-123',
        file_name: 'test.webp',
        file_size_original: 1024,
        file_size_scr: 512,
        file_size_pre: 256,
        file_size_thm: 128,
      };

      vi.spyOn(resourceImagesService, 'finalizeUpload').mockRejectedValue(
        new HttpException('Recreation Resource not found', 404),
      );

      try {
        await controller.finalizeImageUpload('REC9999', body);
      } catch (e) {
        expect(e).toBeInstanceOf(HttpException);
        expect(e.message).toBe('Recreation Resource not found');
        expect(e.getStatus()).toBe(404);
      }
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

      vi.spyOn(resourceImagesService, 'finalizeUpload').mockRejectedValue(
        new HttpException('Invalid image_id', 400),
      );

      try {
        await controller.finalizeImageUpload('REC0001', body);
      } catch (e) {
        expect(e).toBeInstanceOf(HttpException);
        expect(e.message).toBe('Invalid image_id');
        expect(e.getStatus()).toBe(400);
      }
    });

    it('should throw 400 error for missing required fields', async () => {
      const body = {
        image_id: 'test-image-id-123',
        file_name: '',
        file_size_original: 1024,
        file_size_scr: 512,
        file_size_pre: 256,
        file_size_thm: 128,
      };

      vi.spyOn(resourceImagesService, 'finalizeUpload').mockRejectedValue(
        new HttpException('Missing required fields', 400),
      );

      try {
        await controller.finalizeImageUpload('REC0001', body);
      } catch (e) {
        expect(e).toBeInstanceOf(HttpException);
        expect(e.getStatus()).toBe(400);
      }
    });

    it('should propagate database errors', async () => {
      const body = {
        image_id: 'test-image-id-123',
        file_name: 'test.webp',
        file_size_original: 1024,
        file_size_scr: 512,
        file_size_pre: 256,
        file_size_thm: 128,
      };

      vi.spyOn(resourceImagesService, 'finalizeUpload').mockRejectedValue(
        new HttpException('Database error', 500),
      );

      try {
        await controller.finalizeImageUpload('REC0001', body);
      } catch (e) {
        expect(e).toBeInstanceOf(HttpException);
        expect(e.message).toBe('Database error');
        expect(e.getStatus()).toBe(500);
      }
    });
  });

  describe('getConsentDownloadUrl', () => {
    it('should return presigned URL for consent form download', async () => {
      vi.spyOn(
        resourceImagesService,
        'getConsentDownloadUrl',
      ).mockResolvedValue('https://s3.amazonaws.com/presigned-consent-url');

      const response = await controller.getConsentDownloadUrl(
        'REC0001',
        'image-123',
      );

      expect(response).toEqual({
        url: 'https://s3.amazonaws.com/presigned-consent-url',
      });
    });

    it('should throw 404 when consent form not found', async () => {
      vi.spyOn(
        resourceImagesService,
        'getConsentDownloadUrl',
      ).mockRejectedValue(
        new HttpException('Consent form not found for this image', 404),
      );

      try {
        await controller.getConsentDownloadUrl('REC0001', 'image-123');
      } catch (e) {
        expect(e).toBeInstanceOf(HttpException);
        expect(e.message).toBe('Consent form not found for this image');
        expect(e.getStatus()).toBe(404);
      }
    });
  });
});
