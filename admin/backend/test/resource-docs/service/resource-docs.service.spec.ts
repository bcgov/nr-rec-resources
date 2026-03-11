import { ResourceDocsService } from '@/resource-docs/service/resource-docs.service';
import { PrismaService } from 'src/prisma.service';
import { S3Service } from 'src/s3/s3.service';
import { HttpException } from '@nestjs/common';
import { Mocked, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  createMockDocument,
  createStorageTestModule,
  setupAppConfigForStorage,
} from '../../test-utils/storage-test-utils';

vi.mock('fs');
vi.mock('crypto', () => ({
  randomUUID: vi.fn(() => 'test-document-id'),
}));

const REC_RESOURCE_ID = 'REC0001';
const DOCUMENT_ID = '11535';
const TEST_CAPTION = 'Tenquille Lake - Hawint Map';

describe('ResourceDocsService', () => {
  let prismaService: Mocked<PrismaService>;
  let service: ResourceDocsService;
  let s3Service: Mocked<S3Service>;

  beforeEach(async () => {
    const mockS3Service = {
      uploadFile: vi.fn(),
      deleteFile: vi.fn(),
      getSignedUrl: vi.fn(),
      getSignedUploadUrl: vi.fn(),
      listObjectsByPrefix: vi.fn(),
    } as any;

    const testModule = await createStorageTestModule<ResourceDocsService>({
      serviceClass: ResourceDocsService,
      s3ServiceOverrides: mockS3Service,
    });
    service = testModule.service;
    prismaService = testModule.prismaService;
    s3Service = testModule.s3Service!;
    await setupAppConfigForStorage({
      bucketName: 'test-docs-bucket',
      cloudfrontUrl: 'https://test-cdn.example.com',
    });

    // Mock recreation_resource for validation (after prismaService is initialized)
    vi.mocked(prismaService.recreation_resource.findUnique).mockResolvedValue({
      rec_resource_id: REC_RESOURCE_ID,
    } as any);

    vi.clearAllMocks();
  });

  describe('getAll', () => {
    it('should return all doc resources related to the resource', async () => {
      const mockedResources = [
        createMockDocument('11535', TEST_CAPTION),
        createMockDocument('11541', TEST_CAPTION),
        createMockDocument('11725', 'new resource'),
      ];
      vi.mocked(
        prismaService.recreation_resource_document.findMany,
      ).mockResolvedValue(mockedResources as any);

      const result = await service.getAll(REC_RESOURCE_ID);

      expect(result).toHaveLength(mockedResources.length);
      result?.forEach((doc, index) => {
        expect(doc.doc_code_description).toBe(
          mockedResources[index]?.recreation_resource_doc_code?.description,
        );
        expect(doc.document_id).toBe(mockedResources[index]?.doc_id);
        expect(doc.url).toBeDefined();
      });
    });

    it('should return empty array if resource not found', async () => {
      vi.mocked(
        prismaService.recreation_resource_document.findMany,
      ).mockResolvedValueOnce([]);
      expect(await service.getAll('NONEXISTENT')).toHaveLength(0);
    });
  });

  describe('delete', () => {
    it('should hard delete and return the deleted resource', async () => {
      const existingDoc = createMockDocument(DOCUMENT_ID, TEST_CAPTION);
      vi.mocked(
        prismaService.recreation_resource_document.findUnique,
      ).mockResolvedValue(existingDoc as any);
      vi.mocked(s3Service.deleteFile).mockResolvedValue(undefined);
      vi.mocked(
        prismaService.recreation_resource_document.delete,
      ).mockResolvedValue(existingDoc as any);

      const deleteCallOrder: string[] = [];
      vi.mocked(
        prismaService.recreation_resource_document.delete,
      ).mockImplementation(() => {
        deleteCallOrder.push('db');
        return existingDoc as any;
      });
      vi.mocked(s3Service.deleteFile).mockImplementation(async () => {
        deleteCallOrder.push('s3');
        return undefined;
      });

      const result = await service.delete(REC_RESOURCE_ID, DOCUMENT_ID, false);

      expect(deleteCallOrder).toEqual(['db', 's3']);
      expect(s3Service.deleteFile).toHaveBeenCalledWith(
        `documents/${REC_RESOURCE_ID}/${DOCUMENT_ID}/sample.pdf`,
      );
      expect(result?.doc_code_description).toBe(TEST_CAPTION);
      expect(result?.document_id).toBe(DOCUMENT_ID);
      expect(result?.url).toBeDefined();
    });

    it('should soft delete resource', async () => {
      const existingDoc = createMockDocument(DOCUMENT_ID, TEST_CAPTION);
      vi.mocked(
        prismaService.recreation_resource_document.findUnique,
      ).mockResolvedValue(existingDoc as any);
      vi.mocked(
        prismaService.recreation_resource_document.delete,
      ).mockResolvedValue(existingDoc as any);

      const deleteCallOrder: string[] = [];
      vi.mocked(
        prismaService.recreation_resource_document.delete,
      ).mockImplementation(() => {
        deleteCallOrder.push('db');
        return existingDoc as any;
      });

      const result = await service.delete(REC_RESOURCE_ID, DOCUMENT_ID, true);

      expect(deleteCallOrder).toEqual(['db']);
      expect(s3Service.deleteFile).not.toHaveBeenCalled();
      expect(result?.doc_code_description).toBe(TEST_CAPTION);
      expect(result?.document_id).toBe(DOCUMENT_ID);
      expect(result?.url).toBeDefined();
    });

    it('should return 404 if resource not found', async () => {
      vi.mocked(
        prismaService.recreation_resource_document.findUnique,
      ).mockResolvedValueOnce(null);
      await expect(
        service.delete(REC_RESOURCE_ID, DOCUMENT_ID),
      ).rejects.toThrow();
      expect(s3Service.deleteFile).not.toHaveBeenCalled();
    });

    it('should handle errors in delete method catch block (covers line 165)', async () => {
      const existingDoc = createMockDocument(DOCUMENT_ID, TEST_CAPTION);
      vi.mocked(
        prismaService.recreation_resource_document.findUnique,
      ).mockResolvedValue(existingDoc as any);
      vi.mocked(
        prismaService.recreation_resource_document.delete,
      ).mockRejectedValueOnce(new Error('Database delete failed'));

      await expect(
        service.delete(REC_RESOURCE_ID, DOCUMENT_ID),
      ).rejects.toThrow('Failed to delete document');
    });

    it('should log warning when S3 delete fails in deleteS3FileSafely (covers line 196)', async () => {
      const existingDoc = createMockDocument(DOCUMENT_ID, TEST_CAPTION);
      vi.mocked(
        prismaService.recreation_resource_document.findUnique,
      ).mockResolvedValue(existingDoc as any);
      vi.mocked(s3Service.deleteFile).mockRejectedValueOnce(
        new Error('S3 delete failed'),
      );
      vi.mocked(
        prismaService.recreation_resource_document.delete,
      ).mockResolvedValue(existingDoc as any);

      const result = await service.delete(REC_RESOURCE_ID, DOCUMENT_ID, false);
      expect(result).toBeDefined();
      expect(
        prismaService.recreation_resource_document.delete,
      ).toHaveBeenCalled();
      expect(s3Service.deleteFile).toHaveBeenCalledWith(
        `documents/${REC_RESOURCE_ID}/${DOCUMENT_ID}/sample.pdf`,
      );
    });

    it('should throw HttpException when file_name is missing', async () => {
      const existingDoc = createMockDocument(
        DOCUMENT_ID,
        TEST_CAPTION,
        REC_RESOURCE_ID,
        {
          file_name: null,
        },
      );
      vi.mocked(
        prismaService.recreation_resource_document.findUnique,
      ).mockResolvedValue(existingDoc as any);

      await expect(
        service.delete(REC_RESOURCE_ID, DOCUMENT_ID, false),
      ).rejects.toThrow(
        'Document metadata is incomplete: missing file_name or extension',
      );
      expect(s3Service.deleteFile).not.toHaveBeenCalled();
    });

    it('should throw HttpException when extension is missing', async () => {
      const existingDoc = createMockDocument(
        DOCUMENT_ID,
        TEST_CAPTION,
        REC_RESOURCE_ID,
        {
          extension: null,
        },
      );
      vi.mocked(
        prismaService.recreation_resource_document.findUnique,
      ).mockResolvedValue(existingDoc as any);

      await expect(
        service.delete(REC_RESOURCE_ID, DOCUMENT_ID, false),
      ).rejects.toThrow(
        'Document metadata is incomplete: missing file_name or extension',
      );
      expect(s3Service.deleteFile).not.toHaveBeenCalled();
    });

    it('should verify S3 deletion failure does not prevent DB deletion success', async () => {
      const existingDoc = createMockDocument(DOCUMENT_ID, TEST_CAPTION);
      vi.mocked(
        prismaService.recreation_resource_document.findUnique,
      ).mockResolvedValue(existingDoc as any);
      vi.mocked(
        prismaService.recreation_resource_document.delete,
      ).mockResolvedValue(existingDoc as any);
      vi.mocked(s3Service.deleteFile).mockRejectedValueOnce(
        new Error('S3 delete failed'),
      );

      const result = await service.delete(REC_RESOURCE_ID, DOCUMENT_ID, false);

      expect(
        prismaService.recreation_resource_document.delete,
      ).toHaveBeenCalled();
      expect(result).toBeDefined();
      expect(result?.document_id).toBe(DOCUMENT_ID);
    });
  });

  describe('presignUpload', () => {
    it('should generate presigned URL successfully', async () => {
      const mockUrl = 'https://s3.amazonaws.com/presigned-url';
      vi.mocked(s3Service.getSignedUploadUrl).mockResolvedValue(mockUrl);

      const result = await service.presignUpload(
        REC_RESOURCE_ID,
        'campbell-river-site-map.pdf',
      );

      expect(result).toBeDefined();
      expect(result.document_id).toBe('test-document-id');
      expect(result.key).toContain(
        `documents/${REC_RESOURCE_ID}/test-document-id/`,
      );
      expect(result.key).toContain('campbell-river-site-map.pdf');
      expect(result.url).toBe(mockUrl);

      expect(s3Service.getSignedUploadUrl).toHaveBeenCalledWith(
        `documents/${REC_RESOURCE_ID}/test-document-id/campbell-river-site-map.pdf`,
        'application/pdf',
        900,
        undefined, // No tags for documents
      );
    });

    it('should validate resource exists before generating URL', async () => {
      vi.mocked(prismaService.recreation_resource.findUnique).mockResolvedValue(
        null,
      );

      await expect(service.presignUpload('REC9999', 'map.pdf')).rejects.toThrow(
        'Recreation Resource not found',
      );

      expect(s3Service.getSignedUploadUrl).not.toHaveBeenCalled();
    });

    it('should handle S3 service errors', async () => {
      vi.mocked(s3Service.getSignedUploadUrl).mockRejectedValue(
        new Error('S3 service error'),
      );

      await expect(
        service.presignUpload(REC_RESOURCE_ID, 'map.pdf'),
      ).rejects.toThrow('Failed to generate presigned URL');
    });

    it('should construct correct S3 key', async () => {
      vi.mocked(s3Service.getSignedUploadUrl).mockResolvedValue(
        'https://s3.amazonaws.com/url',
      );

      await service.presignUpload(REC_RESOURCE_ID, 'test-document.pdf');

      const call = vi.mocked(s3Service.getSignedUploadUrl).mock.calls[0];
      const key = call[0];

      expect(key).toContain(`documents/${REC_RESOURCE_ID}/test-document-id/`);
      expect(key).toContain('test-document.pdf');
    });
  });

  describe('finalizeUpload', () => {
    it('should create database record and retrieve it successfully', async () => {
      const body = {
        document_id: 'test-document-id',
        file_name: 'campbell-river-site-map.pdf',
        extension: 'pdf',
        file_size: 2097152,
        doc_code: 'RM',
      };

      const mockRetrieved = createMockDocument(
        'test-document-id',
        TEST_CAPTION,
        REC_RESOURCE_ID,
        {
          file_name: 'campbell-river-site-map.pdf',
          extension: 'pdf',
        },
      );

      vi.mocked(
        prismaService.recreation_resource_document.create,
      ).mockResolvedValue({} as any);
      vi.mocked(
        prismaService.recreation_resource_document.findUnique,
      ).mockResolvedValueOnce(mockRetrieved as any);

      const result = await service.finalizeUpload(REC_RESOURCE_ID, body);

      expect(result).toBeDefined();
      expect(result.document_id).toBe('test-document-id');
      expect(result.file_name).toBe('campbell-river-site-map.pdf');
      expect(
        prismaService.recreation_resource_document.create,
      ).toHaveBeenCalledWith({
        data: {
          doc_id: 'test-document-id',
          rec_resource_id: REC_RESOURCE_ID,
          doc_code: 'RM',
          file_name: 'campbell-river-site-map.pdf',
          extension: 'pdf',
          file_size: BigInt(2097152),
          created_by: 'system',
          created_at: expect.any(Date),
        },
      });
      expect(
        prismaService.recreation_resource_document.findUnique,
      ).toHaveBeenCalledWith({
        where: {
          rec_resource_id: REC_RESOURCE_ID,
          doc_id: 'test-document-id',
        },
        select: expect.any(Object),
      });
    });

    it('should use default doc_code when not provided', async () => {
      const body = {
        document_id: 'test-document-id',
        file_name: 'map.pdf',
        extension: 'pdf',
        file_size: 1024,
      };

      const mockCreated = createMockDocument('test-document-id', TEST_CAPTION);
      const mockRetrieved = createMockDocument(
        'test-document-id',
        TEST_CAPTION,
      );

      vi.mocked(
        prismaService.recreation_resource_document.create,
      ).mockResolvedValue(mockCreated as any);
      vi.mocked(
        prismaService.recreation_resource_document.findUnique,
      ).mockResolvedValueOnce(mockRetrieved as any);

      await service.finalizeUpload(REC_RESOURCE_ID, body);

      expect(
        prismaService.recreation_resource_document.create,
      ).toHaveBeenCalledWith({
        data: expect.objectContaining({
          doc_code: 'RM', // Default value
        }),
      });
    });

    it('should validate resource exists before creating record', async () => {
      vi.mocked(prismaService.recreation_resource.findUnique).mockResolvedValue(
        null,
      );

      const body = {
        document_id: 'test-document-id',
        file_name: 'map.pdf',
        extension: 'pdf',
        file_size: 1024,
      };

      await expect(service.finalizeUpload('REC9999', body)).rejects.toThrow(
        'Recreation Resource not found',
      );

      expect(
        prismaService.recreation_resource_document.create,
      ).not.toHaveBeenCalled();
    });

    it('should throw 400 error for invalid document_id', async () => {
      const body = {
        document_id: '',
        file_name: 'map.pdf',
        extension: 'pdf',
        file_size: 1024,
      };

      await expect(
        service.finalizeUpload(REC_RESOURCE_ID, body),
      ).rejects.toThrow('Invalid document_id');
    });

    it('should throw 400 error for non-string document_id', async () => {
      const body = {
        document_id: null as any,
        file_name: 'map.pdf',
        extension: 'pdf',
        file_size: 1024,
      };

      await expect(
        service.finalizeUpload(REC_RESOURCE_ID, body),
      ).rejects.toThrow('Invalid document_id');
    });

    it('should handle database creation errors', async () => {
      const body = {
        document_id: 'test-document-id',
        file_name: 'map.pdf',
        extension: 'pdf',
        file_size: 1024,
      };

      vi.mocked(
        prismaService.recreation_resource_document.create,
      ).mockRejectedValue(new Error('Database error'));

      await expect(
        service.finalizeUpload(REC_RESOURCE_ID, body),
      ).rejects.toThrow('Failed to finalize upload');
    });

    it('should throw 500 error when document retrieval fails after creation', async () => {
      const body = {
        document_id: 'test-document-id',
        file_name: 'map.pdf',
        extension: 'pdf',
        file_size: 1024,
      };

      const mockCreated = createMockDocument('test-document-id', TEST_CAPTION);

      vi.mocked(
        prismaService.recreation_resource_document.create,
      ).mockResolvedValue(mockCreated as any);
      vi.mocked(
        prismaService.recreation_resource_document.findUnique,
      ).mockResolvedValueOnce(null);

      await expect(
        service.finalizeUpload(REC_RESOURCE_ID, body),
      ).rejects.toThrow('Failed to retrieve created document');
    });

    it('should handle HttpException from database operations', async () => {
      const body = {
        document_id: 'test-document-id',
        file_name: 'map.pdf',
        extension: 'pdf',
        file_size: 1024,
      };

      const httpException = new HttpException('Database constraint error', 409);
      vi.mocked(
        prismaService.recreation_resource_document.create,
      ).mockRejectedValue(httpException);

      await expect(
        service.finalizeUpload(REC_RESOURCE_ID, body),
      ).rejects.toThrow('Database constraint error');
    });
  });
});
