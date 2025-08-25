import { Test, TestingModule } from '@nestjs/testing';
import { HttpException, INestApplication } from '@nestjs/common';
import { RecreationResourceController } from './recreation-resource.controller';
import { RecreationResourceService } from 'src/recreation-resource/service/recreation-resource.service';
import { RecreationResourceSearchService } from 'src/recreation-resource/service/recreation-resource-search.service';
import { RecreationResourceSuggestionsService } from 'src/recreation-resource/service/recreation-resource-suggestion.service';
import { PrismaService } from 'src/prisma.service';
import { RecreationResourceImageDto } from './dto/recreation-resource-image.dto';
import { FsaResourceService } from './service/fsa-resource.service';
import { ApiModule } from 'src/service/fsa-resources';
import { SiteOperatorDto } from './dto/recreation-resource.dto';

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
          provide: PrismaService,
          useValue: {},
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

  // Close the app after each test
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
            ref_id: '1000',
            caption: 'Campground facilities',
            recreation_resource_image_variants: [
              {
                width: 1920,
                height: 1080,
                url: 'https://example.com/images/campground1.jpg',
                size_code: 'llc',
                extension: 'jpg',
              },
            ],
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
                ref_id: '1000',
                caption: 'Campground facilities',
                recreation_resource_image_variants: [
                  {
                    width: 1920,
                    height: 1080,
                    url: 'https://example.com/images/campground1.jpg',
                    size_code: 'llc',
                    extension: 'jpg',
                  },
                ],
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
      .mockResolvedValue(mockResult);

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
});
