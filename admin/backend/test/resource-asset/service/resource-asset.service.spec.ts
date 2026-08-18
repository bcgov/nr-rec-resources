import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { describe, beforeEach, it, expect, vi } from 'vitest';
import { RecreationAssetService } from '@/resource-asset/service/resource-asset.service';
import { PrismaService } from '@/prisma.service';
import { FindAllAssetsQueryDto } from '@/resource-asset/dto';

describe('RecreationAssetService', () => {
  let service: RecreationAssetService;
  let prismaMock: {
    recreation_asset_code: {
      findMany: ReturnType<typeof vi.fn>;
      findUnique: ReturnType<typeof vi.fn>;
    };
    recreation_asset: {
      create: ReturnType<typeof vi.fn>;
      findMany: ReturnType<typeof vi.fn>;
      findUnique: ReturnType<typeof vi.fn>;
      update: ReturnType<typeof vi.fn>;
      delete: ReturnType<typeof vi.fn>;
      updateMany: ReturnType<typeof vi.fn>;
      count: ReturnType<typeof vi.fn>;
    };
    recreation_asset_repair: {
      create: ReturnType<typeof vi.fn>;
      createMany: ReturnType<typeof vi.fn>;
      findMany: ReturnType<typeof vi.fn>;
      findUnique: ReturnType<typeof vi.fn>;
      findFirst: ReturnType<typeof vi.fn>;
      update: ReturnType<typeof vi.fn>;
      delete: ReturnType<typeof vi.fn>;
    };
    $transaction: ReturnType<typeof vi.fn>;
    $queryRawTyped: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    prismaMock = {
      recreation_asset_code: {
        findMany: vi.fn(),
        findUnique: vi.fn(),
      },
      recreation_asset: {
        create: vi.fn(),
        findMany: vi.fn(),
        findUnique: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
        updateMany: vi.fn(),
        count: vi.fn(),
      },
      recreation_asset_repair: {
        create: vi.fn(),
        createMany: vi.fn(),
        findMany: vi.fn(),
        findUnique: vi.fn(),
        findFirst: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      },
      $transaction: vi.fn((cb) => cb(prismaMock)),
      $queryRawTyped: vi.fn().mockResolvedValue([]),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RecreationAssetService,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
      ],
    }).compile();

    service = module.get<RecreationAssetService>(RecreationAssetService);
  });

  // =========================================================================
  // RECREATION ASSET CODE TESTS
  // =========================================================================
  describe('findAllAssetCodes', () => {
    it('should return mapped asset codes including handling null descriptions', async () => {
      prismaMock.recreation_asset_code.findMany.mockResolvedValue([
        { asset_code: 1, description: 'Bridge' },
        { asset_code: 2, description: null },
      ]);

      const result = await service.findAllAssetCodes();

      expect(prismaMock.recreation_asset_code.findMany).toHaveBeenCalledWith({
        orderBy: { asset_code: 'asc' },
      });
      expect(result).toEqual([
        { asset_code: 1, description: 'Bridge' },
        { asset_code: 2, description: null },
      ]);
    });
  });

  describe('findAssetCodeById', () => {
    it('should return a mapped asset code when found', async () => {
      prismaMock.recreation_asset_code.findUnique.mockResolvedValue({
        asset_code: 1,
        description: 'Bridge',
      });

      const result = await service.findAssetCodeById(1);

      expect(prismaMock.recreation_asset_code.findUnique).toHaveBeenCalledWith({
        where: { asset_code: 1 },
      });
      expect(result).toEqual({ asset_code: 1, description: 'Bridge' });
    });

    it('should throw NotFoundException if asset code does not exist', async () => {
      prismaMock.recreation_asset_code.findUnique.mockResolvedValue(null);

      await expect(service.findAssetCodeById(99)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  // =========================================================================
  // RECREATION ASSET TESTS
  // =========================================================================
  describe('createAsset', () => {
    it('should create an asset with all optional fields provided', async () => {
      vi.spyOn(service, 'findAssetCodeById').mockResolvedValue({
        asset_code: 10,
        description: 'Test Code',
      });

      const rawDbRecord = {
        asset_id: 100n,
        parent_id: 50n,
        asset_tag: 'TAG-123',
        rec_resource_id: 'REC-1',
        asset_code: 10,
        asset_name: 'Bench',
        asset_comment: 'Comment',
        legacy_structure_id: 'LEG-1',
        asset_length: 12.5,
        asset_width: 3.0,
        asset_area: 37.5,
        actual_value: 1500,
        default_value: 1600,
        installation_date: new Date('2023-01-01T00:00:00.000Z'),
      };

      prismaMock.recreation_asset.create.mockResolvedValue(rawDbRecord);

      const dto = {
        asset_code: 10,
        rec_resource_id: 'REC-1',
        parent_id: 50,
        asset_tag: 'TAG-123',
        asset_name: 'Bench',
        asset_comment: 'Comment',
        legacy_structure_id: 'LEG-1',
        asset_length: 12.5,
        asset_width: 3.0,
        asset_area: 37.5,
        actual_value: 1500,
        default_value: 1600,
        installation_date: '2023-01-01',
      };

      const result = await service.createAsset(dto);

      expect(prismaMock.recreation_asset.create).toHaveBeenCalledWith({
        data: {
          parent_id: 50n,
          asset_tag: 'TAG-123',
          rec_resource_id: 'REC-1',
          asset_code: 10,
          asset_name: 'Bench',
          asset_comment: 'Comment',
          legacy_structure_id: 'LEG-1',
          asset_length: 12.5,
          asset_width: 3.0,
          asset_area: 37.5,
          actual_value: 1500,
          default_value: 1600,
          installation_date: new Date('2023-01-01'),
        },
      });

      expect(result).toEqual({
        asset_id: 100,
        parent_id: 50,
        asset_tag: 'TAG-123',
        rec_resource_id: 'REC-1',
        asset_code: 10,
        asset_name: 'Bench',
        asset_comment: 'Comment',
        legacy_structure_id: 'LEG-1',
        asset_length: 12.5,
        asset_width: 3.0,
        asset_area: 37.5,
        actual_value: 1500,
        default_value: 1600,
        installation_date: '2023-01-01',
        updated_by: null,
        updated_at: null,
        geometry_type_code: null,
        latitude: null,
        longitude: null,
        recreation_asset_repair: [],
      });
    });

    it('should create an asset with null/undefined optional fields', async () => {
      vi.spyOn(service, 'findAssetCodeById').mockResolvedValue({
        asset_code: 10,
        description: 'Test Code',
      });

      prismaMock.recreation_asset.create.mockResolvedValue({
        asset_id: 101n,
        parent_id: null,
        asset_tag: null,
        rec_resource_id: 'REC-1',
        asset_code: 10,
        asset_name: null,
        asset_comment: null,
        legacy_structure_id: null,
        asset_length: null,
        asset_width: null,
        asset_area: null,
        actual_value: null,
        default_value: null,
        installation_date: null,
      });

      const dto = {
        asset_code: 10,
        rec_resource_id: 'REC-1',
      };

      const result = await service.createAsset(dto);

      expect(prismaMock.recreation_asset.create).toHaveBeenCalledWith({
        data: {
          parent_id: null,
          asset_tag: null,
          rec_resource_id: 'REC-1',
          asset_code: 10,
          asset_name: null,
          asset_comment: null,
          legacy_structure_id: null,
          asset_length: null,
          asset_width: null,
          asset_area: null,
          actual_value: null,
          default_value: null,
          installation_date: null,
        },
      });

      expect(result.installation_date).toBeNull();
    });
  });

  describe('RecreationAssetService - findAllAssets', () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    let prismaService: PrismaService;

    const mockRawAssetList = [
      {
        asset_id: BigInt(101),
        parent_id: BigInt(100),
        asset_tag: 'TAG-01',
        rec_resource_id: 'REC10',
        asset_code: 1,
        asset_name: 'Campsite #1 Table',
        asset_comment: null,
        legacy_structure_id: 'LEG-1',
        asset_length: null,
        asset_width: null,
        asset_area: null,
        actual_value: 1500,
        default_value: 1600,
        installation_date: null,
        recreation_asset_repair: [
          {
            asset_repair_id: BigInt(1),
            asset_id: BigInt(101),
            repair_code: 'REP-001',
            repair_cost: 150,
            repair_date: '2025-05-10',
          },
        ],
      },
      {
        asset_id: BigInt(102),
        parent_id: null,
        asset_tag: 'TAG-02',
        rec_resource_id: 'REC10',
        asset_code: 2,
        asset_name: 'Campsite #2 Bench',
        asset_comment: null,
        legacy_structure_id: null,
        asset_length: null,
        asset_width: null,
        asset_area: null,
        actual_value: 800,
        default_value: 900,
        installation_date: null,
        recreation_asset_repair: [],
      },
    ];

    const mockPrismaService = {
      recreation_asset: {
        findMany: vi.fn(),
        count: vi.fn(),
      },
      $transaction: vi.fn(),
      $queryRawTyped: vi.fn().mockResolvedValue([]),
    };

    beforeEach(async () => {
      vi.clearAllMocks();

      const module: TestingModule = await Test.createTestingModule({
        providers: [
          RecreationAssetService,
          {
            provide: PrismaService,
            useValue: mockPrismaService,
          },
        ],
      }).compile();

      service = module.get<RecreationAssetService>(RecreationAssetService);
      prismaService = module.get<PrismaService>(PrismaService);
    });

    it('should return paginated results with default limit and page when query is empty', async () => {
      const mockTotal = 25;
      mockPrismaService.$transaction.mockResolvedValue([
        mockRawAssetList,
        mockTotal,
      ]);

      const query: FindAllAssetsQueryDto = {};
      const result = await service.findAllAssets(query);

      expect(mockPrismaService.$transaction).toHaveBeenCalledTimes(1);

      // Verify findMany was called without relation include by default
      expect(mockPrismaService.recreation_asset.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: {
            asset_id: 'desc',
          },
          select: {
            actual_value: true,
            asset_area: true,
            asset_code: true,
            asset_comment: true,
            asset_id: true,
            default_value: true,
            asset_length: true,
            asset_name: true,
            asset_tag: true,
            asset_width: true,
            installation_date: true,
            legacy_structure_id: true,
            parent_id: true,
            rec_resource_id: true,
            updated_at: true,
            updated_by: true,
            recreation_asset_repair: false,
          },
          skip: 0,
          take: 10,
          where: {},
        }),
      );

      expect(result).toEqual({
        data: [
          expect.objectContaining({
            asset_id: 101,
            parent_id: 100,
            asset_tag: 'TAG-01',
            rec_resource_id: 'REC10',
            asset_code: 1,
            asset_name: 'Campsite #1 Table',
            actual_value: 1500,
            default_value: 1600,
          }),
          expect.objectContaining({
            asset_id: 102,
            parent_id: null,
            asset_tag: 'TAG-02',
            rec_resource_id: 'REC10',
            asset_code: 2,
            asset_name: 'Campsite #2 Bench',
            actual_value: 800,
            default_value: 900,
          }),
        ],
        total: 25,
        page: 1,
        limit: 10,
        totalPages: 3,
      });
    });

    it('should pass include: { recreation_asset_repair: true } when include_repair is true', async () => {
      mockPrismaService.$transaction.mockResolvedValue([mockRawAssetList, 2]);

      const query: FindAllAssetsQueryDto = {
        include_repair: true,
      };

      const result = await service.findAllAssets(query);

      expect(mockPrismaService.recreation_asset.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          select: {
            actual_value: true,
            default_value: true,
            asset_area: true,
            asset_code: true,
            asset_comment: true,
            asset_id: true,
            asset_length: true,
            asset_name: true,
            asset_tag: true,
            asset_width: true,
            installation_date: true,
            legacy_structure_id: true,
            parent_id: true,
            rec_resource_id: true,
            updated_at: true,
            updated_by: true,
            recreation_asset_repair: true,
          },
        }),
      );

      expect(result.data).toHaveLength(2);
    });

    it('should NOT include repairs when include_repair is explicitly false', async () => {
      mockPrismaService.$transaction.mockResolvedValue([mockRawAssetList, 2]);

      const query: FindAllAssetsQueryDto = {
        include_repair: false,
      };

      await service.findAllAssets(query);

      expect(mockPrismaService.recreation_asset.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          select: {
            actual_value: true,
            default_value: true,
            asset_area: true,
            asset_code: true,
            asset_comment: true,
            asset_id: true,
            asset_length: true,
            asset_name: true,
            asset_tag: true,
            asset_width: true,
            installation_date: true,
            legacy_structure_id: true,
            parent_id: true,
            rec_resource_id: true,
            updated_at: true,
            updated_by: true,
            recreation_asset_repair: false,
          },
        }),
      );
    });

    it('should correctly calculate skip offsets for custom page and limit', async () => {
      mockPrismaService.$transaction.mockResolvedValue([[], 50]);

      const query: FindAllAssetsQueryDto = { page: 3, limit: 15 };
      await service.findAllAssets(query);

      expect(mockPrismaService.recreation_asset.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 30,
          take: 15,
          orderBy: { asset_id: 'desc' },
        }),
      );
    });

    it('should apply exact equality filters (parent_id, rec_resource_id, asset_code, legacy_structure_id)', async () => {
      mockPrismaService.$transaction.mockResolvedValue([[], 0]);

      const query: FindAllAssetsQueryDto = {
        parent_id: 100,
        rec_resource_id: 'REC10',
        asset_code: 5,
        legacy_structure_id: 'LEG-99',
      };

      await service.findAllAssets(query);

      const expectedWhere = {
        parent_id: 100,
        rec_resource_id: 'REC10',
        asset_code: 5,
        legacy_structure_id: 'LEG-99',
      };

      expect(mockPrismaService.recreation_asset.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: expectedWhere }),
      );
      expect(mockPrismaService.recreation_asset.count).toHaveBeenCalledWith({
        where: expectedWhere,
      });
    });

    it('should apply case-insensitive contains filters for asset_tag and asset_name', async () => {
      mockPrismaService.$transaction.mockResolvedValue([[], 0]);

      const query: FindAllAssetsQueryDto = {
        asset_tag: 'TAG',
        asset_name: 'Bench',
      };

      await service.findAllAssets(query);

      const expectedWhere = {
        asset_tag: { contains: 'TAG', mode: 'insensitive' },
        asset_name: { contains: 'Bench', mode: 'insensitive' },
      };

      expect(mockPrismaService.recreation_asset.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: expectedWhere }),
      );
    });

    it('should apply min and max range filters for actual_value', async () => {
      mockPrismaService.$transaction.mockResolvedValue([[], 0]);

      const query: FindAllAssetsQueryDto = {
        min_actual_value: 100,
        max_actual_value: 500,
      };

      await service.findAllAssets(query);

      const expectedWhere = {
        actual_value: {
          gte: 100,
          lte: 500,
        },
      };

      expect(mockPrismaService.recreation_asset.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: expectedWhere }),
      );
    });

    it('should return totalPages as 0 when total items is 0', async () => {
      mockPrismaService.$transaction.mockResolvedValue([[], 0]);

      const result = await service.findAllAssets({});

      expect(result.data).toEqual([]);
      expect(result.total).toBe(0);
      expect(result.totalPages).toBe(0);
    });
  });

  describe('findAssetById', () => {
    it('should return mapped asset if found', async () => {
      prismaMock.recreation_asset.findUnique.mockResolvedValue({
        asset_id: 5n,
        rec_resource_id: 'REC-1',
        asset_code: 10,
      });

      const result = await service.findAssetById(5);

      expect(prismaMock.recreation_asset.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({ where: { asset_id: 5n } }),
      );
      expect(result.asset_id).toBe(5);
    });

    it('should throw NotFoundException if asset not found', async () => {
      prismaMock.recreation_asset.findUnique.mockResolvedValue(null);

      await expect(service.findAssetById(99)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('updateAsset', () => {
    it('should throw BadRequestException if rec_resource_id is explicitly null', async () => {
      // Mock asset existence so ensureAssetExists passes
      prismaMock.recreation_asset.findUnique.mockResolvedValue({
        asset_id: 1n,
      });

      await expect(
        service.updateAsset(1, { rec_resource_id: null as any }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException if asset does not exist', async () => {
      prismaMock.recreation_asset.findUnique.mockResolvedValue(null);

      await expect(
        service.updateAsset(99, { asset_name: 'New Name' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should update all provided non-undefined fields (including null resets & date parsing)', async () => {
      prismaMock.recreation_asset.findUnique.mockResolvedValue({
        asset_id: 1n,
      });
      prismaMock.recreation_asset.update.mockResolvedValue({
        asset_id: 1n,
        rec_resource_id: 'REC-NEW',
        asset_code: 20,
        parent_id: null,
        asset_tag: 'TAG',
        asset_name: 'Name',
        asset_comment: 'Comment',
        legacy_structure_id: 'LEG',
        asset_length: 10,
        asset_width: 5,
        asset_area: 50,
        actual_value: 200,
        default_value: 300,
        installation_date: new Date('2023-05-15T00:00:00.000Z'),
      });

      const dto = {
        parent_id: null,
        asset_tag: 'TAG',
        rec_resource_id: 'REC-NEW',
        asset_code: 20,
        asset_name: 'Name',
        asset_comment: 'Comment',
        legacy_structure_id: 'LEG',
        asset_length: 10,
        asset_width: 5,
        asset_area: 50,
        default_value: 300,
        actual_value: 200,
        installation_date: '2023-05-15',
      };

      const result = await service.updateAsset(1, dto);

      expect(prismaMock.recreation_asset.update).toHaveBeenCalledWith({
        where: { asset_id: 1n },
        data: {
          parent_id: null,
          asset_tag: 'TAG',
          rec_resource_id: 'REC-NEW',
          asset_code: 20,
          asset_name: 'Name',
          asset_comment: 'Comment',
          legacy_structure_id: 'LEG',
          asset_length: 10,
          asset_width: 5,
          asset_area: 50,
          default_value: 300,
          actual_value: 200,
          installation_date: new Date('2023-05-15'),
        },
      });
      expect(result.installation_date).toBe('2023-05-15');
    });

    it('should handle updating parent_id as number and clearing installation_date', async () => {
      prismaMock.recreation_asset.findUnique.mockResolvedValue({
        asset_id: 1n,
      });
      prismaMock.recreation_asset.update.mockResolvedValue({
        asset_id: 1n,
        parent_id: 10n,
        rec_resource_id: 'REC-1',
        asset_code: 10,
        installation_date: null,
      });

      const dto = {
        parent_id: 10,
        installation_date: null,
      };

      await service.updateAsset(1, dto);

      expect(prismaMock.recreation_asset.update).toHaveBeenCalledWith({
        where: { asset_id: 1n },
        data: {
          parent_id: 10n,
          installation_date: null,
        },
      });
    });
  });

  describe('deleteAsset', () => {
    it('should delete asset if found', async () => {
      prismaMock.recreation_asset.findUnique.mockResolvedValue({
        asset_id: 1n,
      });
      prismaMock.recreation_asset.delete.mockResolvedValue({});

      await service.deleteAsset(1);

      expect(prismaMock.recreation_asset.delete).toHaveBeenCalledWith({
        where: { asset_id: 1n },
      });
    });

    it('should throw NotFoundException if asset to delete does not exist', async () => {
      prismaMock.recreation_asset.findUnique.mockResolvedValue(null);

      await expect(service.deleteAsset(99)).rejects.toThrow(NotFoundException);
    });
  });

  describe('bulkUpdateAssets', () => {
    it('should throw BadRequestException if asset_ids is missing or empty', async () => {
      await expect(
        service.bulkUpdateAssets({ asset_ids: [], update_fields: {} }),
      ).rejects.toThrow(BadRequestException);

      await expect(
        service.bulkUpdateAssets({ asset_ids: null as any, update_fields: {} }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if rec_resource_id in update_fields is null', async () => {
      await expect(
        service.bulkUpdateAssets({
          asset_ids: [1],
          update_fields: { rec_resource_id: null as any },
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException if ensureAssetsExist count does not match', async () => {
      prismaMock.recreation_asset.count.mockResolvedValue(1); // Expecting 2

      await expect(
        service.bulkUpdateAssets({
          asset_ids: [1, 2],
          update_fields: { asset_name: 'Bulk' },
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should process all defined dynamic update fields including BigInt and dates', async () => {
      prismaMock.recreation_asset.count.mockResolvedValue(2);
      prismaMock.recreation_asset.updateMany.mockResolvedValue({ count: 2 });

      const dto = {
        asset_ids: [1, 2, 1], // includes duplicates to test Set deduplication
        update_fields: {
          parent_id: 10,
          asset_tag: 'TAG',
          rec_resource_id: 'REC-1',
          asset_code: 5,
          asset_name: 'Bulk Name',
          asset_comment: 'Bulk Comment',
          legacy_structure_id: 'LEG-1',
          asset_length: 15,
          asset_width: 8,
          asset_area: 120,
          default_value: 500,
          actual_value: 450,
          installation_date: '2023-08-01',
        },
      };

      const result = await service.bulkUpdateAssets(dto);

      expect(prismaMock.recreation_asset.updateMany).toHaveBeenCalledWith({
        where: {
          asset_id: { in: [1n, 2n] },
        },
        data: expect.objectContaining({
          parent_id: 10n,
          asset_tag: 'TAG',
          rec_resource_id: 'REC-1',
          asset_code: 5,
          asset_name: 'Bulk Name',
          asset_comment: 'Bulk Comment',
          legacy_structure_id: 'LEG-1',
          asset_length: 15,
          asset_width: 8,
          asset_area: 120,
          default_value: 500,
          actual_value: 450,
          installation_date: new Date('2023-08-01'),
          updated_at: expect.any(Date),
        }),
      });

      expect(result).toEqual({
        status: 'success',
        updated_count: 2,
        updated_asset_ids: [1, 2],
      });
    });

    it('should set parent_id to null and installation_date to null when explicitly null', async () => {
      prismaMock.recreation_asset.count.mockResolvedValue(1);
      prismaMock.recreation_asset.updateMany.mockResolvedValue({ count: 1 });

      await service.bulkUpdateAssets({
        asset_ids: [1],
        update_fields: {
          parent_id: null,
          installation_date: null,
        },
      });

      expect(prismaMock.recreation_asset.updateMany).toHaveBeenCalledWith({
        where: { asset_id: { in: [1n] } },
        data: expect.objectContaining({
          parent_id: null,
          installation_date: null,
        }),
      });
    });
  });

  // =========================================================================
  // RECREATION ASSET REPAIR TESTS
  // =========================================================================
  describe('createRepair', () => {
    it('should throw BadRequestException if asset_id is missing', async () => {
      await expect(service.createRepair({} as any)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw NotFoundException if target asset does not exist', async () => {
      prismaMock.recreation_asset.findUnique.mockResolvedValue(null);

      await expect(service.createRepair({ asset_id: 99 })).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should create a repair with all optional fields', async () => {
      prismaMock.recreation_asset.findUnique.mockResolvedValue({
        asset_id: 1n,
      });
      prismaMock.recreation_asset_repair.create.mockResolvedValue({
        repair_id: 10n,
        asset_id: 1n,
        recreation_remed_repair_code: 'FIX',
        estimated_repair_cost: 100,
        actual_repair_cost: 120,
        repair_completed_date: new Date('2023-09-01T00:00:00.000Z'),
        urgency: 'HIGH',
        trail_segment_start: 'A',
        trail_segment_end: 'B',
      });

      const dto = {
        asset_id: 1,
        recreation_remed_repair_code: 'FIX',
        estimated_repair_cost: 100,
        actual_repair_cost: 120,
        repair_completed_date: '2023-09-01',
        urgency: 'HIGH',
        trail_segment_start: 'A',
        trail_segment_end: 'B',
      };

      const result = await service.createRepair(dto);

      expect(prismaMock.recreation_asset_repair.create).toHaveBeenCalledWith({
        data: {
          asset_id: 1n,
          recreation_remed_repair_code: 'FIX',
          estimated_repair_cost: 100,
          actual_repair_cost: 120,
          repair_completed_date: new Date('2023-09-01'),
          urgency: 'HIGH',
          trail_segment_start: 'A',
          trail_segment_end: 'B',
        },
      });

      expect(result).toEqual({
        repair_id: 10,
        asset_id: 1,
        recreation_remed_repair_code: 'FIX',
        estimated_repair_cost: 100,
        actual_repair_cost: 120,
        repair_completed_date: '2023-09-01',
        urgency: 'HIGH',
        trail_segment_start: 'A',
        trail_segment_end: 'B',
        created_by: null,
        created_at: null,
        updated_by: null,
        updated_at: null,
      });
    });

    it('should create a repair with null default optional fields', async () => {
      prismaMock.recreation_asset.findUnique.mockResolvedValue({
        asset_id: 1n,
      });
      prismaMock.recreation_asset_repair.create.mockResolvedValue({
        repair_id: 11n,
        asset_id: 1n,
        recreation_remed_repair_code: null,
        estimated_repair_cost: null,
        actual_repair_cost: null,
        repair_completed_date: null,
        urgency: null,
        trail_segment_start: null,
        trail_segment_end: null,
      });

      const result = await service.createRepair({ asset_id: 1 });

      expect(result.repair_completed_date).toBeNull();
    });
  });

  describe('findRepairsByAssetId', () => {
    it('should return mapped repairs for valid asset_id', async () => {
      prismaMock.recreation_asset.findUnique.mockResolvedValue({
        asset_id: 1n,
      });
      prismaMock.recreation_asset_repair.findMany.mockResolvedValue([
        { repair_id: 1n, asset_id: 1n },
      ]);

      const result = await service.findRepairsByAssetId(1);

      expect(result[0].repair_id).toBe(1);
    });
  });

  describe('updateRepair', () => {
    it('should throw NotFoundException if repair record does not exist', async () => {
      prismaMock.recreation_asset_repair.findUnique.mockResolvedValue(null);

      await expect(
        service.updateRepair(99, { urgency: 'LOW' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should update all specified non-undefined fields', async () => {
      prismaMock.recreation_asset_repair.findUnique.mockResolvedValue({
        repair_id: 1n,
      });
      prismaMock.recreation_asset_repair.update.mockResolvedValue({
        repair_id: 1n,
        asset_id: 1n,
        recreation_remed_repair_code: 'CODE',
        estimated_repair_cost: 50,
        actual_repair_cost: 60,
        repair_completed_date: new Date('2023-10-01T00:00:00.000Z'),
        urgency: 'MEDIUM',
        trail_segment_start: 'X',
        trail_segment_end: 'Y',
      });

      const dto = {
        recreation_remed_repair_code: 'CODE',
        estimated_repair_cost: 50,
        actual_repair_cost: 60,
        repair_completed_date: '2023-10-01',
        urgency: 'MEDIUM',
        trail_segment_start: 'X',
        trail_segment_end: 'Y',
      };

      await service.updateRepair(1, dto);

      expect(prismaMock.recreation_asset_repair.update).toHaveBeenCalledWith({
        where: { repair_id: 1n },
        data: {
          recreation_remed_repair_code: 'CODE',
          estimated_repair_cost: 50,
          actual_repair_cost: 60,
          repair_completed_date: new Date('2023-10-01'),
          urgency: 'MEDIUM',
          trail_segment_start: 'X',
          trail_segment_end: 'Y',
        },
      });
    });

    it('should handle updating repair_completed_date to null', async () => {
      prismaMock.recreation_asset_repair.findUnique.mockResolvedValue({
        repair_id: 1n,
      });
      prismaMock.recreation_asset_repair.update.mockResolvedValue({
        repair_id: 1n,
        asset_id: 1n,
        repair_completed_date: null,
      });

      await service.updateRepair(1, { repair_completed_date: null });

      expect(prismaMock.recreation_asset_repair.update).toHaveBeenCalledWith({
        where: { repair_id: 1n },
        data: { repair_completed_date: null },
      });
    });
  });

  describe('deleteRepair', () => {
    it('should delete existing repair record', async () => {
      prismaMock.recreation_asset_repair.findUnique.mockResolvedValue({
        repair_id: 1n,
      });
      prismaMock.recreation_asset_repair.delete.mockResolvedValue({});

      await service.deleteRepair(1);

      expect(prismaMock.recreation_asset_repair.delete).toHaveBeenCalledWith({
        where: { repair_id: 1n },
      });
    });

    it('should throw NotFoundException if repair to delete does not exist', async () => {
      prismaMock.recreation_asset_repair.findUnique.mockResolvedValue(null);

      await expect(service.deleteRepair(99)).rejects.toThrow(NotFoundException);
    });
  });

  describe('bulkInsertRepairs', () => {
    it('should perform a bulk insert for all assets in the DTO', async () => {
      prismaMock.recreation_asset.count.mockResolvedValue(2); // Assets exist validation passes

      const dto = {
        recreation_remed_repair_code: 'BULK_REPAIR',
        completed_date: '2023-11-15',
        changes: [
          {
            asset_ids: [1, 2],
            repair_cost: 250,
          },
        ],
      };

      await service.bulkInsertRepairs(dto as any);

      // Verify single createMany invocation with mapped records
      expect(
        prismaMock.recreation_asset_repair.createMany,
      ).toHaveBeenCalledWith({
        data: [
          {
            asset_id: 1n,
            recreation_remed_repair_code: 'BULK_REPAIR',
            actual_repair_cost: 250,
            repair_completed_date: new Date('2023-11-15'),
          },
          {
            asset_id: 2n,
            recreation_remed_repair_code: 'BULK_REPAIR',
            actual_repair_cost: 250,
            repair_completed_date: new Date('2023-11-15'),
          },
        ],
      });
    });

    it('should handle null completed_date during bulk upsert', async () => {
      prismaMock.recreation_asset.count.mockResolvedValue(1);
      prismaMock.recreation_asset_repair.findFirst.mockResolvedValue(null);

      const dto = {
        recreation_remed_repair_code: 'BULK_REPAIR',
        completed_date: null,
        changes: [
          {
            asset_ids: [1],
            repair_cost: 100,
          },
        ],
      };

      await service.bulkInsertRepairs(dto as any);

      expect(
        prismaMock.recreation_asset_repair.createMany,
      ).toHaveBeenCalledWith({
        data: [
          {
            asset_id: 1n,
            recreation_remed_repair_code: 'BULK_REPAIR',
            actual_repair_cost: 100,
            repair_completed_date: null,
          },
        ],
      });
    });
  });
});
