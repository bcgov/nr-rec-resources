import { EstablishmentOrderDocsService } from '@/establishment-order-docs/establishment-order-docs.service';
import { S3Service } from '@/s3';
import { HttpException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from 'src/prisma.service';
import { beforeEach, describe, expect, it, Mocked, vi } from 'vitest';

const mockedDocs = [
  {
    s3_key: 'REC0001/establishment-order-2024.pdf',
    rec_resource_id: 'REC0001',
    title: 'Establishment Order 2024',
    file_size: BigInt(1024000),
    extension: 'pdf',
    created_at: new Date('2024-01-01T00:00:00Z'),
  },
  {
    s3_key: 'REC0001/establishment-order-2023.pdf',
    rec_resource_id: 'REC0001',
    title: 'Establishment Order 2023',
    file_size: BigInt(2048000),
    extension: 'pdf',
    created_at: new Date('2023-01-01T00:00:00Z'),
  },
];

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

describe('EstablishmentOrderDocsService', () => {
  let prismaService: Mocked<PrismaService>;
  let service: EstablishmentOrderDocsService;
  let s3Service: Mocked<S3Service>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EstablishmentOrderDocsService,
        {
          provide: PrismaService,
          useValue: {
            recreation_establishment_order_docs: {
              findMany: vi.fn(),
              create: vi.fn(),
              findUnique: vi.fn(),
              delete: vi.fn(),
            },
            recreation_resource: {
              findUnique: vi.fn(),
            },
          },
        },
        {
          provide: S3Service,
          useValue: {
            getSignedUrl: vi.fn(),
            uploadFile: vi.fn(),
            deleteFile: vi.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<EstablishmentOrderDocsService>(
      EstablishmentOrderDocsService,
    );
    prismaService = module.get(PrismaService);
    s3Service = module.get(S3Service);
  });

  describe('getAll', () => {
    it('should return all establishment order documents with presigned URLs', async () => {
      vi.mocked(
        prismaService.recreation_establishment_order_docs.findMany,
      ).mockResolvedValue(mockedDocs as any);

      vi.mocked(s3Service.getSignedUrl)
        .mockResolvedValueOnce(
          'https://s3.amazonaws.com/bucket/REC0001/establishment-order-2024.pdf?signature=abc123',
        )
        .mockResolvedValueOnce(
          'https://s3.amazonaws.com/bucket/REC0001/establishment-order-2023.pdf?signature=def456',
        );

      const result = await service.getAll('REC0001');

      expect(result).toHaveLength(2);
      expect(result[0]).toMatchObject({
        s3_key: 'REC0001/establishment-order-2024.pdf',
        rec_resource_id: 'REC0001',
        title: 'Establishment Order 2024',
        file_size: 1024000,
        extension: 'pdf',
        url: 'https://s3.amazonaws.com/bucket/REC0001/establishment-order-2024.pdf?signature=abc123',
      });
      expect(result[1]).toMatchObject({
        s3_key: 'REC0001/establishment-order-2023.pdf',
        rec_resource_id: 'REC0001',
        title: 'Establishment Order 2023',
        file_size: 2048000,
        extension: 'pdf',
        url: 'https://s3.amazonaws.com/bucket/REC0001/establishment-order-2023.pdf?signature=def456',
      });

      expect(s3Service.getSignedUrl).toHaveBeenCalledTimes(2);
      expect(s3Service.getSignedUrl).toHaveBeenCalledWith(
        'REC0001/establishment-order-2024.pdf',
      );
      expect(s3Service.getSignedUrl).toHaveBeenCalledWith(
        'REC0001/establishment-order-2023.pdf',
      );
    });

    it('should return empty array when no documents found', async () => {
      vi.mocked(
        prismaService.recreation_establishment_order_docs.findMany,
      ).mockResolvedValue([]);

      const result = await service.getAll('REC9999');
      expect(result).toEqual([]);
      expect(result.length).toBe(0);
      expect(s3Service.getSignedUrl).not.toHaveBeenCalled();
    });

    it('should handle null/undefined values in database fields', async () => {
      const docWithNulls = [
        {
          s3_key: 'REC0002/document.pdf',
          rec_resource_id: 'REC0002',
          title: null,
          file_size: null,
          extension: null,
          created_at: null,
        },
      ];

      vi.mocked(
        prismaService.recreation_establishment_order_docs.findMany,
      ).mockResolvedValue(docWithNulls as any);

      vi.mocked(s3Service.getSignedUrl).mockResolvedValueOnce(
        'https://s3.amazonaws.com/bucket/REC0002/document.pdf?signature=xyz',
      );

      const result = await service.getAll('REC0002');

      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        s3_key: 'REC0002/document.pdf',
        rec_resource_id: 'REC0002',
        title: '',
        file_size: 0,
        extension: '',
        url: 'https://s3.amazonaws.com/bucket/REC0002/document.pdf?signature=xyz',
      });
      expect(result[0]?.created_at).toBeUndefined();
    });

    it('should handle documents with undefined rec_resource_id', async () => {
      const docWithUndefinedRecResourceId = [
        {
          s3_key: 'orphan/document.pdf',
          rec_resource_id: null,
          title: 'Orphan Document',
          file_size: BigInt(512000),
          extension: 'pdf',
          created_at: new Date('2024-06-01T00:00:00Z'),
        },
      ];

      vi.mocked(
        prismaService.recreation_establishment_order_docs.findMany,
      ).mockResolvedValue(docWithUndefinedRecResourceId as any);

      vi.mocked(s3Service.getSignedUrl).mockResolvedValueOnce(
        'https://s3.amazonaws.com/bucket/orphan/document.pdf?signature=orphan',
      );

      const result = await service.getAll('REC0003');

      expect(result).toHaveLength(1);
      expect(result[0]?.rec_resource_id).toBeNull();
    });

    it('should call prisma findMany with correct parameters', async () => {
      vi.mocked(
        prismaService.recreation_establishment_order_docs.findMany,
      ).mockResolvedValue([]);

      await service.getAll('REC0001');

      expect(
        prismaService.recreation_establishment_order_docs.findMany,
      ).toHaveBeenCalledWith({
        where: {
          rec_resource_id: 'REC0001',
        },
        select: {
          s3_key: true,
          rec_resource_id: true,
          title: true,
          file_size: true,
          extension: true,
          created_at: true,
        },
      });
    });
  });

  describe('create', () => {
    const mockRecResource = {
      rec_resource_id: 'REC0001',
      name: 'Test Resource',
    };

    it('should create establishment order document successfully', async () => {
      const mockFile = createMockFile('test-order.pdf');
      const title = 'Test Order 2024';
      const s3Key = 'REC0001/Test Order 2024.pdf';

      vi.mocked(prismaService.recreation_resource.findUnique).mockResolvedValue(
        mockRecResource as any,
      );
      vi.mocked(s3Service.uploadFile).mockResolvedValue(s3Key);
      vi.mocked(
        prismaService.recreation_establishment_order_docs.create,
      ).mockResolvedValue({
        s3_key: s3Key,
        rec_resource_id: 'REC0001',
        title,
        file_size: BigInt(1024000),
        extension: 'pdf',
        created_at: new Date('2024-01-01T00:00:00Z'),
      } as any);
      vi.mocked(s3Service.getSignedUrl).mockResolvedValue(
        'https://s3.amazonaws.com/bucket/REC0001/Test%20Order%202024.pdf?signature=xyz',
      );

      const result = await service.create('REC0001', title, mockFile);

      expect(result).toMatchObject({
        s3_key: s3Key,
        rec_resource_id: 'REC0001',
        title,
        file_size: 1024000,
        extension: 'pdf',
        url: 'https://s3.amazonaws.com/bucket/REC0001/Test%20Order%202024.pdf?signature=xyz',
      });

      expect(prismaService.recreation_resource.findUnique).toHaveBeenCalledWith(
        {
          where: { rec_resource_id: 'REC0001' },
        },
      );
      expect(s3Service.uploadFile).toHaveBeenCalledWith(
        'REC0001',
        mockFile.buffer,
        'Test Order 2024.pdf',
      );
      expect(
        prismaService.recreation_establishment_order_docs.create,
      ).toHaveBeenCalledWith({
        data: {
          s3_key: s3Key,
          rec_resource_id: 'REC0001',
          title,
          file_size: BigInt(1024000),
          extension: 'pdf',
        },
      });
      expect(s3Service.getSignedUrl).toHaveBeenCalledWith(s3Key);
    });

    it('should throw 415 error for invalid file type', async () => {
      const mockFile = createMockFile('test.txt', 'text/plain');

      await expect(
        service.create('REC0001', 'Test Document', mockFile),
      ).rejects.toThrow(HttpException);

      try {
        await service.create('REC0001', 'Test Document', mockFile);
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        expect(error.getStatus()).toBe(415);
        expect(error.message).toBe('File Type not allowed');
      }

      expect(
        prismaService.recreation_resource.findUnique,
      ).not.toHaveBeenCalled();
      expect(s3Service.uploadFile).not.toHaveBeenCalled();
    });

    it('should throw 404 error when recreation resource not found', async () => {
      const mockFile = createMockFile('test-order.pdf');

      vi.mocked(prismaService.recreation_resource.findUnique).mockResolvedValue(
        null,
      );

      await expect(
        service.create('REC9999', 'Test Order', mockFile),
      ).rejects.toThrow(HttpException);

      try {
        await service.create('REC9999', 'Test Order', mockFile);
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        expect(error.getStatus()).toBe(404);
        expect(error.message).toBe('Recreation Resource not found');
      }

      expect(s3Service.uploadFile).not.toHaveBeenCalled();
      expect(
        prismaService.recreation_establishment_order_docs.create,
      ).not.toHaveBeenCalled();
    });

    it('should handle S3 upload errors', async () => {
      const mockFile = createMockFile('test-order.pdf');

      vi.mocked(prismaService.recreation_resource.findUnique).mockResolvedValue(
        mockRecResource as any,
      );
      vi.mocked(s3Service.uploadFile).mockRejectedValue(
        new Error('File "test-order.pdf" already exists'),
      );

      await expect(
        service.create('REC0001', 'Test Order', mockFile),
      ).rejects.toThrow('File "test-order.pdf" already exists');

      expect(
        prismaService.recreation_establishment_order_docs.create,
      ).not.toHaveBeenCalled();
    });

    it('should extract file extension correctly', async () => {
      const mockFile = createMockFile('document.PDF', 'application/pdf');
      const title = 'Important Document';
      const s3Key = 'REC0001/Important Document.PDF';

      vi.mocked(prismaService.recreation_resource.findUnique).mockResolvedValue(
        mockRecResource as any,
      );
      vi.mocked(s3Service.uploadFile).mockResolvedValue(s3Key);
      vi.mocked(
        prismaService.recreation_establishment_order_docs.create,
      ).mockResolvedValue({
        s3_key: s3Key,
        rec_resource_id: 'REC0001',
        title,
        file_size: BigInt(1024000),
        extension: 'PDF',
        created_at: new Date('2024-01-01T00:00:00Z'),
      } as any);
      vi.mocked(s3Service.getSignedUrl).mockResolvedValue(
        'https://s3.amazonaws.com/bucket/url',
      );

      const result = await service.create('REC0001', title, mockFile);

      expect(result.extension).toBe('PDF');
      expect(s3Service.uploadFile).toHaveBeenCalledWith(
        'REC0001',
        mockFile.buffer,
        'Important Document.PDF',
      );
    });
  });

  describe('delete', () => {
    const mockDoc = {
      s3_key: 'REC0001/test-order.pdf',
      rec_resource_id: 'REC0001',
      title: 'Test Order',
      file_size: BigInt(1024000),
      extension: 'pdf',
      created_at: new Date('2024-01-01T00:00:00Z'),
    };

    it('should delete establishment order document successfully', async () => {
      vi.mocked(
        prismaService.recreation_establishment_order_docs.findUnique,
      ).mockResolvedValue(mockDoc as any);
      vi.mocked(
        prismaService.recreation_establishment_order_docs.delete,
      ).mockResolvedValue(mockDoc as any);
      vi.mocked(s3Service.deleteFile).mockResolvedValue(undefined);

      const result = await service.delete('REC0001', 'REC0001/test-order.pdf');

      expect(result).toMatchObject({
        s3_key: 'REC0001/test-order.pdf',
        rec_resource_id: 'REC0001',
        title: 'Test Order',
        file_size: 1024000,
        extension: 'pdf',
        url: '',
      });

      expect(
        prismaService.recreation_establishment_order_docs.findUnique,
      ).toHaveBeenCalledWith({
        where: { s3_key: 'REC0001/test-order.pdf' },
      });
      expect(
        prismaService.recreation_establishment_order_docs.delete,
      ).toHaveBeenCalledWith({
        where: { s3_key: 'REC0001/test-order.pdf' },
      });
      expect(s3Service.deleteFile).toHaveBeenCalledWith(
        'REC0001/test-order.pdf',
      );
    });

    it('should throw 404 error when document not found', async () => {
      vi.mocked(
        prismaService.recreation_establishment_order_docs.findUnique,
      ).mockResolvedValue(null);

      await expect(
        service.delete('REC0001', 'REC0001/nonexistent.pdf'),
      ).rejects.toThrow(HttpException);

      try {
        await service.delete('REC0001', 'REC0001/nonexistent.pdf');
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        expect(error.getStatus()).toBe(404);
        expect(error.message).toBe('Document not found');
      }

      expect(
        prismaService.recreation_establishment_order_docs.delete,
      ).not.toHaveBeenCalled();
      expect(s3Service.deleteFile).not.toHaveBeenCalled();
    });

    it('should delete from database before S3', async () => {
      const deletionOrder: string[] = [];

      vi.mocked(
        prismaService.recreation_establishment_order_docs.findUnique,
      ).mockResolvedValue(mockDoc as any);
      vi.mocked(
        prismaService.recreation_establishment_order_docs.delete,
      ).mockImplementation((async () => {
        deletionOrder.push('database');
        return mockDoc;
      }) as any);
      vi.mocked(s3Service.deleteFile).mockImplementation(async () => {
        deletionOrder.push('s3');
      });

      await service.delete('REC0001', 'REC0001/test-order.pdf');

      expect(deletionOrder).toEqual(['database', 's3']);
    });

    it('should handle S3 deletion errors', async () => {
      vi.mocked(
        prismaService.recreation_establishment_order_docs.findUnique,
      ).mockResolvedValue(mockDoc as any);
      vi.mocked(
        prismaService.recreation_establishment_order_docs.delete,
      ).mockResolvedValue(mockDoc as any);
      vi.mocked(s3Service.deleteFile).mockRejectedValue(
        new Error('S3 deletion failed'),
      );

      await expect(
        service.delete('REC0001', 'REC0001/test-order.pdf'),
      ).rejects.toThrow('S3 deletion failed');

      // Database deletion should still have happened
      expect(
        prismaService.recreation_establishment_order_docs.delete,
      ).toHaveBeenCalled();
    });

    it('should handle null values in deleted document', async () => {
      const docWithNulls = {
        s3_key: 'REC0001/test.pdf',
        rec_resource_id: null,
        title: null,
        file_size: null,
        extension: null,
        created_at: null,
      };

      vi.mocked(
        prismaService.recreation_establishment_order_docs.findUnique,
      ).mockResolvedValue(docWithNulls as any);
      vi.mocked(
        prismaService.recreation_establishment_order_docs.delete,
      ).mockResolvedValue(docWithNulls as any);
      vi.mocked(s3Service.deleteFile).mockResolvedValue(undefined);

      const result = await service.delete('REC0001', 'REC0001/test.pdf');

      expect(result).toMatchObject({
        s3_key: 'REC0001/test.pdf',
        title: '',
        file_size: 0,
        extension: '',
        url: '',
      });
      expect(result.rec_resource_id).toBeNull();
      expect(result.created_at).toBeUndefined();
    });
  });
});
