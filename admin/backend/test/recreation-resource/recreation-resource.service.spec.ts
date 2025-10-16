import { RecreationResourceRepository } from '@/recreation-resource/recreation-resource.repository';
import { RecreationResourceService } from '@/recreation-resource/recreation-resource.service';
import { PrismaService } from '@/prisma.service';
import { beforeEach, describe, expect, it, vi } from 'vitest';

describe('RecreationResourceService', () => {
  let service: RecreationResourceService;
  let repo: RecreationResourceRepository;
  let prisma: PrismaService;

  beforeEach(() => {
    repo = {
      findSuggestions: vi.fn(),
    } as unknown as RecreationResourceRepository;
    prisma = {
      $queryRawTyped: vi.fn(),
    } as unknown as PrismaService;
    service = new RecreationResourceService(repo, prisma);
  });

  it('should return suggestions in correct format', async () => {
    const mockData = [
      {
        name: 'Test Resource',
        rec_resource_id: 'REC123',
        recreation_resource_type: 'RR',
        recreation_resource_type_code: 'RR',
        district_description: 'District',
      },
    ];
    (repo.findSuggestions as any).mockResolvedValue({
      total: 1,
      data: mockData,
    });

    const result = await service.getSuggestions('Test');
    expect(result.total).toBe(1);
    expect(result.suggestions[0]?.name).toBe('Test Resource');
    expect(result.suggestions[0]?.rec_resource_id).toBe('REC123');
  });

  it('should filter out suggestions missing rec_resource_id', async () => {
    const mockData = [
      {
        name: 'Resource Without ID',
        rec_resource_id: null,
        recreation_resource_type: 'RR',
        recreation_resource_type_code: 'RR',
        district_description: 'District',
      },
    ];
    (repo.findSuggestions as any).mockResolvedValue({
      total: 1,
      data: mockData,
    });

    const result = await service.getSuggestions('Test');
    expect(result.suggestions.length).toBe(0);
  });

  it('should filter out suggestions missing name', async () => {
    const mockData = [
      {
        name: null,
        rec_resource_id: 'REC124',
        recreation_resource_type: 'RR',
        recreation_resource_type_code: 'RR',
        district_description: 'District',
      },
    ];
    (repo.findSuggestions as any).mockResolvedValue({
      total: 1,
      data: mockData,
    });

    const result = await service.getSuggestions('Test');
    expect(result.suggestions.length).toBe(0);
  });
});

describe('RecreationResourceService - findOne', () => {
  let service: RecreationResourceService;
  let repo: RecreationResourceRepository;
  let prisma: PrismaService;

  beforeEach(() => {
    repo = {
      findOneById: vi.fn(),
    } as unknown as RecreationResourceRepository;
    prisma = {
      $queryRawTyped: vi.fn(),
    } as unknown as PrismaService;
    service = new RecreationResourceService(repo, prisma);
  });

  it('should return null if resource not found', async () => {
    (repo.findOneById as any).mockResolvedValue(null);
    const result = await service.findOne('notfound');
    expect(result).toBeNull();
  });

  it('should format and return resource detail if found', async () => {
    const resource = {
      rec_resource_id: 'id1',
      name: 'Test Name',
      closest_community: 'Test Community',
      recreation_site_description: { description: 'desc' },
      recreation_driving_direction: { description: 'drive' },
      maintenance_standard_code: 'U',
      recreation_resource_type_view_admin: [{ description: 'TypeDesc' }],
      recreation_access: [
        { recreation_access_code: { description: 'Road' } },
        { recreation_access_code: { description: 'Boat-in' } },
      ],
      recreation_activity: [
        {
          recreation_activity: {
            description: 'Hiking',
            recreation_activity_code: 1,
          },
        },
      ],
      recreation_status: {
        recreation_status_code: { description: 'Open' },
        comment: 'All good',
        status_code: 1,
      },
      _count: { recreation_defined_campsite: 5 },
      recreation_structure: [
        { recreation_structure_code: { description: 'Toilet' } },
        { recreation_structure_code: { description: 'Table' } },
      ],
      recreation_district_code: {
        description: 'District',
        district_code: 'D1',
      },
    };
    const geometryData = [
      {
        spatial_feature_geometry: null,
        site_point_geometry: null,
      },
    ];
    (repo.findOneById as any).mockResolvedValue(resource);
    (prisma.$queryRawTyped as any).mockResolvedValue(geometryData);
    const result = await service.findOne('id1');
    expect(result).toMatchObject({
      rec_resource_id: 'id1',
      name: 'Test Name',
      closest_community: 'Test Community',
      description: 'desc',
      driving_directions: 'drive',
      maintenance_standard_code: 'U',
      rec_resource_type: 'TypeDesc',
      recreation_access: [
        {
          description: 'Road',
          sub_access_code: undefined,
          sub_access_description: undefined,
        },
        {
          description: 'Boat-in',
          sub_access_code: undefined,
          sub_access_description: undefined,
        },
      ],
      recreation_activity: [
        { description: 'Hiking', recreation_activity_code: 1 },
      ],
      recreation_status: {
        description: 'Open',
        comment: 'All good',
        status_code: 1,
      },
      campsite_count: 5,
      recreation_structure: { has_toilet: true, has_table: true },
      recreation_district: { description: 'District', district_code: 'D1' },
    });
  });
});

describe('RecreationResourceService - isValidSuggestion', () => {
  let service: RecreationResourceService;
  beforeEach(() => {
    service = new RecreationResourceService({} as any, {} as any);
  });
  it('should return true for valid suggestion', () => {
    const item = {
      rec_resource_id: 'id',
      name: 'name',
      recreation_resource_type: 'type',
      recreation_resource_type_code: 'code',
      district_description: 'desc',
    };
    expect((service as any).isValidSuggestion(item)).toBe(true);
  });
  it('should return false for missing fields', () => {
    const item = {
      rec_resource_id: null,
      name: 'name',
      recreation_resource_type: 'type',
      recreation_resource_type_code: 'code',
      district_description: 'desc',
    };
    expect((service as any).isValidSuggestion(item)).toBe(false);
  });
});
