import { Test, TestingModule } from '@nestjs/testing';
import { RecreationResourceSuggestionsService } from './recreation-resource-suggestion.service';
import { PrismaService } from 'src/prisma.service';
import { vi } from 'vitest';

describe('RecreationResourceSuggestionsService', () => {
  let service: RecreationResourceSuggestionsService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RecreationResourceSuggestionsService,
        {
          provide: PrismaService,
          useValue: {
            $queryRaw: vi.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<RecreationResourceSuggestionsService>(
      RecreationResourceSuggestionsService,
    );
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getSuggestions', () => {
    it('should return suggestions with fuzzy search', async () => {
      const mockSuggestions = [
        {
          rec_resource_id: 'REC001',
          name: 'Blue Lake Campground',
          closest_community: 'Hope',
          district_description: 'Chilliwack',
          recreation_resource_type: 'Recreation Site',
          recreation_resource_type_code: 'SIT',
          option_type: 'recreation_resource',
          match_score: 0.8,
        },
      ];

      vi.spyOn(prismaService, '$queryRaw').mockResolvedValue(mockSuggestions);

      const result = await service.getSuggestions('Blue Lake');

      expect(result).toEqual(mockSuggestions);
      expect(prismaService.$queryRaw).toHaveBeenCalledWith(
        expect.objectContaining({
          strings: expect.arrayContaining([
            expect.stringContaining('similarity'),
            expect.stringContaining('fuzzy_score'),
          ]),
        }),
      );
    });

    it('should handle typos with fuzzy search', async () => {
      const mockSuggestions = [
        {
          rec_resource_id: 'REC001',
          name: 'Blue Lake Campground',
          closest_community: 'Hope',
          district_description: 'Kamploops',
          recreation_resource_type: 'Recreation site',
          recreation_resource_type_code: 'SIT',
          option_type: 'recreation_resource',
          match_score: 0.6,
        },
      ];

      vi.spyOn(prismaService, '$queryRaw').mockResolvedValue(mockSuggestions);

      const result = await service.getSuggestions('Blu Lake'); // Typo in search

      expect(result).toEqual(mockSuggestions);
    });

    it('should handle missing words', async () => {
      const mockSuggestions = [
        {
          rec_resource_id: 'REC002',
          name: 'Alpine Lake Trail',
          closest_community: 'Valemount',
          district_description: 'Kamloops',
          recreation_resource_type: 'Recreation site',
          recreation_resource_type_code: 'SIT',
          option_type: 'recreation_resource',
          match_score: 0.7,
        },
      ];

      vi.spyOn(prismaService, '$queryRaw').mockResolvedValue(mockSuggestions);

      const result = await service.getSuggestions('Alpine Trail'); // Missing "Lake"
      expect(result).toEqual(mockSuggestions);
    });

    it('should return empty array on error', async () => {
      vi.spyOn(prismaService, '$queryRaw').mockRejectedValue(
        new Error('Database error'),
      );

      const result = await service.getSuggestions('test');

      expect(result).toEqual([]);
    });
  });
});
