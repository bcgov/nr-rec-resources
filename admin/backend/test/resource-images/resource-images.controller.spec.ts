import { AppConfigModule } from '@/app-config/app-config.module';
import { PrismaService } from '@/prisma.service';
import { ResourceImagesController } from '@/resource-images/resource-images.controller';
import { RecResourceImagesS3Service } from '@/resource-images/service/rec-resource-images-s3.service';
import { ResourceImagesService } from '@/resource-images/service/resource-images.service';
import { HttpException, INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Readable } from 'stream';
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
          provide: RecResourceImagesS3Service,
          useValue: {
            uploadImageVariants: vi.fn(),
            deleteImageVariants: vi.fn(),
          },
        },
        {
          provide: RecResourceImagesS3Service,
          useValue: {
            uploadImageVariants: vi.fn(),
            deleteImageVariants: vi.fn(),
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

  describe('getImageByResourceId', () => {
    it('should return a Recreation Resource image', async () => {
      const result = {
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
      };
      vi.spyOn(resourceImagesService, 'getImageByResourceId').mockResolvedValue(
        result as any,
      );
      expect(await controller.getImageByResourceId('REC0001', '11535')).toBe(
        result,
      );
    });

    it('should throw error if recreation resource not found', async () => {
      vi.spyOn(resourceImagesService, 'getImageByResourceId').mockRejectedValue(
        new HttpException('Recreation Resource document not found', 404),
      );
      try {
        await controller.getImageByResourceId('REC0001', '11535');
      } catch (e) {
        expect(e).toBeInstanceOf(HttpException);
        expect(e.message).toBe('Recreation Resource document not found');
        expect(e.getStatus()).toBe(404);
      }
    });
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

  describe('create', () => {
    it('should create and return a Recreation Resource image', async () => {
      const result = {
        rec_resource_id: 'REC1735',
        ref_id: '11829',
        image_id: '11829',
        file_name: 'new-resource-image.webp',
        created_at: '2025-07-08T20:26:01.793Z',
        recreation_resource_image_variants: [],
      };
      vi.spyOn(resourceImagesService, 'create').mockResolvedValue(
        result as any,
      );
      const files = {
        original: [
          {
            originalname: 'original.webp',
            mimetype: 'image/webp',
            path: 'original',
            buffer: Buffer.from('file'),
            fieldname: 'original',
            encoding: '',
            size: 0,
            stream: Readable.from(['test content']),
            destination: '',
            filename: '',
          },
        ],
        scr: [
          {
            originalname: 'scr.webp',
            mimetype: 'image/webp',
            path: 'scr',
            buffer: Buffer.from('file'),
            fieldname: 'scr',
            encoding: '',
            size: 0,
            stream: Readable.from(['test content']),
            destination: '',
            filename: '',
          },
        ],
        pre: [
          {
            originalname: 'pre.webp',
            mimetype: 'image/webp',
            path: 'pre',
            buffer: Buffer.from('file'),
            fieldname: 'pre',
            encoding: '',
            size: 0,
            stream: Readable.from(['test content']),
            destination: '',
            filename: '',
          },
        ],
        thm: [
          {
            originalname: 'thm.webp',
            mimetype: 'image/webp',
            path: 'thm',
            buffer: Buffer.from('file'),
            fieldname: 'thm',
            encoding: '',
            size: 0,
            stream: Readable.from(['test content']),
            destination: '',
            filename: '',
          },
        ],
      };
      expect(
        await controller.createRecreationResourceImage(
          'REC0001',
          { file_name: 'caption.webp' },
          files,
        ),
      ).toBe(result);
    });

    it('should throw error if recreation resource not found', async () => {
      vi.spyOn(resourceImagesService, 'create').mockRejectedValue(
        new HttpException('Recreation Resource not found', 404),
      );
      const files = {
        original: [
          {
            originalname: 'original.webp',
            mimetype: 'image/webp',
            path: 'original',
            buffer: Buffer.from('file'),
            fieldname: 'original',
            encoding: '',
            size: 0,
            stream: Readable.from(['test content']),
            destination: '',
            filename: '',
          },
        ],
        scr: [
          {
            originalname: 'scr.webp',
            mimetype: 'image/webp',
            path: 'scr',
            buffer: Buffer.from('file'),
            fieldname: 'scr',
            encoding: '',
            size: 0,
            stream: Readable.from(['test content']),
            destination: '',
            filename: '',
          },
        ],
        pre: [
          {
            originalname: 'pre.webp',
            mimetype: 'image/webp',
            path: 'pre',
            buffer: Buffer.from('file'),
            fieldname: 'pre',
            encoding: '',
            size: 0,
            stream: Readable.from(['test content']),
            destination: '',
            filename: '',
          },
        ],
        thm: [
          {
            originalname: 'thm.webp',
            mimetype: 'image/webp',
            path: 'thm',
            buffer: Buffer.from('file'),
            fieldname: 'thm',
            encoding: '',
            size: 0,
            stream: Readable.from(['test content']),
            destination: '',
            filename: '',
          },
        ],
      };
      try {
        await controller.createRecreationResourceImage(
          'REC0001',
          { file_name: 'caption.webp' },
          files,
        );
      } catch (e) {
        expect(e).toBeInstanceOf(HttpException);
        expect(e.message).toBe('Recreation Resource not found');
        expect(e.getStatus()).toBe(404);
      }
    });

    it('should throw error if file type not allowed', async () => {
      vi.spyOn(resourceImagesService, 'create').mockRejectedValue(
        new HttpException("Variant 'original' must be WebP format", 400),
      );
      const files = {
        original: [
          {
            originalname: 'original.jpg',
            mimetype: 'image/jpeg',
            path: 'original',
            buffer: Buffer.from('file'),
            fieldname: 'original',
            encoding: '',
            size: 0,
            stream: Readable.from(['test content']),
            destination: '',
            filename: '',
          },
        ],
        scr: [
          {
            originalname: 'scr.webp',
            mimetype: 'image/webp',
            path: 'scr',
            buffer: Buffer.from('file'),
            fieldname: 'scr',
            encoding: '',
            size: 0,
            stream: Readable.from(['test content']),
            destination: '',
            filename: '',
          },
        ],
        pre: [
          {
            originalname: 'pre.webp',
            mimetype: 'image/webp',
            path: 'pre',
            buffer: Buffer.from('file'),
            fieldname: 'pre',
            encoding: '',
            size: 0,
            stream: Readable.from(['test content']),
            destination: '',
            filename: '',
          },
        ],
        thm: [
          {
            originalname: 'thm.webp',
            mimetype: 'image/webp',
            path: 'thm',
            buffer: Buffer.from('file'),
            fieldname: 'thm',
            encoding: '',
            size: 0,
            stream: Readable.from(['test content']),
            destination: '',
            filename: '',
          },
        ],
      };
      try {
        await controller.createRecreationResourceImage(
          'REC0001',
          { file_name: 'caption.webp' },
          files,
        );
      } catch (e) {
        expect(e).toBeInstanceOf(HttpException);
        expect(e.message).toContain("Variant 'original' must be WebP format");
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

  describe('create - missing variant files', () => {
    it('should handle missing variant files', async () => {
      try {
        await controller.createRecreationResourceImage(
          'REC0001',
          { file_name: 'caption.webp' },
          undefined as any,
        );
      } catch (e) {
        expect(e).toBeInstanceOf(Error);
      }
    });
  });
});
