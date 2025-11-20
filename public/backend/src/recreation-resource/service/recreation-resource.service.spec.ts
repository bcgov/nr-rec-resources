import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from 'src/prisma.service';
import { beforeEach, describe, expect, it, Mocked, vi } from 'vitest';
import { RecreationResourceService } from './recreation-resource.service';
import { RecreationResourceSearchService } from './recreation-resource-search.service';
import { RecreationResourceSuggestionsService } from 'src/recreation-resource/service/recreation-resource-suggestion.service';
import { RecreationResourceAlphabeticalService } from './recreation-resource-alphabetical.service';
import {
  mockResponse,
  mockResults,
  mockSpatialResponse,
} from 'src/recreation-resource/utils/formatRecreationResourceDetailResults.spec';

// Test fixtures
const createMockRecResource = (overrides = {}) => ({
  ...mockResponse,
  ...overrides,
});

describe('RecreationResourceService', () => {
  let prismaService: Mocked<PrismaService>;
  let service: RecreationResourceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RecreationResourceService,
        {
          provide: PrismaService,
          useValue: {
            $transaction: vi.fn(),
            recreation_resource: { findUnique: vi.fn(), findMany: vi.fn() },
            recreation_agreement_holder: { findUnique: vi.fn() },
            $queryRawTyped: vi.fn(),
          },
        },
        {
          provide: RecreationResourceSearchService,
          useValue: {
            searchRecreationResources: vi.fn(),
          },
        },
        {
          provide: RecreationResourceSuggestionsService,
          useValue: {
            getSuggestions: vi.fn(),
          },
        },
        {
          provide: RecreationResourceAlphabeticalService,
          useValue: {
            getAlphabeticalResources: vi.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<RecreationResourceService>(RecreationResourceService);
    prismaService = module.get(PrismaService);
  });

  describe('findOne', () => {
    const mockResource = createMockRecResource();

    it('should return formatted recreation resource with spatial data', async () => {
      vi.mocked(
        prismaService.recreation_resource.findUnique,
      ).mockResolvedValueOnce(mockResource as any);
      vi.mocked(prismaService.$queryRawTyped).mockResolvedValueOnce(
        mockSpatialResponse,
      );

      const result = await service.findOne('REC0001');

      expect(result).toMatchObject(mockResults);
    });

    it('should return null if resource not found', async () => {
      vi.mocked(
        prismaService.recreation_resource.findUnique,
      ).mockResolvedValueOnce(null);
      const result = await service.findOne('NONEXISTENT');
      expect(result).toBeNull();
    });
  });

  describe('findClientNumber', () => {
    it('should return an agreement holder', async () => {
      const mockedAgreementHolder = {
        rec_resource_id: '00033837',
        client_number: '01',
        agreement_end_date: new Date(),
        agreement_start_date: new Date(),
        revision_count: 0,
        updated_at: undefined,
        updated_by: '',
        created_at: undefined,
        created_by: '',
      };
      vi.mocked(
        prismaService.recreation_agreement_holder.findUnique,
      ).mockResolvedValueOnce(mockedAgreementHolder);

      const result = await service.findClientNumber('REC0001');

      expect(result).toMatch(mockedAgreementHolder.client_number);
    });

    it('should return null if resource not found', async () => {
      vi.mocked(
        prismaService.recreation_agreement_holder.findUnique,
      ).mockResolvedValueOnce(null);
      const result = await service.findClientNumber('NONEXISTENT');
      expect(result).toBeNull();
    });
  });

  describe('searchRecreationResources', () => {
    it('should call searchRecreationResources with correct parameters', async () => {
      const mockTransactionResponse = [[createMockRecResource()], [], []];

      vi.mocked(prismaService.$transaction).mockResolvedValueOnce(
        mockTransactionResponse,
      );

      const page = 1;
      const filter = 'test';
      const limit = 10;
      const activities = 'activity1,activity2';
      const type = 'type1';
      const district = 'district1';
      const access = 'access1';
      const facilities = 'facility1,facility2';
      const status = 'open';
      const fees = 'R_F';
      const lat = 48.4284;
      const lon = -123.3656;

      const searchRecreationResourcesMock = vi.fn();
      service.searchRecreationResources = searchRecreationResourcesMock;

      await service.searchRecreationResources(
        page,
        filter,
        limit,
        activities,
        type,
        district,
        access,
        facilities,
        status,
        fees,
        lat,
        lon,
      );

      expect(searchRecreationResourcesMock).toHaveBeenCalledWith(
        page,
        filter,
        limit,
        activities,
        type,
        district,
        access,
        facilities,
        status,
        fees,
        lat,
        lon,
      );
    });
  });

  describe('getSuggestions', () => {
    it('should return suggestions', async () => {
      const mockSuggestions = [
        {
          rec_resource_id: 'REC204117',
          name: 'Aileen Lake',
          closest_community: 'Winfield',
          district_description: 'Columbia-Shuswap',
          recreation_resource_type: 'Recreation Site',
          recreation_resource_type_code: 'SIT',
          option_type: 'recreation_resource',
        },
      ];

      const query = 'aileen';

      vi.mocked(
        (service as any).recreationResourceSuggestionsService.getSuggestions,
      ).mockResolvedValueOnce(mockSuggestions);

      const result = await service.getSuggestions(query);

      expect(result).toEqual(mockSuggestions);
      expect(
        (service as any).recreationResourceSuggestionsService.getSuggestions,
      ).toHaveBeenCalledWith(query);
    });
  });

  describe('getAlphabeticalResources', () => {
    it('should return alphabetical resources', async () => {
      const mockAlphabeticalResources = [
        {
          rec_resource_id: 'REC204117',
          name: 'Aileen Lake',
          closest_community: 'Winfield',
          recreation_resource_type: 'Recreation Site',
          recreation_resource_type_code: 'SIT',
        },
      ];

      const letter = 'A';
      const type = 'SIT';

      vi.mocked(
        (service as any).recreationResourceAlphabeticalService
          .getAlphabeticalResources,
      ).mockResolvedValueOnce(mockAlphabeticalResources);

      const result = await service.getAlphabeticalResources(letter, type);

      expect(result).toEqual(mockAlphabeticalResources);
      expect(
        (service as any).recreationResourceAlphabeticalService
          .getAlphabeticalResources,
      ).toHaveBeenCalledWith(letter, type);
    });
  });

  describe('getMultipleGeometry', () => {
    it('should return geometry for each resource', async () => {
      const mockResponse = {
        REC2328: {
          spatial_feature_geometry: [
            '{"type":"Polygon","coordinates":[[[1517288.676,514063.775],[1517290.771,514064.696],[1517291.757,514070.005],[1517292.473,514080.242],[1517292.462,514080.672],[1517295.79,514088.305],[1517299.596,514097.55],[1517299.751,514107.621],[1517311.772,514118.944],[1517314.429,514137.421],[1517323.126,514149.582],[1517327.655,514161.099],[1517331.87,514167.78],[1517347.957,514184.823],[1517348.694,514187.134],[1517349.353,514187.275],[1517357.782,514196.791],[1517364.035,514204.948],[1517374.095,514219.087],[1517387.146,514234.041],[1517391.225,514248.451],[1517391.769,514263.134],[1517397.206,514276.456],[1517398.369,514289.003],[1517401.389,514312.542],[1517401.462,514320.481],[1517401.912,514339.851],[1517401.589,514358.92],[1517398.779,514381.646],[1517397.148,514385.503],[1517382.466,514397.869],[1517377.465,514406.187],[1517368.161,514423.119],[1517361.052,514431.336],[1517347.081,514446.79],[1517339.621,514457.765],[1517317.943,514477.243],[1517306.168,514491.914],[1517297.595,514495.85],[1517277.124,514506.29],[1517274.582,514509.049],[1517256.911,514530.05],[1517251.261,514535.398],[1517232.859,514544.149],[1517224.923,514551.166],[1517209.152,514556.273],[1517201.519,514560.305],[1517186.447,514576.542],[1517179.958,514580.8],[1517175.953,514587.209],[1517173.791,514597.044],[1517165.387,514615.184],[1517152.903,514626.768],[1517144.684,514643.809],[1517131.318,514661.224],[1517122.887,514680.366],[1517111.879,514696.121],[1517105.226,514716.448],[1517093.581,514737.053],[1517086.235,514757.725],[1517084.504,514757.293],[1517027.957,514751.421],[1517099.11,514044.698],[1517288.676,514063.775]]]}',
          ],
          site_point_geometry:
            '{"type":"Point","coordinates":[1517313.7088,514447.53]}',
        },
      };
      const mockSqlResponse = [
        {
          rec_resource_id: 'REC2328',
          spatial_feature_geometry: [
            '{"type":"Polygon","coordinates":[[[1517288.676,514063.775],[1517290.771,514064.696],[1517291.757,514070.005],[1517292.473,514080.242],[1517292.462,514080.672],[1517295.79,514088.305],[1517299.596,514097.55],[1517299.751,514107.621],[1517311.772,514118.944],[1517314.429,514137.421],[1517323.126,514149.582],[1517327.655,514161.099],[1517331.87,514167.78],[1517347.957,514184.823],[1517348.694,514187.134],[1517349.353,514187.275],[1517357.782,514196.791],[1517364.035,514204.948],[1517374.095,514219.087],[1517387.146,514234.041],[1517391.225,514248.451],[1517391.769,514263.134],[1517397.206,514276.456],[1517398.369,514289.003],[1517401.389,514312.542],[1517401.462,514320.481],[1517401.912,514339.851],[1517401.589,514358.92],[1517398.779,514381.646],[1517397.148,514385.503],[1517382.466,514397.869],[1517377.465,514406.187],[1517368.161,514423.119],[1517361.052,514431.336],[1517347.081,514446.79],[1517339.621,514457.765],[1517317.943,514477.243],[1517306.168,514491.914],[1517297.595,514495.85],[1517277.124,514506.29],[1517274.582,514509.049],[1517256.911,514530.05],[1517251.261,514535.398],[1517232.859,514544.149],[1517224.923,514551.166],[1517209.152,514556.273],[1517201.519,514560.305],[1517186.447,514576.542],[1517179.958,514580.8],[1517175.953,514587.209],[1517173.791,514597.044],[1517165.387,514615.184],[1517152.903,514626.768],[1517144.684,514643.809],[1517131.318,514661.224],[1517122.887,514680.366],[1517111.879,514696.121],[1517105.226,514716.448],[1517093.581,514737.053],[1517086.235,514757.725],[1517084.504,514757.293],[1517027.957,514751.421],[1517099.11,514044.698],[1517288.676,514063.775]]]}',
          ],
          site_point_geometry:
            '{"type":"Point","coordinates":[1517313.7088,514447.53]}',
        },
      ];

      vi.mocked(prismaService.$queryRawTyped).mockResolvedValueOnce(
        mockSqlResponse as any,
      );

      const result = await service.getMultipleGeometry(['REC2328']);

      expect(result).toEqual(mockResponse);
    });
  });

  describe('findMany', () => {
    it('should return resources with geometry', async () => {
      const mockGeometryResponse = {
        REC2328: {
          spatial_feature_geometry: [
            '{"type":"Polygon","coordinates":[[[1517288.676,514063.775],[1517290.771,514064.696],[1517291.757,514070.005],[1517292.473,514080.242],[1517292.462,514080.672],[1517295.79,514088.305],[1517299.596,514097.55],[1517299.751,514107.621],[1517311.772,514118.944],[1517314.429,514137.421],[1517323.126,514149.582],[1517327.655,514161.099],[1517331.87,514167.78],[1517347.957,514184.823],[1517348.694,514187.134],[1517349.353,514187.275],[1517357.782,514196.791],[1517364.035,514204.948],[1517374.095,514219.087],[1517387.146,514234.041],[1517391.225,514248.451],[1517391.769,514263.134],[1517397.206,514276.456],[1517398.369,514289.003],[1517401.389,514312.542],[1517401.462,514320.481],[1517401.912,514339.851],[1517401.589,514358.92],[1517398.779,514381.646],[1517397.148,514385.503],[1517382.466,514397.869],[1517377.465,514406.187],[1517368.161,514423.119],[1517361.052,514431.336],[1517347.081,514446.79],[1517339.621,514457.765],[1517317.943,514477.243],[1517306.168,514491.914],[1517297.595,514495.85],[1517277.124,514506.29],[1517274.582,514509.049],[1517256.911,514530.05],[1517251.261,514535.398],[1517232.859,514544.149],[1517224.923,514551.166],[1517209.152,514556.273],[1517201.519,514560.305],[1517186.447,514576.542],[1517179.958,514580.8],[1517175.953,514587.209],[1517173.791,514597.044],[1517165.387,514615.184],[1517152.903,514626.768],[1517144.684,514643.809],[1517131.318,514661.224],[1517122.887,514680.366],[1517111.879,514696.121],[1517105.226,514716.448],[1517093.581,514737.053],[1517086.235,514757.725],[1517084.504,514757.293],[1517027.957,514751.421],[1517099.11,514044.698],[1517288.676,514063.775]]]}',
          ],
          site_point_geometry:
            '{"type":"Point","coordinates":[1517313.7088,514447.53]}',
        },
      };

      const mockFindManyResponse = [
        {
          rec_resource_id: 'REC2328',
          name: 'Canyon Flats',
          closest_community: 'WESTBRIDGE',
          display_on_public_site: true,
          maintenance_standard_code: 'M',
          recreation_site_description: {
            description:
              ' Three small, heavily used camping sites along the Kettle River.  Good swimming hole and sandy beach 300m downstreem from site.',
          },
          recreation_driving_direction: {
            description:
              ' Turn off Highway 33 onto Highway 43 (Christian Valley Road) at Westbridge.  Reset odometer and follow Highway 43 for 30 km to the recreation site on the right.',
          },
          recreation_resource_type_view_public: [
            { rec_resource_type_code: 'SIT', description: 'Recreation site' },
          ],
          recreation_access: [
            { recreation_access_code: { description: 'Road' } },
          ],
          recreation_activity: [
            {
              recreation_activity: {
                recreation_activity_code: 1,
                description: 'Angling',
              },
            },
            {
              recreation_activity: {
                recreation_activity_code: 7,
                description: 'Swimming & bathing',
              },
            },
            {
              recreation_activity: {
                recreation_activity_code: 32,
                description: 'Camping',
              },
            },
          ],
          recreation_status: {
            recreation_status_code: { description: 'Open' },
            comment:
              'On May 14, 2020 day-use activities are permitted at recreation sites. Camping will be permitted on June 1, 2020 subject to Covid-19 health and safety concerns.',
            status_code: 1,
          },
          recreation_fee: [],
          recreation_resource_images: [],
          recreation_structure: [
            { recreation_structure_code: { description: 'Signs' } },
            { recreation_structure_code: { description: 'Sign - 3 Blade' } },
            { recreation_structure_code: { description: 'Registration Box' } },
          ],
          recreation_resource_docs: [],
          recreation_district_code: {
            district_code: 'RDBO',
            description: 'Boundary-South Okanagan',
          },
          recreation_resource_reservation_info: null,
          _count: { recreation_defined_campsite: 3 },
        },
      ];

      const mockResponse = [
        {
          rec_resource_id: 'REC2328',
          name: 'Canyon Flats',
          closest_community: 'WESTBRIDGE',
          description:
            ' Three small, heavily used camping sites along the Kettle River.  Good swimming hole and sandy beach 300m downstreem from site.',
          driving_directions:
            ' Turn off Highway 33 onto Highway 43 (Christian Valley Road) at Westbridge.  Reset odometer and follow Highway 43 for 30 km to the recreation site on the right.',
          maintenance_standard_code: 'M',
          rec_resource_type: 'Recreation site',
          recreation_access: ['Road'],
          recreation_activity: [
            {
              description: 'Angling',
              recreation_activity_code: 1,
            },
            {
              description: 'Swimming & bathing',
              recreation_activity_code: 7,
            },
            {
              description: 'Camping',
              recreation_activity_code: 32,
            },
          ],
          recreation_status: {
            description: 'Open',
            comment:
              'On May 14, 2020 day-use activities are permitted at recreation sites. Camping will be permitted on June 1, 2020 subject to Covid-19 health and safety concerns.',
            status_code: 1,
          },
          campsite_count: 3,
          recreation_resource_images: [],
          recreation_fee: [],
          recreation_structure: {
            has_toilet: false,
            has_table: false,
          },
          additional_fees: [],
          recreation_resource_docs: [],
          spatial_feature_geometry: [
            '{"type":"Polygon","coordinates":[[[1517288.676,514063.775],[1517290.771,514064.696],[1517291.757,514070.005],[1517292.473,514080.242],[1517292.462,514080.672],[1517295.79,514088.305],[1517299.596,514097.55],[1517299.751,514107.621],[1517311.772,514118.944],[1517314.429,514137.421],[1517323.126,514149.582],[1517327.655,514161.099],[1517331.87,514167.78],[1517347.957,514184.823],[1517348.694,514187.134],[1517349.353,514187.275],[1517357.782,514196.791],[1517364.035,514204.948],[1517374.095,514219.087],[1517387.146,514234.041],[1517391.225,514248.451],[1517391.769,514263.134],[1517397.206,514276.456],[1517398.369,514289.003],[1517401.389,514312.542],[1517401.462,514320.481],[1517401.912,514339.851],[1517401.589,514358.92],[1517398.779,514381.646],[1517397.148,514385.503],[1517382.466,514397.869],[1517377.465,514406.187],[1517368.161,514423.119],[1517361.052,514431.336],[1517347.081,514446.79],[1517339.621,514457.765],[1517317.943,514477.243],[1517306.168,514491.914],[1517297.595,514495.85],[1517277.124,514506.29],[1517274.582,514509.049],[1517256.911,514530.05],[1517251.261,514535.398],[1517232.859,514544.149],[1517224.923,514551.166],[1517209.152,514556.273],[1517201.519,514560.305],[1517186.447,514576.542],[1517179.958,514580.8],[1517175.953,514587.209],[1517173.791,514597.044],[1517165.387,514615.184],[1517152.903,514626.768],[1517144.684,514643.809],[1517131.318,514661.224],[1517122.887,514680.366],[1517111.879,514696.121],[1517105.226,514716.448],[1517093.581,514737.053],[1517086.235,514757.725],[1517084.504,514757.293],[1517027.957,514751.421],[1517099.11,514044.698],[1517288.676,514063.775]]]}',
          ],
          site_point_geometry:
            '{"type":"Point","coordinates":[1517313.7088,514447.53]}',
          recreation_district: {
            description: 'Boundary-South Okanagan',
            district_code: 'RDBO',
          },
          recreation_resource_reservation_info: null,
        },
      ];

      vi.mocked(
        prismaService.recreation_resource.findMany,
      ).mockResolvedValueOnce(mockFindManyResponse as any);

      vi.spyOn(service, 'getMultipleGeometry').mockResolvedValueOnce(
        mockGeometryResponse as any,
      );

      const result = await service.findMany(['REC2328']);

      expect(result).toEqual(mockResponse);
    });
  });
});
