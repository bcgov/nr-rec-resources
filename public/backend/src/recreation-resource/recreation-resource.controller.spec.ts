import { Test, TestingModule } from '@nestjs/testing';
import { HttpException, INestApplication } from '@nestjs/common';
import { RecreationResourceController } from './recreation-resource.controller';
import { RecreationResourceService } from 'src/recreation-resource/service/recreation-resource.service';
import { RecreationResourceSearchService } from 'src/recreation-resource/service/recreation-resource-search.service';
import { RecreationResourceSuggestionsService } from 'src/recreation-resource/service/recreation-resource-suggestion.service';
import { RecreationResourceAlphabeticalService } from 'src/recreation-resource/service/recreation-resource-alphabetical.service';
import { AppConfigService } from 'src/app-config/app-config.service';
import { PrismaService } from 'src/prisma.service';
import { RecreationResourceImageDto } from './dto/recreation-resource-image.dto';
import { RecreationResourceImageSize } from '@shared/constants/images';
import { FsaResourceService } from './service/fsa-resource.service';
import { ApiModule } from 'src/service/fsa-resources';
import { SiteOperatorDto } from './dto/recreation-resource.dto';
import { RecreationResourceSummaryService } from './service/recreation-resource-summary.service';

describe('RecreationResourceController', () => {
  let recService: RecreationResourceService;
  let resourceService: FsaResourceService;
  let controller: RecreationResourceController;
  let app: INestApplication;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ApiModule],
      controllers: [RecreationResourceController],
      providers: [
        FsaResourceService,
        RecreationResourceService,
        RecreationResourceSearchService,
        RecreationResourceSuggestionsService,
        {
          provide: RecreationResourceAlphabeticalService,
          useValue: {
            getAlphabeticalResources: vi.fn(),
          },
        },
        {
          provide: PrismaService,
          useValue: {},
        },
        {
          provide: AppConfigService,
          useValue: {
            rstStorageCloudfrontUrl: 'https://test-cloudfront.example.com',
            forestClientApiKey: 'test-api-key',
            forestClientApiUrl: 'https://test-api.example.com',
          },
        },
        {
          provide: RecreationResourceSummaryService,
          useValue: {
            findAll: vi.fn(),
          },
        },
      ],
    }).compile();

    recService = module.get<RecreationResourceService>(
      RecreationResourceService,
    );
    resourceService = module.get<FsaResourceService>(FsaResourceService);
    controller = module.get<RecreationResourceController>(
      RecreationResourceController,
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

  describe('findOne', () => {
    it('should return a Recreation Resource object', async () => {
      const result = {
        rec_resource_id: 'REC0001',
        name: 'Rec site 1',
        description: 'Rec site 1 description',
        closest_community: 'Rec site 1 location',
        recreation_activity: [],
        display_on_public_site: true,
        campsite_count: 20,
        rec_resource_type: 'RR',
        recreation_status: {
          description: 'Active',
          comment: 'Active',
          status_code: 1,
        },
        recreation_resource_images: <RecreationResourceImageDto[]>[
          {
            image_id: '1000',
          },
        ],
      };
      vi.spyOn(recService, 'findOne').mockResolvedValue(result as any);
      expect(await controller.findOne('REC0001')).toBe(result);
    });

    it('should throw error if recreation resource not found', async () => {
      vi.spyOn(recService, 'findOne').mockResolvedValue(undefined);
      try {
        await controller.findOne('REC0001');
      } catch (e) {
        expect(e).toBeInstanceOf(HttpException);
        expect(e.message).toBe('Recreation Resource not found.');
      }
    });
  });

  describe('searchRecreationResources', () => {
    it('should return paginated recreation resources', async () => {
      const mockResult = {
        data: [
          {
            rec_resource_id: 'REC0001',
            name: 'Rec site 1',
            description: 'Rec site 1 description',
            closest_community: 'Rec site 1 location',
            rec_resource_type: 'RR',
            recreation_activity: [],
            campsite_count: 20,
            recreation_status: {
              description: 'Active',
              comment: 'Active',
              status_code: 1,
            },
            recreation_resource_images: <RecreationResourceImageDto[]>[
              {
                image_id: '1000',
              },
            ],
          },
        ],
        total: 1,
        page: 1,
        limit: 10,
        filters: [],
      };

      vi.spyOn(recService, 'searchRecreationResources').mockResolvedValue(
        mockResult as any,
      );

      const result = await controller.searchRecreationResources('test', 10, 1);
      expect(result).toBe(mockResult);
    });

    it('should handle empty search results', async () => {
      const mockResult = {
        data: [],
        total: 0,
        page: 1,
        limit: 10,
        filters: [],
      };

      vi.spyOn(recService, 'searchRecreationResources').mockResolvedValue(
        mockResult as any,
      );

      const result = await controller.searchRecreationResources('', 10, 1);
      expect(result).toBe(mockResult);
    });
  });

  describe('findSiteOperator', () => {
    it('should return a Site Operator object', async () => {
      const result = {
        clientNumber: '01',
        clientName: 'CLIENT 01',
        clientStatusCode: 'ACT',
        clientTypeCode: 'C',
        legalFirstName: 'FIRST NAME',
        legalMiddleName: 'MIDDLE NAME',
        acronym: 'ACR',
      } as SiteOperatorDto;
      vi.spyOn(recService, 'findClientNumber').mockResolvedValue('01');
      vi.spyOn(resourceService, 'findByClientNumber').mockResolvedValue(result);
      expect(await controller.findSiteOperator('REC0001')).toStrictEqual(
        result,
      );
    });

    it("should return an error if the client number isn't found", async () => {
      vi.spyOn(recService, 'findClientNumber').mockResolvedValue(null);
      try {
        await controller.findSiteOperator('REC0001');
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        expect((error as HttpException).getStatus()).toBe(404);
      }
    });

    it('should return an error if the api call fails', async () => {
      vi.spyOn(recService, 'findClientNumber').mockResolvedValue('01');
      vi.spyOn(resourceService, 'findByClientNumber').mockRejectedValue(
        new HttpException('error', 500),
      );
      try {
        await controller.findSiteOperator('REC0001');
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        expect((error as HttpException).getStatus()).toBe(500);
      }
    });
  });

  it('should convert string lat/lon into numbers', async () => {
    const mockResult = {
      data: [],
      total: 0,
      page: 1,
      limit: 10,
      filters: [],
    };

    const spy = vi
      .spyOn(recService, 'searchRecreationResources')
      .mockResolvedValue(mockResult as any);

    const lat: any = '48.4284';
    const lon: any = '-123.3656';

    const result = await controller.searchRecreationResources(
      'test',
      10,
      1,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      lat,
      lon,
    );

    expect(result).toBe(mockResult);
    expect(spy).toHaveBeenCalledWith(
      1,
      'test',
      10,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      48.4284,
      -123.3656,
    );
  });

  describe('getSuggestions', () => {
    it('should throw 400 if query param is missing or empty', async () => {
      await expect(controller.getSuggestions('')).rejects.toThrowError(
        /Query parameter 'query' is required/,
      );
      await expect(controller.getSuggestions('   ')).rejects.toThrowError(
        /Query parameter 'query' is required/,
      );
      await expect(controller.getSuggestions(null as any)).rejects.toThrowError(
        /Query parameter 'query' is required/,
      );
    });

    it('should call service.getSuggestions and return the suggestions', async () => {
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

      vi.spyOn(recService, 'getSuggestions').mockResolvedValueOnce(
        mockSuggestions as any,
      );

      const result = await controller.getSuggestions('aileen');

      expect(result).toEqual(mockSuggestions);
      expect(recService.getSuggestions).toHaveBeenCalledWith('aileen');
    });
  });

  describe('getAlphabeticalResources', () => {
    const mockAlphabeticalResources = [
      {
        rec_resource_id: 'REC001',
        name: 'Alpine Trail',
        recreation_resource_type: 'Trail',
        recreation_resource_type_code: 'TRAIL',
      },
      {
        rec_resource_id: 'REC002',
        name: 'Aspen Lake',
        recreation_resource_type: 'Lake',
        recreation_resource_type_code: 'LAKE',
      },
    ];

    const mockNumericalResources = [
      {
        rec_resource_id: 'REC003',
        name: '0 K SNOWMOBILE PARKING LOT',
        recreation_resource_type: 'Parking',
        recreation_resource_type_code: 'PARK',
      },
      {
        rec_resource_id: 'REC004',
        name: '10 K SNOWMOBILE PARKING LOT',
        recreation_resource_type: 'Parking',
        recreation_resource_type_code: 'PARK',
      },
    ];

    it('should return resources for a specific letter', async () => {
      vi.spyOn(recService, 'getAlphabeticalResources').mockResolvedValueOnce(
        mockAlphabeticalResources as any,
      );

      const result = await controller.getAlphabeticalResources('A');

      expect(result).toEqual(mockAlphabeticalResources);
      expect(recService.getAlphabeticalResources).toHaveBeenCalledWith(
        'A',
        undefined,
      );
    });

    it('should return numerical resources when letter is #', async () => {
      vi.spyOn(recService, 'getAlphabeticalResources').mockResolvedValueOnce(
        mockNumericalResources as any,
      );

      const result = await controller.getAlphabeticalResources('#');

      expect(result).toEqual(mockNumericalResources);
      expect(recService.getAlphabeticalResources).toHaveBeenCalledWith(
        '#',
        undefined,
      );
    });

    it('should handle case-insensitive letter filtering', async () => {
      vi.spyOn(recService, 'getAlphabeticalResources').mockResolvedValueOnce(
        mockAlphabeticalResources as any,
      );

      const result = await controller.getAlphabeticalResources('a');

      expect(result).toEqual(mockAlphabeticalResources);
      expect(recService.getAlphabeticalResources).toHaveBeenCalledWith(
        'a',
        undefined,
      );
    });

    it('should return empty array when no resources found', async () => {
      vi.spyOn(recService, 'getAlphabeticalResources').mockResolvedValueOnce(
        [] as any,
      );

      const result = await controller.getAlphabeticalResources('Z');

      expect(result).toEqual([]);
      expect(recService.getAlphabeticalResources).toHaveBeenCalledWith(
        'Z',
        undefined,
      );
    });

    it('should filter by type when type parameter is provided', async () => {
      const filteredResources = [mockAlphabeticalResources[0]]; // Only trail resources
      vi.spyOn(recService, 'getAlphabeticalResources').mockResolvedValueOnce(
        filteredResources as any,
      );

      const result = await controller.getAlphabeticalResources('A', 'TRAIL');

      expect(result).toEqual(filteredResources);
      expect(recService.getAlphabeticalResources).toHaveBeenCalledWith(
        'A',
        'TRAIL',
      );
    });
  });

  describe('getMultipleGeometry', () => {
    it('should call service.findMany and return the resources with geometry', async () => {
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

      vi.spyOn(recService, 'findMany').mockResolvedValueOnce(
        mockResponse as any,
      );

      const result = await controller.getMultipleGeometry({ ids: ['REC2328'] });

      expect(result).toEqual(mockResponse);
      expect(recService.findMany).toHaveBeenCalledWith(
        ['REC2328'],
        [
          RecreationResourceImageSize.ORIGINAL,
          RecreationResourceImageSize.PREVIEW,
        ],
      );
    });
  });

  describe('getSummary', () => {
    it('should call findAll with page param 1', async () => {
      const mockSummary = [
        {
          rec_resource_id: 'REC204117',
          name: 'Aileen Lake',
          district_code: 'RDCK',
          district: 'Chilliwack',
          rec_resource_type_code: 'SIT',
          rec_resource_type: 'Recreation Site',
          display_on_public_site: true,
          status_code: null,
          status: null,
          closure_comment: null,
        },
      ];

      const summaryService = app.get(RecreationResourceSummaryService);
      vi.spyOn(summaryService, 'findAll').mockResolvedValueOnce(
        mockSummary as any,
      );

      const result = await controller.getSummary(1);

      expect(result).toEqual(mockSummary);
      expect(summaryService.findAll).toHaveBeenCalledWith(1);
    });

    it('should parse and pass the page param as a number', async () => {
      const summaryService = app.get(RecreationResourceSummaryService);
      vi.spyOn(summaryService, 'findAll').mockResolvedValueOnce([] as any);

      await controller.getSummary(50);

      expect(summaryService.findAll).toHaveBeenCalledWith(50);
    });
  });
});
