import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RecreationResourceSuggestionsService } from 'src/recreation-resource/service/recreation-resource-suggestion.service';
import { PrismaService } from 'src/prisma.service';

describe('RecreationResourceSuggestionsService', () => {
  let prisma: PrismaService;
  let service: RecreationResourceSuggestionsService;

  const mockResults = [
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

  beforeEach(() => {
    prisma = {
      $queryRaw: vi.fn(),
    } as unknown as PrismaService;

    service = new RecreationResourceSuggestionsService(prisma);
  });

  it('should return suggestions from prisma', async () => {
    vi.mocked(prisma.$queryRaw).mockResolvedValueOnce(mockResults);

    const results = await service.getSuggestions('aileen');
    expect(results).toEqual(mockResults);
    expect(prisma.$queryRaw).toHaveBeenCalledOnce();
  });

  it('should trim the query and use it in the SQL values', async () => {
    vi.mocked(prisma.$queryRaw).mockResolvedValueOnce(mockResults);

    await service.getSuggestions('  aileen   ');
    const [[query]] = vi.mocked(prisma.$queryRaw).mock.calls;

    expect(query.values).toContain('%aileen%');
    expect(query.values).toContain('aileen%');
  });

  it('should return empty array on error', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.mocked(prisma.$queryRaw).mockRejectedValueOnce(new Error('DB error'));

    const results = await service.getSuggestions('fail');
    expect(results).toEqual([]);
  });
});
