import { EstablishmentOrderDocsService } from '@/establishment-order-docs/establishment-order-docs.service';
import { S3Service } from '@/s3';
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
            },
          },
        },
        {
          provide: S3Service,
          useValue: {
            getSignedUrl: vi.fn(),
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
});
