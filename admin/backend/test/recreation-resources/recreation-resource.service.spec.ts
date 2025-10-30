import { PrismaService } from '@/prisma.service';
import { UpdateRecreationResourceDto } from '@/recreation-resources/dtos/update-recreation-resource.dto';
import { RecreationResourceRepository } from '@/recreation-resources/recreation-resource.repository';
import { RecreationResourceService } from '@/recreation-resources/recreation-resource.service';
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
      rec_resource_type: 'TypeDesc',
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

describe('RecreationResourceService - update', () => {
  let service: RecreationResourceService;
  let repo: RecreationResourceRepository;
  let prisma: PrismaService;

  beforeEach(() => {
    repo = {
      update: vi.fn(),
    } as unknown as RecreationResourceRepository;
    prisma = {
      $queryRawTyped: vi.fn(),
    } as unknown as PrismaService;
    service = new RecreationResourceService(repo, prisma);
  });

  it('should call repository update and format result with complete data', async () => {
    const updateData: UpdateRecreationResourceDto = {
      maintenance_standard_code: '1',
      status_code: 1,
    };
    const mockUpdatedResource = {
      rec_resource_id: 'REC123',
      name: 'Test Resource',
      closest_community: 'Test',
      recreation_site_description: { description: 'desc' },
      recreation_driving_direction: { description: 'drive' },
      maintenance_standard_code: '1',
      recreation_maintenance_standard_code: { description: 'Standard 1' },
      recreation_resource_type_view_admin: [{ description: 'Type' }],
      recreation_access: [],
      recreation_activity: [],
      recreation_status: {
        recreation_status_code: { description: 'Open' },
        comment: '',
        status_code: 1,
      },
      _count: { recreation_defined_campsite: 0 },
      recreation_structure: [],
      recreation_district_code: null,
      recreation_control_access_code: null,
    };

    const mockGeometry = [
      {
        spatial_feature_geometry: null,
        site_point_geometry: null,
      },
    ];

    (repo.update as any).mockResolvedValue(mockUpdatedResource);
    (prisma.$queryRawTyped as any).mockResolvedValue(mockGeometry);

    const result = await service.update('REC123', updateData);

    expect(repo.update).toHaveBeenCalledWith('REC123', updateData);
    expect(prisma.$queryRawTyped).toHaveBeenCalled();
    expect(result).toBeDefined();
    expect(result.rec_resource_id).toBe('REC123');
    expect(result.name).toBe('Test Resource');
  });

  it('should format result correctly with all optional fields present', async () => {
    const updateData: UpdateRecreationResourceDto = {
      maintenance_standard_code: '2',
      control_access_code: 'Y',
    };
    const mockUpdatedResource = {
      rec_resource_id: 'REC456',
      name: 'Complete Resource',
      closest_community: 'Community Name',
      recreation_site_description: { description: 'Full description' },
      recreation_driving_direction: { description: 'Detailed directions' },
      maintenance_standard_code: '2',
      recreation_maintenance_standard_code: { description: 'Standard 2' },
      recreation_resource_type_view_admin: [{ description: 'Campground' }],
      recreation_access: [
        { recreation_access_code: { description: 'Road' } },
        { recreation_access_code: { description: 'Boat-in' } },
      ],
      recreation_activity: [
        {
          recreation_activity: {
            description: 'Camping',
            recreation_activity_code: 1,
          },
        },
      ],
      recreation_status: {
        recreation_status_code: { description: 'Open' },
        comment: 'Fully operational',
        status_code: 1,
      },
      _count: { recreation_defined_campsite: 10 },
      recreation_structure: [
        { recreation_structure_code: { description: 'Toilet' } },
        { recreation_structure_code: { description: 'Table' } },
      ],
      recreation_district_code: {
        description: 'Test District',
        district_code: 'TD',
      },
      recreation_control_access_code: {
        description: 'Controlled',
        control_access_code: 'Y',
      },
    };

    const mockGeometry = [
      {
        spatial_feature_geometry: { type: 'Point', coordinates: [1, 2] },
        site_point_geometry: { type: 'Point', coordinates: [3, 4] },
      },
    ];

    (repo.update as any).mockResolvedValue(mockUpdatedResource);
    (prisma.$queryRawTyped as any).mockResolvedValue(mockGeometry);

    const result = await service.update('REC456', updateData);

    expect(result).toMatchObject({
      rec_resource_id: 'REC456',
      name: 'Complete Resource',
      maintenance_standard: {
        description: 'Standard 2',
        maintenance_standard_code: '2',
      },
      recreation_activity: [
        { description: 'Camping', recreation_activity_code: 1 },
      ],
      campsite_count: 10,
      recreation_structure: { has_toilet: true, has_table: true },
    });
  });
});
