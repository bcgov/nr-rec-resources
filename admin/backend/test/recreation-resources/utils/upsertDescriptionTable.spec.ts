import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Prisma } from '@prisma/client';
import { upsertDescriptionField } from '@/recreation-resources/utils/upsertDescriptionTable';

type MockedModel = {
  deleteMany: ReturnType<typeof vi.fn>;
  findUnique: ReturnType<typeof vi.fn>;
  update: ReturnType<typeof vi.fn>;
  create: ReturnType<typeof vi.fn>;
};

type MockTx = {
  recreation_site_description: MockedModel;
  recreation_driving_direction: MockedModel;
};

describe('upsertDescriptionField', () => {
  let mockTx: MockTx;

  beforeEach(() => {
    mockTx = {
      recreation_site_description: {
        deleteMany: vi.fn(),
        findUnique: vi.fn(),
        update: vi.fn(),
        create: vi.fn(),
      },
      recreation_driving_direction: {
        deleteMany: vi.fn(),
        findUnique: vi.fn(),
        update: vi.fn(),
        create: vi.fn(),
      },
    };
  });

  describe('with recreation_site_description table', () => {
    it('should skip when description is undefined', async () => {
      await upsertDescriptionField(
        mockTx as unknown as Prisma.TransactionClient,
        'recreation_site_description',
        'REC123',
        undefined,
      );

      expect(
        mockTx.recreation_site_description.deleteMany,
      ).not.toHaveBeenCalled();
      expect(
        mockTx.recreation_site_description.findUnique,
      ).not.toHaveBeenCalled();
    });

    it('should delete when description is null', async () => {
      await upsertDescriptionField(
        mockTx as unknown as Prisma.TransactionClient,
        'recreation_site_description',
        'REC123',
        null,
      );

      expect(
        mockTx.recreation_site_description.deleteMany,
      ).toHaveBeenCalledWith({
        where: { rec_resource_id: 'REC123' },
      });
    });

    it('should create when record does not exist', async () => {
      mockTx.recreation_site_description.findUnique.mockResolvedValue(null);

      await upsertDescriptionField(
        mockTx as unknown as Prisma.TransactionClient,
        'recreation_site_description',
        'REC123',
        'New description',
      );

      expect(
        mockTx.recreation_site_description.findUnique,
      ).toHaveBeenCalledWith({
        where: { rec_resource_id: 'REC123' },
      });
      expect(mockTx.recreation_site_description.create).toHaveBeenCalledWith({
        data: {
          rec_resource_id: 'REC123',
          description: 'New description',
        },
      });
    });

    it('should update when record exists', async () => {
      mockTx.recreation_site_description.findUnique.mockResolvedValue({
        rec_resource_id: 'REC123',
        description: 'Old description',
      });

      await upsertDescriptionField(
        mockTx as unknown as Prisma.TransactionClient,
        'recreation_site_description',
        'REC123',
        'Updated description',
      );

      expect(mockTx.recreation_site_description.update).toHaveBeenCalledWith({
        where: { rec_resource_id: 'REC123' },
        data: { description: 'Updated description' },
      });
    });
  });

  describe('with recreation_driving_direction table', () => {
    it('should skip when description is undefined', async () => {
      await upsertDescriptionField(
        mockTx as unknown as Prisma.TransactionClient,
        'recreation_driving_direction',
        'REC456',
        undefined,
      );

      expect(
        mockTx.recreation_driving_direction.deleteMany,
      ).not.toHaveBeenCalled();
      expect(
        mockTx.recreation_driving_direction.findUnique,
      ).not.toHaveBeenCalled();
    });

    it('should delete when description is null', async () => {
      await upsertDescriptionField(
        mockTx as unknown as Prisma.TransactionClient,
        'recreation_driving_direction',
        'REC456',
        null,
      );

      expect(
        mockTx.recreation_driving_direction.deleteMany,
      ).toHaveBeenCalledWith({
        where: { rec_resource_id: 'REC456' },
      });
    });

    it('should create when record does not exist', async () => {
      mockTx.recreation_driving_direction.findUnique.mockResolvedValue(null);

      await upsertDescriptionField(
        mockTx as unknown as Prisma.TransactionClient,
        'recreation_driving_direction',
        'REC456',
        'Driving directions',
      );

      expect(
        mockTx.recreation_driving_direction.findUnique,
      ).toHaveBeenCalledWith({
        where: { rec_resource_id: 'REC456' },
      });
      expect(mockTx.recreation_driving_direction.create).toHaveBeenCalledWith({
        data: {
          rec_resource_id: 'REC456',
          description: 'Driving directions',
        },
      });
    });

    it('should update when record exists', async () => {
      mockTx.recreation_driving_direction.findUnique.mockResolvedValue({
        rec_resource_id: 'REC456',
        description: 'Old directions',
      });

      await upsertDescriptionField(
        mockTx as unknown as Prisma.TransactionClient,
        'recreation_driving_direction',
        'REC456',
        'New directions',
      );

      expect(mockTx.recreation_driving_direction.update).toHaveBeenCalledWith({
        where: { rec_resource_id: 'REC456' },
        data: { description: 'New directions' },
      });
    });
  });
});
