import { EstablishmentOrderDocsController } from '@/establishment-order-docs/establishment-order-docs.controller';
import { EstablishmentOrderDocsService } from '@/establishment-order-docs/establishment-order-docs.service';
import { HttpException, INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

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
});
