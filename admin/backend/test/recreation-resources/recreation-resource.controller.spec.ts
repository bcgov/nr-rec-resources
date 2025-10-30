import { SuggestionsQueryDto } from '@/recreation-resources/dtos/suggestions-query.dto';
import { SuggestionsResponseDto } from '@/recreation-resources/dtos/suggestions-response.dto';
import { UpdateRecreationResourceDto } from '@/recreation-resources/dtos/update-recreation-resource.dto';
import { RecreationResourceController } from '@/recreation-resources/recreation-resource.controller';
import { RecreationResourceService } from '@/recreation-resources/recreation-resource.service';
import { Test } from '@nestjs/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';

describe('RecreationResourceController', () => {
  let controller: RecreationResourceController;
  let service: RecreationResourceService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [RecreationResourceController],
      providers: [
        {
          provide: RecreationResourceService,
          useValue: {
            getSuggestions: vi.fn(),
            findOne: vi.fn(),
            update: vi.fn(),
          },
        },
      ],
    }).compile();

    controller = moduleRef.get(RecreationResourceController);
    service = moduleRef.get(RecreationResourceService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call service.getSuggestions and return its result', async () => {
    const mockResponse: SuggestionsResponseDto = {
      total: 1,
      suggestions: [
        {
          name: 'Test Resource',
          rec_resource_id: 'REC123',
          recreation_resource_type: 'RR',
          recreation_resource_type_code: 'RR',
          district_description: 'Test District',
          display_on_public_site: true,
        },
      ],
    };
    (service.getSuggestions as any).mockResolvedValue(mockResponse);

    const query: SuggestionsQueryDto = { searchTerm: 'Test' };
    const result = await controller.getSuggestions(query);
    expect(service.getSuggestions).toHaveBeenCalledWith('Test');
    expect(result).toEqual(mockResponse);
  });

  it('should call service.findOne and return its result', async () => {
    const mockResource = {
      rec_resource_id: 'REC123',
      name: 'Test Resource',
      closest_community: '',
      description: undefined,
      driving_directions: undefined,
      maintenance_standard_code: undefined,
      rec_resource_type: '',
      recreation_access: [],
      recreation_activity: [],
      recreation_status: { description: '', comment: '', status_code: 1 },
      campsite_count: 0,
      recreation_structure: { has_toilet: false, has_table: false },
      recreation_district: undefined,
    };
    (service.findOne as any) = vi.fn().mockResolvedValue(mockResource);
    const result = await controller.findOne('REC123');
    expect(service.findOne).toHaveBeenCalledWith('REC123');
    expect(result).toEqual(mockResource);
  });

  it('should throw 404 if resource not found', async () => {
    (service.findOne as any) = vi.fn().mockResolvedValue(null);
    await expect(controller.findOne('NOT_FOUND')).rejects.toThrowError(
      'Recreation Resource not found.',
    );
  });

  describe('update', () => {
    it('should call service.update and return updated resource', async () => {
      const updateData: UpdateRecreationResourceDto = {
        maintenance_standard_code: '1',
        status_code: 1,
      };
      const mockUpdatedResource = {
        rec_resource_id: 'REC123',
        name: 'Test Resource',
        closest_community: '',
        description: undefined,
        driving_directions: undefined,
        maintenance_standard: {
          maintenance_standard_code: '1',
          description: 'Standard 1',
        },
        rec_resource_type: '',
        accessCodes: [],
        recreation_activity: [],
        recreation_status: { description: 'Open', comment: '', status_code: 1 },
        campsite_count: 0,
        recreation_structure: { has_toilet: false, has_table: false },
        recreation_district: undefined,
        spatial_feature_geometry: undefined,
        site_point_geometry: undefined,
        project_established_date: undefined,
        recreation_control_access_code: {
          recreation_control_access_code: '',
          description: '',
        },
        risk_rating: undefined,
      };

      (service.update as any).mockResolvedValue(mockUpdatedResource);

      const result = await controller.update('REC123', updateData);

      expect(service.update).toHaveBeenCalledWith('REC123', updateData);
      expect(result).toEqual(mockUpdatedResource);
    });

    it('should propagate NotFoundException from service', async () => {
      const updateData: UpdateRecreationResourceDto = {
        maintenance_standard_code: '1',
      };

      const error = new Error(
        "Recreation resource with ID 'NOT_FOUND' not found",
      );
      error.name = 'NotFoundException';
      (service.update as any).mockRejectedValue(error);

      await expect(controller.update('NOT_FOUND', updateData)).rejects.toThrow(
        "Recreation resource with ID 'NOT_FOUND' not found",
      );
    });

    it('should propagate BadRequestException from service', async () => {
      const updateData: UpdateRecreationResourceDto = {
        control_access_code: 'INVALID',
      };

      const error = new Error(
        'Invalid reference: control_access_code does not exist',
      );
      error.name = 'BadRequestException';
      (service.update as any).mockRejectedValue(error);

      await expect(controller.update('REC123', updateData)).rejects.toThrow(
        'Invalid reference: control_access_code does not exist',
      );
    });
  });
});
