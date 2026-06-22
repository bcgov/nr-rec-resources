import { SuggestionsQueryDto } from '@/recreation-resources/dtos/suggestions-query.dto';
import { AdminSearchQueryDto } from '@/recreation-resources/dtos/admin-search-query.dto';
import { SuggestionsResponseDto } from '@/recreation-resources/dtos/suggestions-response.dto';
import { UpdateRecreationResourceDto } from '@/recreation-resources/dtos/update-recreation-resource.dto';
import { RecreationResourceController } from '@/recreation-resources/recreation-resource.controller';
import { RecreationResourceRepository } from '@/recreation-resources/recreation-resource.repository';
import { RecreationResourceService } from '@/recreation-resources/recreation-resource.service';
import { ForbiddenException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Helper to build a mock request with optional roles
const mockReq = (roles: string[] = []) =>
  ({ user: { client_roles: roles } }) as any;

const SUPER_ADMIN_ROLES = ['rst-super-admin'];
const ADMIN_ROLES = ['rst-admin'];

describe('RecreationResourceController', () => {
  let controller: RecreationResourceController;
  let service: RecreationResourceService;
  let repo: RecreationResourceRepository;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [RecreationResourceController],
      providers: [
        {
          provide: RecreationResourceService,
          useValue: {
            searchResources: vi.fn(),
            getSuggestions: vi.fn(),
            findOne: vi.fn(),
            update: vi.fn(),
          },
        },
        {
          provide: RecreationResourceRepository,
          useValue: {
            findOneById: vi.fn(),
          },
        },
      ],
    }).compile();

    controller = moduleRef.get(RecreationResourceController);
    service = moduleRef.get(RecreationResourceService);
    repo = moduleRef.get(RecreationResourceRepository);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('searchResources', () => {
    const mockResponse = {
      data: [
        {
          rec_resource_id: 'REC123',
          name: 'Test Resource',
          recreation_resource_type: 'Recreation site',
          recreation_resource_type_code: 'S',
          district_description: 'Test District',
          display_on_public_site: true,
          closest_community: 'Hope',
          established_date: '2024-01-01',
          campsite_count: 3,
        },
      ],
      total: 1,
      page: 2,
      page_size: 50,
    };

    it('should include archived for all users when there is no text search query', async () => {
      const query: AdminSearchQueryDto = { page: 1, page_size: 25 };
      (service.searchResources as any).mockResolvedValue(mockResponse);

      await controller.searchResources(query, mockReq(ADMIN_ROLES));

      expect(service.searchResources).toHaveBeenCalledWith(query, {
        includeArchived: true,
      });
    });

    it('should include archived for all users when text search query is empty string', async () => {
      const query: AdminSearchQueryDto = { q: '   ', page: 1, page_size: 25 };
      (service.searchResources as any).mockResolvedValue(mockResponse);

      await controller.searchResources(query, mockReq(ADMIN_ROLES));
      expect(service.searchResources).toHaveBeenCalledWith(query, {
        includeArchived: true,
      });
    });

    it('should exclude archived for non-super-admin when text search query is active', async () => {
      const query: AdminSearchQueryDto = {
        q: 'Test',
        page: 2,
        page_size: 50,
        sort: 'name:desc',
      };
      (service.searchResources as any).mockResolvedValue(mockResponse);

      const result = await controller.searchResources(
        query,
        mockReq(ADMIN_ROLES),
      );

      expect(service.searchResources).toHaveBeenCalledWith(query, {
        includeArchived: false,
      });
      expect(result).toEqual(mockResponse);
    });

    it('should include archived for super-admin when text search query is active', async () => {
      const query: AdminSearchQueryDto = {
        q: 'Test',
        page: 2,
        page_size: 50,
        sort: 'name:desc',
      };
      (service.searchResources as any).mockResolvedValue(mockResponse);

      await controller.searchResources(query, mockReq(SUPER_ADMIN_ROLES));

      expect(service.searchResources).toHaveBeenCalledWith(query, {
        includeArchived: true,
      });
    });
  });

  describe('getSuggestions', () => {
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
          closest_community: 'Hope',
        },
      ],
    };

    it('should exclude archived suggestions for non-super-admin', async () => {
      (service.getSuggestions as any).mockResolvedValue(mockResponse);

      const query: SuggestionsQueryDto = { search_term: 'Test' };
      const result = await controller.getSuggestions(
        query,
        mockReq(ADMIN_ROLES),
      );

      expect(service.getSuggestions).toHaveBeenCalledWith('Test', {
        includeArchived: false,
      });
      expect(result).toEqual(mockResponse);
    });

    it('should include archived suggestions for super-admin', async () => {
      (service.getSuggestions as any).mockResolvedValue(mockResponse);

      const query: SuggestionsQueryDto = { search_term: 'Test' };
      await controller.getSuggestions(query, mockReq(SUPER_ADMIN_ROLES));

      expect(service.getSuggestions).toHaveBeenCalledWith('Test', {
        includeArchived: true,
      });
    });
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
      access_codes: [],
      recreation_activity: [],
      recreation_status: { description: 'Open', comment: '', status_code: 1 },
      campsite_count: 0,
      recreation_structure: { has_toilet: false, has_table: false },
      recreation_district: undefined,
      spatial_feature_geometry: undefined,
      site_point_geometry: undefined,
      established_date: undefined,
      recreation_control_access_code: {
        recreation_control_access_code: '',
        description: '',
      },
      risk_rating: undefined,
    };

    it('should call service.update and return updated resource for non-archived resource', async () => {
      (repo.findOneById as any).mockResolvedValue({
        rec_status_code: null,
      });
      (service.update as any).mockResolvedValue(mockUpdatedResource);

      const result = await controller.update(
        'REC123',
        updateData,
        mockReq(ADMIN_ROLES),
      );

      expect(service.update).toHaveBeenCalledWith('REC123', updateData);
      expect(result).toEqual(mockUpdatedResource);
    });

    it('should allow super-admin to update an archived resource', async () => {
      (repo.findOneById as any).mockResolvedValue({
        rec_status_code: 'AR',
      });
      (service.update as any).mockResolvedValue(mockUpdatedResource);

      const result = await controller.update(
        'REC123',
        updateData,
        mockReq(SUPER_ADMIN_ROLES),
      );

      // findOneById is NOT called for super-admin (fast path)
      expect(repo.findOneById).not.toHaveBeenCalled();
      expect(service.update).toHaveBeenCalledWith('REC123', updateData);
      expect(result).toEqual(mockUpdatedResource);
    });

    it('should throw ForbiddenException when non-super-admin tries to update an archived resource', async () => {
      (repo.findOneById as any).mockResolvedValue({
        rec_status_code: 'AR',
      });

      await expect(
        controller.update('REC123', updateData, mockReq(ADMIN_ROLES)),
      ).rejects.toThrow(ForbiddenException);

      expect(service.update).not.toHaveBeenCalled();
    });

    it('should propagate NotFoundException from service', async () => {
      (repo.findOneById as any).mockResolvedValue({ rec_status_code: null });
      const error = new Error(
        "Recreation resource with ID 'NOT_FOUND' not found",
      );
      error.name = 'NotFoundException';
      (service.update as any).mockRejectedValue(error);

      await expect(
        controller.update('NOT_FOUND', updateData, mockReq(ADMIN_ROLES)),
      ).rejects.toThrow("Recreation resource with ID 'NOT_FOUND' not found");
    });

    it('should propagate BadRequestException from service', async () => {
      (repo.findOneById as any).mockResolvedValue({ rec_status_code: null });
      const error = new Error(
        'Invalid reference: control_access_code does not exist',
      );
      error.name = 'BadRequestException';
      (service.update as any).mockRejectedValue(error);

      await expect(
        controller.update(
          'REC123',
          { control_access_code: 'INVALID' },
          mockReq(ADMIN_ROLES),
        ),
      ).rejects.toThrow(
        'Invalid reference: control_access_code does not exist',
      );
    });
  });
});
