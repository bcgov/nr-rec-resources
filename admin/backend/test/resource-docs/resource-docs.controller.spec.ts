import { AppConfigModule } from '@/app-config/app-config.module';
import { ResourceDocsController } from '@/resource-docs/resource-docs.controller';
import { ResourceDocsService } from '@/resource-docs/service/resource-docs.service';
import { HttpException, INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from 'src/prisma.service';
import { S3Service } from 'src/s3/s3.service';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createMockFile } from '../test-utils/file-test-utils';

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

  describe('getById', () => {
    it('should return a Recreation Resource document', async () => {
      const result = {
        rec_resource_id: 'REC136003',
        document_id: '11535',
        title: 'Tenquille Lake - Hawint Map',
        url: 'https://test-cdn.example.com/documents/REC136003/11535/sample.pdf',
        created_at: new Date().toISOString(),
      };
      vi.spyOn(
        resourceDocsService,
        'getDocumentByResourceId',
      ).mockResolvedValue(result as any);
      expect(await controller.getDocumentByResourceId('REC0001', '11535')).toBe(
        result,
      );
    });

    it('should throw error if recreation resource not found', async () => {
      vi.spyOn(
        resourceDocsService,
        'getDocumentByResourceId',
      ).mockRejectedValue(
        new HttpException('Recreation Resource document not found', 404),
      );
      try {
        await controller.getDocumentByResourceId('REC0001', '11535');
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

  describe('create', () => {
    it('should create and return a Recreation Resource document', async () => {
      const result = {
        rec_resource_id: 'REC136003',
        document_id: '11535',
        title: 'Tenquille Lake - Hawint Map',
        url: 'https://test-cdn.example.com/documents/REC136003/11535/sample.pdf',
        created_at: new Date().toISOString(),
      };
      vi.spyOn(resourceDocsService, 'create').mockResolvedValue(result as any);
      expect(
        await controller.createRecreationResourceDocument(
          'REC0001',
          { title: 'title' },
          createMockFile({
            originalname: 'sample.name',
            mimetype: 'application/pdf',
          }),
        ),
      ).toBe(result);
    });

    it('should throw error if recreation resource not found', async () => {
      vi.spyOn(resourceDocsService, 'create').mockRejectedValue(
        new HttpException('Recreation Resource not found', 404),
      );
      try {
        await controller.createRecreationResourceDocument(
          'REC0001',
          { title: 'title' },
          createMockFile({
            originalname: 'sample.name',
            mimetype: 'application/pdf',
          }),
        );
      } catch (e) {
        expect(e).toBeInstanceOf(HttpException);
        expect(e.message).toBe('Recreation Resource not found');
        expect(e.getStatus()).toBe(404);
      }
    });

    it('should throw error if file type not allowed', async () => {
      vi.spyOn(resourceDocsService, 'create').mockRejectedValue(
        new HttpException('File Type not allowed', 415),
      );
      try {
        await controller.createRecreationResourceDocument(
          'REC0001',
          { title: 'title' },
          createMockFile({
            originalname: 'sample.name',
            mimetype: 'application/zip',
          }),
        );
      } catch (e) {
        expect(e).toBeInstanceOf(HttpException);
        expect(e.message).toBe('File Type not allowed');
        expect(e.getStatus()).toBe(415);
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
});
