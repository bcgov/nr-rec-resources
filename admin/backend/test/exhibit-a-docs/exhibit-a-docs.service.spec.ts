import { AppConfigService } from '@/app-config/app-config.service';
import { ExhibitADocsService } from '@/exhibit-a-docs/exhibit-a-docs.service';
import { PrismaService } from '@/prisma.service';
import { S3Service } from '@/s3/s3.service';
import { HttpException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const REC_RESOURCE_ID = 'REC0001';
const DOC_ID = 'a7c1e5f3-8d2b-4c9a-b1e6-f3d8c7a2e5b9';
const APPLICATION_GUID = '6444f5ab-cc12-4129-b66f-2deec3f26ec8';
const S3_KEY = `${REC_RESOURCE_ID}/${APPLICATION_GUID}/exhibit-a-${DOC_ID}.pdf`;
const PRESIGNED_URL =
  'http://localhost:4566/rst-lza-exhibit-a-docs-dev/' + S3_KEY;

const mockDoc = {
  doc_id: DOC_ID,
  rec_resource_id: REC_RESOURCE_ID,
  application_guid: APPLICATION_GUID,
  file_name: 'exhibit-a',
  extension: 'pdf',
  file_size: BigInt(1024),
  s3_key: S3_KEY,
  generation_method: 'upload',
  created_at: new Date('2024-01-01'),
  updated_at: new Date('2024-01-01'),
};

const mockPrisma = {
  $queryRaw: vi.fn(),
  recreation_resource: {
    findUnique: vi.fn(),
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

  it('should omit cloudfrontUrl when awsEndpointUrl is not configured', () => {
    const serviceWithoutEndpoint = new ExhibitADocsService(
      mockPrisma as any,
      {
        ...mockAppConfig,
        awsEndpointUrl: undefined,
      } as any,
      mockS3Service as any,
    );

    const config = (serviceWithoutEndpoint as any).getStorageConfig();

    expect(config).toEqual({
      bucketName: 'rst-lza-exhibit-a-docs-dev',
      cloudfrontUrl: undefined,
      endpointUrl: undefined,
    });
  });

  describe('getAll', () => {
    it('should return all exhibit-a docs with presigned URLs', async () => {
      mockPrisma.$queryRaw.mockResolvedValue([mockDoc]);
      mockS3Service.getSignedUrl.mockResolvedValue(PRESIGNED_URL);

      const result = await service.getAll(REC_RESOURCE_ID);
      const first = result[0]!;

      expect(result).toHaveLength(1);
      expect(first.document_id).toBe(DOC_ID);
      expect(first.rec_resource_id).toBe(REC_RESOURCE_ID);
      expect(first.application_guid).toBe(APPLICATION_GUID);
      expect(first.file_name).toBe('exhibit-a');
      expect(first.generation_method).toBe('upload');
      expect(first.url).toBe(PRESIGNED_URL);
      expect(mockPrisma.$queryRaw).toHaveBeenCalledTimes(1);
    });

    it('should return empty array when no docs exist', async () => {
      mockPrisma.$queryRaw.mockResolvedValue([]);

      const result = await service.getAll(REC_RESOURCE_ID);

      expect(result).toEqual([]);
    });

    it('maps nullable db values safely', async () => {
      mockPrisma.$queryRaw.mockResolvedValue([
        {
          ...mockDoc,
          file_size: null,
          generation_method: null,
          created_at: null,
        },
      ]);
      mockS3Service.getSignedUrl.mockResolvedValue(PRESIGNED_URL);

      const result = await service.getAll(REC_RESOURCE_ID);

      expect(result[0]).toMatchObject({
        file_size: undefined,
        generation_method: null,
        created_at: undefined,
      });
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
        APPLICATION_GUID,
      );

      expect(result.document_id).toBeDefined();
      expect(result.key).toContain(REC_RESOURCE_ID);
      expect(result.key).toContain(`/${APPLICATION_GUID}/`);
      expect(result.key).toContain(`exhibit-a-${result.document_id}.pdf`);
      expect(result.url).toBe(PRESIGNED_URL);
    });

    it('should throw 404 when resource does not exist', async () => {
      mockPrisma.recreation_resource.findUnique.mockResolvedValue(null);

      await expect(
        service.presignUpload(
          REC_RESOURCE_ID,
          'exhibit-a.pdf',
          APPLICATION_GUID,
        ),
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
    const finalizeBodyWithGuid = {
      ...finalizeBody,
      application_guid: APPLICATION_GUID,
    };

    beforeEach(() => {
      mockPrisma.recreation_resource.findUnique.mockResolvedValue({
        rec_resource_id: REC_RESOURCE_ID,
      });
    });

    it('should create db record and return doc with presigned URL', async () => {
      mockPrisma.$queryRaw.mockResolvedValue([mockDoc]);
      mockS3Service.getSignedUrl.mockResolvedValue(PRESIGNED_URL);

      const result = await service.finalizeUpload(
        REC_RESOURCE_ID,
        finalizeBodyWithGuid,
      );

      expect(result.document_id).toBe(DOC_ID);
      expect(result.s3_key).toBe(S3_KEY);
      expect(result.url).toBe(PRESIGNED_URL);
      expect(mockPrisma.$queryRaw).toHaveBeenCalledTimes(1);
      const sqlCall = mockPrisma.$queryRaw.mock.calls[0]?.[0] as {
        raw?: string[];
      };
      expect(sqlCall.raw?.join(' ')).toContain('upload');
    });

    it('should throw 404 when resource does not exist', async () => {
      mockPrisma.recreation_resource.findUnique.mockResolvedValue(null);

      await expect(
        service.finalizeUpload(REC_RESOURCE_ID, finalizeBodyWithGuid),
      ).rejects.toThrow(
        new HttpException('Recreation Resource not found', 404),
      );
      expect(mockPrisma.$queryRaw).not.toHaveBeenCalled();
    });

    it('should throw 400 for invalid document_id', async () => {
      await expect(
        service.finalizeUpload(REC_RESOURCE_ID, {
          ...finalizeBodyWithGuid,
          document_id: '',
        }),
      ).rejects.toThrow(HttpException);
      expect(mockPrisma.$queryRaw).not.toHaveBeenCalled();
    });

    it('should propagate db errors as 500', async () => {
      mockPrisma.$queryRaw.mockRejectedValue(new Error('DB error'));

      await expect(
        service.finalizeUpload(REC_RESOURCE_ID, finalizeBodyWithGuid),
      ).rejects.toThrow(HttpException);
    });

    it('should throw 500 when insert returns no row', async () => {
      mockPrisma.$queryRaw.mockResolvedValue([]);

      await expect(
        service.finalizeUpload(REC_RESOURCE_ID, finalizeBodyWithGuid),
      ).rejects.toThrow(HttpException);
      expect(mockS3Service.getSignedUrl).not.toHaveBeenCalled();
    });

    it('passes application_guid to the insert when provided', async () => {
      mockPrisma.$queryRaw.mockResolvedValue([mockDoc]);
      mockS3Service.getSignedUrl.mockResolvedValue(PRESIGNED_URL);

      await service.finalizeUpload(REC_RESOURCE_ID, {
        ...finalizeBody,
        application_guid: APPLICATION_GUID,
      });

      expect(mockPrisma.$queryRaw).toHaveBeenCalledTimes(1);
      const [, ...values] = mockPrisma.$queryRaw.mock.calls[0]!;
      expect(values).toContain(APPLICATION_GUID);
    });

    it('resolves deprecated submission_id to application_guid before insert', async () => {
      mockPrisma.$queryRaw
        .mockResolvedValueOnce([{ application_guid: APPLICATION_GUID }])
        .mockResolvedValueOnce([mockDoc]);
      mockS3Service.getSignedUrl.mockResolvedValue(PRESIGNED_URL);

      await service.finalizeUpload(REC_RESOURCE_ID, {
        ...finalizeBody,
        submission_id: '1234567',
      });
      expect(mockPrisma.$queryRaw).toHaveBeenCalledTimes(2);
      const [, ...insertValues] = mockPrisma.$queryRaw.mock.calls[1]!;
      expect(insertValues).toContain(APPLICATION_GUID);
    });

    it('should throw 400 when application_guid and submission_id are both missing', async () => {
      await expect(
        service.finalizeUpload(REC_RESOURCE_ID, finalizeBody),
      ).rejects.toThrow(new HttpException('application_guid is required', 400));
      expect(mockPrisma.$queryRaw).not.toHaveBeenCalled();
    });

    it('should throw 404 when submission_id cannot be resolved', async () => {
      mockPrisma.$queryRaw.mockResolvedValueOnce([]);

      await expect(
        service.finalizeUpload(REC_RESOURCE_ID, {
          ...finalizeBody,
          submission_id: '1234567',
        }),
      ).rejects.toThrow(HttpException);
      expect(mockPrisma.$queryRaw).toHaveBeenCalledTimes(1);
    });
  });

  describe('delete', () => {
    it('should delete doc from db and S3', async () => {
      mockPrisma.$queryRaw.mockResolvedValue([mockDoc]);
      mockS3Service.deleteFile.mockResolvedValue(undefined);

      const result = await service.delete(REC_RESOURCE_ID, DOC_ID);

      expect(result.document_id).toBe(DOC_ID);
      expect(mockPrisma.$queryRaw).toHaveBeenCalledTimes(1);
      expect(mockS3Service.deleteFile).toHaveBeenCalledWith(S3_KEY);
    });

    it('scopes the delete by both doc_id and rec_resource_id', async () => {
      mockPrisma.$queryRaw.mockResolvedValue([mockDoc]);
      mockS3Service.deleteFile.mockResolvedValue(undefined);

      await service.delete(REC_RESOURCE_ID, DOC_ID);
      const [, ...values] = mockPrisma.$queryRaw.mock.calls[0]!;
      expect(values).toContain(DOC_ID);
      expect(values).toContain(REC_RESOURCE_ID);
    });

    it('should throw 404 when doc not found', async () => {
      mockPrisma.$queryRaw.mockResolvedValue([]);

      await expect(service.delete(REC_RESOURCE_ID, DOC_ID)).rejects.toThrow(
        new HttpException('Exhibit A document not found', 404),
      );
      expect(mockS3Service.deleteFile).not.toHaveBeenCalled();
    });

    it('should throw 404 when doc belongs to different resource', async () => {
      mockPrisma.$queryRaw.mockResolvedValue([]);

      await expect(service.delete(REC_RESOURCE_ID, DOC_ID)).rejects.toThrow(
        new HttpException('Exhibit A document not found', 404),
      );
      expect(mockS3Service.deleteFile).not.toHaveBeenCalled();
    });
  });

  describe('path and filename normalization helpers', () => {
    it('sanitizes unsafe application guid and file segments in buildS3Key', () => {
      const key = (service as any).buildS3Key(
        REC_RESOURCE_ID,
        '  app guid/with unsafe chars  ',
        'exhibit a?.pdf',
      );

      expect(key).toBe('REC0001/app_guid_with_unsafe_chars/exhibit_a_.pdf');
    });

    it('falls back when sanitizePathSegment receives blank input', () => {
      expect(
        (service as any).sanitizePathSegment('   ', 'fallback-value'),
      ).toBe('fallback-value');
    });

    it('normalizes stem and extension defaults', () => {
      expect((service as any).normalizeStem('  My Exhibit.A.PDF  ')).toBe(
        'my-exhibit-a',
      );
      expect((service as any).normalizeStem('...')).toBe('exhibit-a');
      expect((service as any).normalizeExtension('  .PDF  ')).toBe('pdf');
      expect((service as any).normalizeExtension('  ')).toBe('pdf');
    });
  });
});
