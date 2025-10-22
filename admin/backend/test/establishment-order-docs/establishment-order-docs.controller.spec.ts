import { EstablishmentOrderDocsController } from '@/establishment-order-docs/establishment-order-docs.controller';
import { EstablishmentOrderDocsService } from '@/establishment-order-docs/establishment-order-docs.service';
import { HttpException, INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const createMockFile = (
  filename: string,
  mimetype: string = 'application/pdf',
  size: number = 1024000,
): Express.Multer.File => ({
  fieldname: 'file',
  originalname: filename,
  encoding: '7bit',
  mimetype,
  size,
  buffer: Buffer.from('mock file content'),
  stream: null as any,
  destination: '',
  filename: '',
  path: '',
});

describe('EstablishmentOrderDocsController', () => {
  let controller: EstablishmentOrderDocsController;
  let establishmentOrderDocsService: EstablishmentOrderDocsService;
  let app: INestApplication;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EstablishmentOrderDocsController],
      providers: [
        {
          provide: EstablishmentOrderDocsService,
          useValue: {
            getAll: vi.fn(),
            create: vi.fn(),
            delete: vi.fn(),
          },
        },
      ],
    }).compile();

    establishmentOrderDocsService = module.get<EstablishmentOrderDocsService>(
      EstablishmentOrderDocsService,
    );
    controller = module.get<EstablishmentOrderDocsController>(
      EstablishmentOrderDocsController,
    );
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
    it('should return a list of establishment order documents', async () => {
      const result = [
        {
          s3_key: 'REC0001/establishment-order-2024.pdf',
          rec_resource_id: 'REC0001',
          title: 'Establishment Order 2024',
          file_size: 1024000,
          extension: 'pdf',
          url: 'https://s3.amazonaws.com/bucket/REC0001/establishment-order-2024.pdf?signature=abc123',
          created_at: new Date('2024-01-01T00:00:00Z'),
        },
        {
          s3_key: 'REC0001/establishment-order-2023.pdf',
          rec_resource_id: 'REC0001',
          title: 'Establishment Order 2023',
          file_size: 2048000,
          extension: 'pdf',
          url: 'https://s3.amazonaws.com/bucket/REC0001/establishment-order-2023.pdf?signature=def456',
          created_at: new Date('2023-01-01T00:00:00Z'),
        },
      ];

      vi.spyOn(establishmentOrderDocsService, 'getAll').mockResolvedValue(
        result as any,
      );

      const response = await controller.getAll('REC0001');

      expect(response).toBe(result);
      expect(response).toHaveLength(2);
      expect(establishmentOrderDocsService.getAll).toHaveBeenCalledWith(
        'REC0001',
      );
    });

    it('should return empty array when no documents found', async () => {
      vi.spyOn(establishmentOrderDocsService, 'getAll').mockResolvedValue([]);

      const response = await controller.getAll('REC9999');

      expect(response).toEqual([]);
      expect(response).toHaveLength(0);
    });

    it('should throw error if recreation resource not found', async () => {
      vi.spyOn(establishmentOrderDocsService, 'getAll').mockRejectedValue(
        new HttpException('Recreation resource not found', 404),
      );

      try {
        await controller.getAll('REC0001');
      } catch (e) {
        expect(e).toBeInstanceOf(HttpException);
        expect(e.message).toBe('Recreation resource not found');
        expect(e.getStatus()).toBe(404);
      }
    });

    it('should throw error if S3 service fails', async () => {
      vi.spyOn(establishmentOrderDocsService, 'getAll').mockRejectedValue(
        new HttpException('Failed to generate presigned URL', 500),
      );

      try {
        await controller.getAll('REC0001');
      } catch (e) {
        expect(e).toBeInstanceOf(HttpException);
        expect(e.message).toBe('Failed to generate presigned URL');
        expect(e.getStatus()).toBe(500);
      }
    });
  });

  describe('create', () => {
    it('should create establishment order document successfully', async () => {
      const mockFile = createMockFile('test-order.pdf');
      const body = { title: 'Test Order 2024' };
      const result = {
        s3_key: 'REC0001/Test Order 2024.pdf',
        rec_resource_id: 'REC0001',
        title: 'Test Order 2024',
        file_size: 1024000,
        extension: 'pdf',
        url: 'https://s3.amazonaws.com/bucket/REC0001/Test%20Order%202024.pdf?signature=xyz',
        created_at: new Date('2024-01-01T00:00:00Z'),
      };

      vi.spyOn(establishmentOrderDocsService, 'create').mockResolvedValue(
        result as any,
      );

      const response = await controller.create('REC0001', body, mockFile);

      expect(response).toBe(result);
      expect(establishmentOrderDocsService.create).toHaveBeenCalledWith(
        'REC0001',
        'Test Order 2024',
        mockFile,
      );
    });

    it('should throw 415 error for invalid file type', async () => {
      const mockFile = createMockFile('test.txt', 'text/plain');
      const body = { title: 'Test Document' };

      vi.spyOn(establishmentOrderDocsService, 'create').mockRejectedValue(
        new HttpException('File Type not allowed', 415),
      );

      try {
        await controller.create('REC0001', body, mockFile);
      } catch (e) {
        expect(e).toBeInstanceOf(HttpException);
        expect(e.message).toBe('File Type not allowed');
        expect(e.getStatus()).toBe(415);
      }
    });

    it('should throw 404 error when recreation resource not found', async () => {
      const mockFile = createMockFile('test-order.pdf');
      const body = { title: 'Test Order' };

      vi.spyOn(establishmentOrderDocsService, 'create').mockRejectedValue(
        new HttpException('Recreation Resource not found', 404),
      );

      try {
        await controller.create('REC9999', body, mockFile);
      } catch (e) {
        expect(e).toBeInstanceOf(HttpException);
        expect(e.message).toBe('Recreation Resource not found');
        expect(e.getStatus()).toBe(404);
      }
    });

    it('should handle S3 upload errors', async () => {
      const mockFile = createMockFile('test-order.pdf');
      const body = { title: 'Test Order' };

      vi.spyOn(establishmentOrderDocsService, 'create').mockRejectedValue(
        new Error('File "test-order.pdf" already exists'),
      );

      await expect(
        controller.create('REC0001', body, mockFile),
      ).rejects.toThrow('File "test-order.pdf" already exists');
    });

    it('should pass correct parameters from body and file', async () => {
      const mockFile = createMockFile('document.pdf');
      const body = { title: 'Important Document' };
      const result = {
        s3_key: 'REC0001/Important Document.pdf',
        rec_resource_id: 'REC0001',
        title: 'Important Document',
        file_size: 1024000,
        extension: 'pdf',
        url: 'https://s3.amazonaws.com/bucket/url',
        created_at: new Date('2024-01-01T00:00:00Z'),
      };

      vi.spyOn(establishmentOrderDocsService, 'create').mockResolvedValue(
        result as any,
      );

      await controller.create('REC0001', body, mockFile);

      expect(establishmentOrderDocsService.create).toHaveBeenCalledWith(
        'REC0001',
        'Important Document',
        mockFile,
      );
    });
  });

  describe('delete', () => {
    it('should delete establishment order document successfully', async () => {
      const s3Key = 'REC0001/test-order.pdf';
      const encodedS3Key = encodeURIComponent(s3Key);
      const result = {
        s3_key: s3Key,
        rec_resource_id: 'REC0001',
        title: 'Test Order',
        file_size: 1024000,
        extension: 'pdf',
        url: '',
        created_at: new Date('2024-01-01T00:00:00Z'),
      };

      vi.spyOn(establishmentOrderDocsService, 'delete').mockResolvedValue(
        result as any,
      );

      const response = await controller.delete('REC0001', encodedS3Key);

      expect(response).toBe(result);
      expect(establishmentOrderDocsService.delete).toHaveBeenCalledWith(
        'REC0001',
        s3Key,
      );
    });

    it('should decode URL-encoded s3_key parameter', async () => {
      const s3Key = 'REC0001/test order with spaces.pdf';
      const encodedS3Key = encodeURIComponent(s3Key);
      const result = {
        s3_key: s3Key,
        rec_resource_id: 'REC0001',
        title: 'Test Order',
        file_size: 1024000,
        extension: 'pdf',
        url: '',
        created_at: new Date('2024-01-01T00:00:00Z'),
      };

      vi.spyOn(establishmentOrderDocsService, 'delete').mockResolvedValue(
        result as any,
      );

      await controller.delete('REC0001', encodedS3Key);

      expect(establishmentOrderDocsService.delete).toHaveBeenCalledWith(
        'REC0001',
        s3Key,
      );
    });

    it('should throw 404 error when document not found', async () => {
      const s3Key = 'REC0001/nonexistent.pdf';
      const encodedS3Key = encodeURIComponent(s3Key);

      vi.spyOn(establishmentOrderDocsService, 'delete').mockRejectedValue(
        new HttpException('Document not found', 404),
      );

      try {
        await controller.delete('REC0001', encodedS3Key);
      } catch (e) {
        expect(e).toBeInstanceOf(HttpException);
        expect(e.message).toBe('Document not found');
        expect(e.getStatus()).toBe(404);
      }
    });

    it('should handle S3 deletion errors', async () => {
      const s3Key = 'REC0001/test-order.pdf';
      const encodedS3Key = encodeURIComponent(s3Key);

      vi.spyOn(establishmentOrderDocsService, 'delete').mockRejectedValue(
        new Error('S3 deletion failed'),
      );

      await expect(controller.delete('REC0001', encodedS3Key)).rejects.toThrow(
        'S3 deletion failed',
      );
    });

    it('should handle special characters in s3_key', async () => {
      const s3Key = 'REC0001/test@document#2024.pdf';
      const encodedS3Key = encodeURIComponent(s3Key);
      const result = {
        s3_key: s3Key,
        rec_resource_id: 'REC0001',
        title: 'Test Document',
        file_size: 1024000,
        extension: 'pdf',
        url: '',
        created_at: new Date('2024-01-01T00:00:00Z'),
      };

      vi.spyOn(establishmentOrderDocsService, 'delete').mockResolvedValue(
        result as any,
      );

      await controller.delete('REC0001', encodedS3Key);

      expect(establishmentOrderDocsService.delete).toHaveBeenCalledWith(
        'REC0001',
        s3Key,
      );
    });
  });
});
