import { ResourceDocsService } from '@/resource-docs/service/resource-docs.service';
import { PrismaService } from 'src/prisma.service';
import { S3Service } from 'src/s3/s3.service';
import { Mocked, beforeEach, describe, expect, it, vi } from 'vitest';

import { createMockFile } from 'test/test-utils/file-test-utils';
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
const TEST_DOC_ID = 'test-document-id';
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
    vi.clearAllMocks();
  });

  describe('getById', () => {
    it('should return one resource', async () => {
      const mockDoc = createMockDocument(DOCUMENT_ID, TEST_CAPTION);
      vi.mocked(
        prismaService.recreation_resource_document.findUnique,
      ).mockResolvedValue(mockDoc as any);

      const result = await service.getDocumentByResourceId(
        REC_RESOURCE_ID,
        DOCUMENT_ID,
      );

      expect(result.doc_code_description).toBe(TEST_CAPTION);
      expect(result.document_id).toBe(DOCUMENT_ID);
      expect(result.url).toContain(`${DOCUMENT_ID}/sample.pdf`);
    });

    it('should return status 404 if resource not found', async () => {
      vi.mocked(
        prismaService.recreation_resource_document.findUnique,
      ).mockResolvedValueOnce(null);
      await expect(
        service.getDocumentByResourceId(REC_RESOURCE_ID, DOCUMENT_ID),
      ).rejects.toThrow();
    });
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

  describe('create', () => {
    const mockResource = {
      rec_resource_id: REC_RESOURCE_ID,
      name: 'Test Resource',
    };

    beforeEach(() => {
      vi.mocked(prismaService.recreation_resource.findUnique).mockResolvedValue(
        mockResource as any,
      );
      vi.mocked(s3Service.uploadFile).mockResolvedValue(
        `documents/${REC_RESOURCE_ID}/${TEST_DOC_ID}/sample.pdf`,
      );
      const mockDoc = createMockDocument(TEST_DOC_ID, 'Title', REC_RESOURCE_ID);
      vi.mocked(
        prismaService.recreation_resource_document.create,
      ).mockResolvedValue(mockDoc as any);
      vi.mocked(
        prismaService.recreation_resource_document.findUnique,
      ).mockResolvedValue(mockDoc as any);
    });

    it('should return the created resource', async () => {
      const file = createMockFile({ originalname: 'sample.pdf' });
      const result = await service.create(REC_RESOURCE_ID, 'sample', file);

      expect(s3Service.uploadFile).toHaveBeenCalledWith(
        `documents/${REC_RESOURCE_ID}/${TEST_DOC_ID}`,
        file.buffer,
        `sample.pdf`,
      );
      expect(
        prismaService.recreation_resource_document.create,
      ).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            file_name: 'sample',
            extension: 'pdf',
            doc_code: 'RM',
          }),
        }),
      );
      expect(result.doc_code_description).toBe('Title');
      expect(result.document_id).toBe(TEST_DOC_ID);
      expect(result.url).toContain(`${TEST_DOC_ID}/sample.pdf`);
    });

    it('should return status 404 if resource not found', async () => {
      vi.mocked(prismaService.recreation_resource.findUnique).mockResolvedValue(
        null,
      );
      await expect(
        service.create(
          REC_RESOURCE_ID,
          'sample',
          createMockFile({ originalname: 'sample.pdf' }),
        ),
      ).rejects.toThrow();
      expect(s3Service.uploadFile).not.toHaveBeenCalled();
    });

    it.each([
      ['empty', ''],
      ['null', null],
    ])(
      'should throw FileValidationException when file_name is %s (covers line 83)',
      async (_, fileName) => {
        const file = createMockFile({ originalname: 'sample.pdf' });
        await expect(
          service.create(REC_RESOURCE_ID, fileName as any, file),
        ).rejects.toThrow('File name is required');
        expect(s3Service.uploadFile).not.toHaveBeenCalled();
      },
    );

    it('should throw HttpException when document creation succeeds but retrieval fails (covers line 128)', async () => {
      const file = createMockFile({ originalname: 'sample.pdf' });
      vi.mocked(
        prismaService.recreation_resource_document.findUnique,
      ).mockResolvedValue(null);

      await expect(
        service.create(REC_RESOURCE_ID, 'sample', file),
      ).rejects.toThrow('Failed to retrieve created document');
    });

    it('should handle errors in create method catch block (covers line 133)', async () => {
      const file = createMockFile({ originalname: 'sample.pdf' });
      vi.mocked(s3Service.uploadFile).mockRejectedValueOnce(
        new Error('S3 upload failed'),
      );

      await expect(
        service.create(REC_RESOURCE_ID, 'sample', file),
      ).rejects.toThrow('Failed to upload document');
    });

    // Note: File type validation handled at controller level via ParseFilePipe
  });

  describe('delete', () => {
    it('should return the deleted resource', async () => {
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

      const result = await service.delete(REC_RESOURCE_ID, DOCUMENT_ID);

      expect(deleteCallOrder).toEqual(['db', 's3']);
      expect(s3Service.deleteFile).toHaveBeenCalledWith(
        `documents/${REC_RESOURCE_ID}/${DOCUMENT_ID}/sample.pdf`,
      );
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

      const result = await service.delete(REC_RESOURCE_ID, DOCUMENT_ID);
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
        service.delete(REC_RESOURCE_ID, DOCUMENT_ID),
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
        service.delete(REC_RESOURCE_ID, DOCUMENT_ID),
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

      const result = await service.delete(REC_RESOURCE_ID, DOCUMENT_ID);

      expect(
        prismaService.recreation_resource_document.delete,
      ).toHaveBeenCalled();
      expect(result).toBeDefined();
      expect(result?.document_id).toBe(DOCUMENT_ID);
    });
  });

  describe('URL Construction (service-specific)', () => {
    it('should construct URL with correct document S3 key format', async () => {
      const testPayload = createMockDocument(DOCUMENT_ID, TEST_CAPTION);
      const expectedS3Key = `documents/${REC_RESOURCE_ID}/${DOCUMENT_ID}/sample.pdf`;

      vi.mocked(
        prismaService.recreation_resource_document.findUnique,
      ).mockResolvedValue(testPayload as any);

      const result = await service.getDocumentByResourceId(
        REC_RESOURCE_ID,
        DOCUMENT_ID,
      );

      expect(result.url).toContain(expectedS3Key);
    });
  });
});
