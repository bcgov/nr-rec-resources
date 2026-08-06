import { AppConfigService } from '@/app-config/app-config.service';
import { ExhibitADocsService } from '@/exhibit-a-docs/exhibit-a-docs.service';
import { PrismaService } from '@/prisma.service';
import { S3Service } from '@/s3/s3.service';
import { HttpException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const REC_RESOURCE_ID = 'REC0001';
const DOC_ID = 'a7c1e5f3-8d2b-4c9a-b1e6-f3d8c7a2e5b9';
const S3_KEY = `${REC_RESOURCE_ID}/${DOC_ID}/exhibit-a.pdf`;
const PRESIGNED_URL =
  'http://localhost:4566/rst-lza-exhibit-a-docs-dev/' + S3_KEY;

const mockDoc = {
  doc_id: DOC_ID,
  rec_resource_id: REC_RESOURCE_ID,
  file_name: 'exhibit-a',
  extension: 'pdf',
  file_size: BigInt(1024),
  s3_key: S3_KEY,
  created_at: new Date('2024-01-01'),
  updated_at: new Date('2024-01-01'),
};

const mockPrisma = {
  recreation_resource: {
    findUnique: vi.fn(),
  },
  recreation_exhibit_a_doc: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
    delete: vi.fn(),
  },
};

const mockS3Service = {
  getSignedUrl: vi.fn(),
  getSignedUploadUrl: vi.fn(),
  deleteFile: vi.fn(),
};

const mockAppConfig = {
  exhibitADocsBucket: 'rst-lza-exhibit-a-docs-dev',
  awsEndpointUrl: 'http://localhost:4566',
  recResourceStorageCloudfrontUrl: undefined,
};

describe('ExhibitADocsService', () => {
  let service: ExhibitADocsService;
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      providers: [
        ExhibitADocsService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: S3Service, useValue: mockS3Service },
        { provide: AppConfigService, useValue: mockAppConfig },
      ],
    }).compile();

    service = module.get<ExhibitADocsService>(ExhibitADocsService);
  });

  afterEach(async () => {
    vi.clearAllMocks();
    await module?.close();
  });

  describe('getAll', () => {
    it('should return all exhibit-a docs with presigned URLs', async () => {
      mockPrisma.recreation_exhibit_a_doc.findMany.mockResolvedValue([mockDoc]);
      mockS3Service.getSignedUrl.mockResolvedValue(PRESIGNED_URL);

      const result = await service.getAll(REC_RESOURCE_ID);

      expect(result).toHaveLength(1);
      expect(result[0].document_id).toBe(DOC_ID);
      expect(result[0].rec_resource_id).toBe(REC_RESOURCE_ID);
      expect(result[0].file_name).toBe('exhibit-a');
      expect(result[0].url).toBe(PRESIGNED_URL);
      expect(mockPrisma.recreation_exhibit_a_doc.findMany).toHaveBeenCalledWith(
        {
          where: { rec_resource_id: REC_RESOURCE_ID },
          orderBy: [{ updated_at: 'desc' }, { created_at: 'desc' }],
        },
      );
    });

    it('should return empty array when no docs exist', async () => {
      mockPrisma.recreation_exhibit_a_doc.findMany.mockResolvedValue([]);

      const result = await service.getAll(REC_RESOURCE_ID);

      expect(result).toEqual([]);
    });
  });

  describe('presignUpload', () => {
    it('should return presigned upload URL with document_id and key', async () => {
      mockPrisma.recreation_resource.findUnique.mockResolvedValue({
        rec_resource_id: REC_RESOURCE_ID,
      });
      mockS3Service.getSignedUploadUrl.mockResolvedValue(PRESIGNED_URL);

      const result = await service.presignUpload(
        REC_RESOURCE_ID,
        'exhibit-a.pdf',
      );

      expect(result.document_id).toBeDefined();
      expect(result.key).toContain(REC_RESOURCE_ID);
      expect(result.key).toContain('exhibit-a.pdf');
      expect(result.url).toBe(PRESIGNED_URL);
    });

    it('should throw 404 when resource does not exist', async () => {
      mockPrisma.recreation_resource.findUnique.mockResolvedValue(null);

      await expect(
        service.presignUpload(REC_RESOURCE_ID, 'exhibit-a.pdf'),
      ).rejects.toThrow(
        new HttpException('Recreation Resource not found', 404),
      );
    });
  });

  describe('finalizeUpload', () => {
    const finalizeBody = {
      document_id: DOC_ID,
      file_name: 'exhibit-a',
      extension: 'pdf',
      file_size: 1024,
    };

    it('should create db record and return doc with presigned URL', async () => {
      mockPrisma.recreation_resource.findUnique.mockResolvedValue({
        rec_resource_id: REC_RESOURCE_ID,
      });
      mockPrisma.recreation_exhibit_a_doc.create.mockResolvedValue(mockDoc);
      mockS3Service.getSignedUrl.mockResolvedValue(PRESIGNED_URL);

      const result = await service.finalizeUpload(
        REC_RESOURCE_ID,
        finalizeBody,
      );

      expect(result.document_id).toBe(DOC_ID);
      expect(result.s3_key).toBe(S3_KEY);
      expect(result.url).toBe(PRESIGNED_URL);
      expect(mockPrisma.recreation_exhibit_a_doc.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          doc_id: DOC_ID,
          rec_resource_id: REC_RESOURCE_ID,
          file_name: 'exhibit-a',
          extension: 'pdf',
          s3_key: S3_KEY,
        }),
      });
    });

    it('should throw 404 when resource does not exist', async () => {
      mockPrisma.recreation_resource.findUnique.mockResolvedValue(null);

      await expect(
        service.finalizeUpload(REC_RESOURCE_ID, finalizeBody),
      ).rejects.toThrow(
        new HttpException('Recreation Resource not found', 404),
      );
    });

    it('should throw 400 for invalid document_id', async () => {
      mockPrisma.recreation_resource.findUnique.mockResolvedValue({
        rec_resource_id: REC_RESOURCE_ID,
      });

      await expect(
        service.finalizeUpload(REC_RESOURCE_ID, {
          ...finalizeBody,
          document_id: '',
        }),
      ).rejects.toThrow(HttpException);
    });

    it('should propagate db errors as 500', async () => {
      mockPrisma.recreation_resource.findUnique.mockResolvedValue({
        rec_resource_id: REC_RESOURCE_ID,
      });
      mockPrisma.recreation_exhibit_a_doc.create.mockRejectedValue(
        new Error('DB error'),
      );

      await expect(
        service.finalizeUpload(REC_RESOURCE_ID, finalizeBody),
      ).rejects.toThrow(HttpException);
    });
  });

  describe('delete', () => {
    it('should delete doc from db and S3', async () => {
      mockPrisma.recreation_exhibit_a_doc.findUnique.mockResolvedValue(mockDoc);
      mockPrisma.recreation_exhibit_a_doc.delete.mockResolvedValue(mockDoc);
      mockS3Service.deleteFile.mockResolvedValue(undefined);

      const result = await service.delete(REC_RESOURCE_ID, DOC_ID);

      expect(result.document_id).toBe(DOC_ID);
      expect(mockPrisma.recreation_exhibit_a_doc.delete).toHaveBeenCalledWith({
        where: { doc_id: DOC_ID },
      });
      expect(mockS3Service.deleteFile).toHaveBeenCalledWith(S3_KEY);
    });

    it('should throw 404 when doc not found', async () => {
      mockPrisma.recreation_exhibit_a_doc.findUnique.mockResolvedValue(null);

      await expect(service.delete(REC_RESOURCE_ID, DOC_ID)).rejects.toThrow(
        new HttpException('Exhibit A document not found', 404),
      );
      expect(mockPrisma.recreation_exhibit_a_doc.delete).not.toHaveBeenCalled();
    });

    it('should throw 404 when doc belongs to different resource', async () => {
      mockPrisma.recreation_exhibit_a_doc.findUnique.mockResolvedValue({
        ...mockDoc,
        rec_resource_id: 'REC9999',
      });

      await expect(service.delete(REC_RESOURCE_ID, DOC_ID)).rejects.toThrow(
        new HttpException('Exhibit A document not found', 404),
      );
      expect(mockPrisma.recreation_exhibit_a_doc.delete).not.toHaveBeenCalled();
    });
  });
});
