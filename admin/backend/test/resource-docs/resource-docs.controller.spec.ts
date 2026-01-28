import { AppConfigModule } from '@/app-config/app-config.module';
import { ResourceDocsController } from '@/resource-docs/resource-docs.controller';
import { ResourceDocsService } from '@/resource-docs/service/resource-docs.service';
import { HttpException, INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from 'src/prisma.service';
import { S3Service } from 'src/s3/s3.service';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

describe('ResourceDocsController', () => {
  let controller: ResourceDocsController;
  let resourceDocsService: ResourceDocsService;
  let app: INestApplication;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppConfigModule],
      controllers: [ResourceDocsController],
      providers: [
        ResourceDocsService,
        {
          provide: PrismaService,
          useValue: {},
        },
        {
          provide: S3Service,
          useValue: {
            uploadFile: vi.fn(),
            deleteFile: vi.fn(),
            getSignedUrl: vi.fn(),
            listObjectsByPrefix: vi.fn(),
          },
        },
      ],
    }).compile();

    resourceDocsService = module.get<ResourceDocsService>(ResourceDocsService);
    controller = module.get<ResourceDocsController>(ResourceDocsController);
    app = module.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    if (app) {
      await app.close();
    }
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getAll', () => {
    it('should return a list of Recreation Resource document', async () => {
      const result = [
        {
          rec_resource_id: 'REC136003',
          document_id: '11535',
          title: 'Tenquille Lake - Hawint Map',
          url: 'https://test-cdn.example.com/REC136003/11535.pdf',
          created_at: new Date().toISOString(),
        },
        {
          rec_resource_id: 'REC136003',
          document_id: '11725',
          title: 'new resource',
          url: 'https://test-cdn.example.com/documents/REC136003/11725/sample.pdf',
          created_at: new Date().toISOString(),
        },
      ];
      vi.spyOn(resourceDocsService, 'getAll').mockResolvedValue(result as any);
      expect(await controller.getAll('REC0001')).toBe(result);
    });

    it('should throw error if recreation resource not found', async () => {
      vi.spyOn(resourceDocsService, 'getAll').mockRejectedValue(
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
        rec_resource_id: 'REC136003',
        document_id: '11535',
        title: 'Tenquille Lake - Hawint Map',
        url: 'https://test-cdn.example.com/documents/REC136003/11535/sample.pdf',
        created_at: new Date().toISOString(),
      };
      vi.spyOn(resourceDocsService, 'delete').mockResolvedValue(result as any);
      expect(await controller.delete('REC0001', '11535')).toBe(result);
    });

    it('should throw error if recreation resource not found', async () => {
      vi.spyOn(resourceDocsService, 'delete').mockRejectedValue(
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
  });

  describe('presignDocUpload', () => {
    it('should return presigned URL successfully', async () => {
      const result = {
        document_id: 'test-document-id-123',
        key: 'documents/REC0001/test-document-id-123/campbell-river-site-map.pdf',
        url: 'https://s3.amazonaws.com/presigned-url',
      };

      vi.spyOn(resourceDocsService, 'presignUpload').mockResolvedValue(
        result as any,
      );

      const response = await controller.presignDocUpload(
        'REC0001',
        'campbell-river-site-map.pdf',
      );

      expect(response).toBe(result);
      expect(resourceDocsService.presignUpload).toHaveBeenCalledWith(
        'REC0001',
        'campbell-river-site-map.pdf',
      );
    });

    it('should throw 404 error when resource not found', async () => {
      vi.spyOn(resourceDocsService, 'presignUpload').mockRejectedValue(
        new HttpException('Recreation Resource not found', 404),
      );

      try {
        await controller.presignDocUpload('REC9999', 'map.pdf');
      } catch (e) {
        expect(e).toBeInstanceOf(HttpException);
        expect(e.message).toBe('Recreation Resource not found');
        expect(e.getStatus()).toBe(404);
      }
    });

    it('should propagate S3 service errors', async () => {
      vi.spyOn(resourceDocsService, 'presignUpload').mockRejectedValue(
        new HttpException('Failed to generate presigned URL', 500),
      );

      try {
        await controller.presignDocUpload('REC0001', 'map.pdf');
      } catch (e) {
        expect(e).toBeInstanceOf(HttpException);
        expect(e.message).toBe('Failed to generate presigned URL');
        expect(e.getStatus()).toBe(500);
      }
    });

    it('should handle invalid fileName format', async () => {
      vi.spyOn(resourceDocsService, 'presignUpload').mockRejectedValue(
        new HttpException('Invalid fileName format', 400),
      );

      try {
        await controller.presignDocUpload('REC0001', 'invalid<>file.pdf');
      } catch (e) {
        expect(e).toBeInstanceOf(HttpException);
        expect(e.getStatus()).toBe(400);
      }
    });
  });

  describe('finalizeDocUpload', () => {
    it('should finalize document upload successfully', async () => {
      const body = {
        document_id: 'test-document-id-123',
        file_name: 'campbell-river-site-map.pdf',
        extension: 'pdf',
        file_size: 2097152,
      };

      const result = {
        document_id: 'test-document-id-123',
        file_name: 'campbell-river-site-map.pdf',
        rec_resource_id: 'REC0001',
        url: 'https://cdn.example.com/documents/REC0001/test-document-id-123/campbell-river-site-map.pdf',
        doc_code: 'RM',
        doc_code_description: 'Recreation Map',
        extension: 'pdf',
        created_at: '2025-01-01T00:00:00Z',
      };

      vi.spyOn(resourceDocsService, 'finalizeUpload').mockResolvedValue(
        result as any,
      );

      const response = await controller.finalizeDocUpload('REC0001', body);

      expect(response).toBe(result);
      expect(resourceDocsService.finalizeUpload).toHaveBeenCalledWith(
        'REC0001',
        body,
      );
    });

    it('should throw 404 error when resource not found', async () => {
      const body = {
        document_id: 'test-document-id-123',
        file_name: 'map.pdf',
        extension: 'pdf',
        file_size: 1024,
      };

      vi.spyOn(resourceDocsService, 'finalizeUpload').mockRejectedValue(
        new HttpException('Recreation Resource not found', 404),
      );

      try {
        await controller.finalizeDocUpload('REC9999', body);
      } catch (e) {
        expect(e).toBeInstanceOf(HttpException);
        expect(e.message).toBe('Recreation Resource not found');
        expect(e.getStatus()).toBe(404);
      }
    });

    it('should throw 400 error for invalid document_id', async () => {
      const body = {
        document_id: '',
        file_name: 'map.pdf',
        extension: 'pdf',
        file_size: 1024,
      };

      vi.spyOn(resourceDocsService, 'finalizeUpload').mockRejectedValue(
        new HttpException('Invalid document_id', 400),
      );

      try {
        await controller.finalizeDocUpload('REC0001', body);
      } catch (e) {
        expect(e).toBeInstanceOf(HttpException);
        expect(e.message).toBe('Invalid document_id');
        expect(e.getStatus()).toBe(400);
      }
    });

    it('should throw 400 error for missing required fields', async () => {
      const body = {
        document_id: 'test-document-id-123',
        file_name: '',
        extension: 'pdf',
        file_size: 1024,
      };

      vi.spyOn(resourceDocsService, 'finalizeUpload').mockRejectedValue(
        new HttpException('Missing required fields', 400),
      );

      try {
        await controller.finalizeDocUpload('REC0001', body);
      } catch (e) {
        expect(e).toBeInstanceOf(HttpException);
        expect(e.getStatus()).toBe(400);
      }
    });

    it('should propagate database errors', async () => {
      const body = {
        document_id: 'test-document-id-123',
        file_name: 'map.pdf',
        extension: 'pdf',
        file_size: 1024,
      };

      vi.spyOn(resourceDocsService, 'finalizeUpload').mockRejectedValue(
        new HttpException('Database error', 500),
      );

      try {
        await controller.finalizeDocUpload('REC0001', body);
      } catch (e) {
        expect(e).toBeInstanceOf(HttpException);
        expect(e.message).toBe('Database error');
        expect(e.getStatus()).toBe(500);
      }
    });
  });
});
