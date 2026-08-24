import { Test, TestingModule } from '@nestjs/testing';
import { describe, beforeEach, it, expect, vi } from 'vitest';
import { RecreationAssetController } from '@/resource-asset/resource-asset.controller';
import { RecreationAssetService } from '@/resource-asset/service/resource-asset.service';
import {
  CreateRecreationAssetDto,
  CreateRecreationAssetRepairDto,
  FindAllAssetsQueryDto,
  RecreationAssetBulkRepairDto,
  RecreationAssetBulkUpdateDto,
  RecreationAssetCodeDto,
  RecreationAssetDto,
  RecreationAssetRepairDto,
  RecreationRepairCodeDto,
  UpdateRecreationAssetDto,
  UpdateRecreationAssetRepairDto,
} from '@/resource-asset/dto';

describe('RecreationAssetController', () => {
  let controller: RecreationAssetController;

  let serviceMock: {
    createAsset: ReturnType<typeof vi.fn>;
    findAllAssets: ReturnType<typeof vi.fn>;
    findAssetById: ReturnType<typeof vi.fn>;
    findAllAssetCodes: ReturnType<typeof vi.fn>;
    findAllRepairCodes: ReturnType<typeof vi.fn>;
    bulkUpdateAssets: ReturnType<typeof vi.fn>;
    updateAsset: ReturnType<typeof vi.fn>;
    deleteAsset: ReturnType<typeof vi.fn>;
    createRepair: ReturnType<typeof vi.fn>;
    findRepairsByAssetId: ReturnType<typeof vi.fn>;
    updateRepair: ReturnType<typeof vi.fn>;
    deleteRepair: ReturnType<typeof vi.fn>;
    bulkInsertRepairs: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    serviceMock = {
      createAsset: vi.fn(),
      findAllAssets: vi.fn(),
      findAssetById: vi.fn(),
      findAllAssetCodes: vi.fn(),
      findAllRepairCodes: vi.fn(),
      bulkUpdateAssets: vi.fn(),
      updateAsset: vi.fn(),
      deleteAsset: vi.fn(),
      createRepair: vi.fn(),
      findRepairsByAssetId: vi.fn(),
      updateRepair: vi.fn(),
      deleteRepair: vi.fn(),
      bulkInsertRepairs: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [RecreationAssetController],
      providers: [
        {
          provide: RecreationAssetService,
          useValue: serviceMock,
        },
      ],
    }).compile();

    controller = module.get<RecreationAssetController>(
      RecreationAssetController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  // =========================================================================
  // RECREATION ASSET ENDPOINTS
  // =========================================================================

  describe('createAsset', () => {
    it('should delegate to service.createAsset with the provided DTO', async () => {
      const dto: CreateRecreationAssetDto = {
        asset_code: 1,
        rec_resource_id: 'REC-123',
        asset_name: 'Bench',
      };

      const expectedResponse: RecreationAssetDto = {
        asset_id: 10,
        rec_resource_id: 'REC-123',
        asset_code: 1,
        asset_name: 'Bench',
      } as RecreationAssetDto;

      serviceMock.createAsset.mockResolvedValue(expectedResponse);

      const result = await controller.createAsset(dto);

      expect(serviceMock.createAsset).toHaveBeenCalledWith(dto);
      expect(result).toEqual(expectedResponse);
    });
  });

  describe('findAllAssets', () => {
    it('should delegate to service.findAllAssets and return an array', async () => {
      const query: FindAllAssetsQueryDto = {};
      const expectedResponse: RecreationAssetDto[] = [
        {
          asset_id: 1,
          rec_resource_id: 'REC-1',
          asset_code: 10,
        } as RecreationAssetDto,
        {
          asset_id: 2,
          rec_resource_id: 'REC-2',
          asset_code: 20,
        } as RecreationAssetDto,
      ];

      serviceMock.findAllAssets.mockResolvedValue(expectedResponse);

      const result = await controller.findAllAssets(query);

      expect(serviceMock.findAllAssets).toHaveBeenCalledOnce();
      expect(result).toEqual(expectedResponse);
    });
  });

  describe('findAssetById', () => {
    it('should delegate to service.findAssetById with parsed ID', async () => {
      const expectedResponse: RecreationAssetDto = {
        asset_id: 5,
        rec_resource_id: 'REC-5',
        asset_code: 10,
      } as RecreationAssetDto;

      serviceMock.findAssetById.mockResolvedValue(expectedResponse);

      const result = await controller.findAssetById(5, false);

      expect(serviceMock.findAssetById).toHaveBeenCalledWith(5, false);
      expect(result).toEqual(expectedResponse);
    });
  });

  describe('findAllAssetCodes', () => {
    it('should delegate to service.findAllAssetCodes and return an array', async () => {
      const expectedResponse: RecreationAssetCodeDto[] = [
        {
          asset_code: 1,
          description: 'Bridge',
          has_length: true,
          has_width: false,
          has_area: false,
        },
        {
          asset_code: 2,
          description: 'Table - log',
          has_length: false,
          has_width: false,
          has_area: false,
        },
      ];

      serviceMock.findAllAssetCodes.mockResolvedValue(expectedResponse);

      const result = await controller.findAllAssetCodes();

      expect(serviceMock.findAllAssetCodes).toHaveBeenCalledOnce();
      expect(result).toEqual(expectedResponse);
    });
  });

  describe('findAllRepairCodes', () => {
    it('should delegate to service.findAllRepairCodes and return an array', async () => {
      const expectedResponse: RecreationRepairCodeDto[] = [
        { recreation_remed_repair_code: 'CL', description: 'Clean' },
        { recreation_remed_repair_code: 'FX', description: 'Fix' },
      ];

      serviceMock.findAllRepairCodes.mockResolvedValue(expectedResponse);

      const result = await controller.findAllRepairCodes();

      expect(serviceMock.findAllRepairCodes).toHaveBeenCalledOnce();
      expect(result).toEqual(expectedResponse);
    });
  });

  describe('bulkUpdateAssets', () => {
    it('should delegate to service.bulkUpdateAssets with the bulk update DTO', async () => {
      const dto: RecreationAssetBulkUpdateDto = {
        asset_ids: [1, 2, 3],
        update_fields: { asset_name: 'Updated Bulk Name' },
      };

      const expectedResponse = {
        status: 'success',
        updated_count: 3,
        updated_asset_ids: [1, 2, 3],
      };

      serviceMock.bulkUpdateAssets.mockResolvedValue(expectedResponse);

      const result = await controller.bulkUpdateAssets(dto);

      expect(serviceMock.bulkUpdateAssets).toHaveBeenCalledWith(dto);
      expect(result).toEqual(expectedResponse);
    });
  });

  describe('updateAsset', () => {
    it('should delegate to service.updateAsset with ID and update DTO', async () => {
      const dto: UpdateRecreationAssetDto = {
        asset_name: 'New Asset Name',
      };

      const expectedResponse: RecreationAssetDto = {
        asset_id: 1,
        asset_name: 'New Asset Name',
      } as RecreationAssetDto;

      serviceMock.updateAsset.mockResolvedValue(expectedResponse);

      const result = await controller.updateAsset(1, dto);

      expect(serviceMock.updateAsset).toHaveBeenCalledWith(1, dto);
      expect(result).toEqual(expectedResponse);
    });
  });

  describe('deleteAsset', () => {
    it('should delegate to service.deleteAsset with parsed ID', async () => {
      serviceMock.deleteAsset.mockResolvedValue(undefined);

      await controller.deleteAsset(1);

      expect(serviceMock.deleteAsset).toHaveBeenCalledWith(1);
    });
  });

  // =========================================================================
  // RECREATION ASSET REPAIR ENDPOINTS
  // =========================================================================

  describe('createRepair', () => {
    it('should attach path param assetId to the DTO and delegate to service.createRepair', async () => {
      const dto: CreateRecreationAssetRepairDto = {
        recreation_remed_repair_code: 'FIX-01',
        estimated_repair_cost: 150,
      };

      const expectedResponse: RecreationAssetRepairDto = {
        repair_id: 100,
        asset_id: 5,
        recreation_remed_repair_code: 'FIX-01',
        estimated_repair_cost: 150,
      } as RecreationAssetRepairDto;

      serviceMock.createRepair.mockResolvedValue(expectedResponse);

      const result = await controller.createRepair(5, dto);

      expect(serviceMock.createRepair).toHaveBeenCalledWith({
        ...dto,
        asset_id: 5,
      });
      expect(result).toEqual(expectedResponse);
    });
  });

  describe('findRepairsByAssetId', () => {
    it('should delegate to service.findRepairsByAssetId with parsed asset ID', async () => {
      const expectedResponse: RecreationAssetRepairDto[] = [
        { repair_id: 1, asset_id: 5 } as RecreationAssetRepairDto,
        { repair_id: 2, asset_id: 5 } as RecreationAssetRepairDto,
      ];

      serviceMock.findRepairsByAssetId.mockResolvedValue(expectedResponse);

      const result = await controller.findRepairsByAssetId(5);

      expect(serviceMock.findRepairsByAssetId).toHaveBeenCalledWith(5);
      expect(result).toEqual(expectedResponse);
    });
  });

  describe('updateRepair', () => {
    it('should delegate to service.updateRepair with repairId and update DTO', async () => {
      const dto: UpdateRecreationAssetRepairDto = {
        urgency: 'HIGH',
      };

      const expectedResponse: RecreationAssetRepairDto = {
        repair_id: 10,
        urgency: 'HIGH',
      } as RecreationAssetRepairDto;

      serviceMock.updateRepair.mockResolvedValue(expectedResponse);

      const result = await controller.updateRepair(10, dto);

      expect(serviceMock.updateRepair).toHaveBeenCalledWith(10, dto);
      expect(result).toEqual(expectedResponse);
    });
  });

  describe('deleteRepair', () => {
    it('should delegate to service.deleteRepair with parsed repairId', async () => {
      serviceMock.deleteRepair.mockResolvedValue(undefined);

      await controller.deleteRepair(10);

      expect(serviceMock.deleteRepair).toHaveBeenCalledWith(10);
    });
  });

  describe('bulkCreateRepairs', () => {
    it('should delegate to service.bulkInsertRepairs with the bulk repair DTO', async () => {
      const dto: RecreationAssetBulkRepairDto = {
        recreation_remed_repair_code: 'REPAIR_ALL',
        completed_date: '2026-08-13',
        changes: [
          {
            asset_ids: [1, 2],
            estimated_repair_cost: 350,
            actual_repair_cost: 300,
          },
        ],
      };

      serviceMock.bulkInsertRepairs.mockResolvedValue(undefined);

      await controller.bulkCreateRepairs(dto);

      expect(serviceMock.bulkInsertRepairs).toHaveBeenCalledWith(dto);
    });
  });
});
