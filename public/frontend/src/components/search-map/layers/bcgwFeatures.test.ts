import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const mockReadFeatures = vi.hoisted(() => vi.fn());

vi.mock('ol/format/EsriJSON', () => ({
  default: function EsriJSONMock(this: any) {
    this.readFeatures = mockReadFeatures;
  },
}));

import { fetchBcgwFeaturesByIds } from './bcgwFeatures';

describe('fetchBcgwFeaturesByIds', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockReadFeatures.mockReturnValue([]);
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('makes a POST request with the correct URL and layer param', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({}),
    } as any);

    await fetchBcgwFeaturesByIds({
      url: '/api/v1/bcgw',
      layer: '5',
      ids: ['AB001'],
    });

    expect(fetch).toHaveBeenCalledWith('/api/v1/bcgw?layer=5', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: ['AB001'] }),
    });
  });

  it('uses the correct layer index in the query string', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({}),
    } as any);

    await fetchBcgwFeaturesByIds({ url: '/api/v1/bcgw', layer: '3', ids: [] });

    expect(fetch).toHaveBeenCalledWith(
      '/api/v1/bcgw?layer=3',
      expect.any(Object),
    );
  });

  it('throws when the response is not ok', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      status: 503,
    } as any);

    await expect(
      fetchBcgwFeaturesByIds({
        url: '/api/v1/bcgw',
        layer: '5',
        ids: ['AB001'],
      }),
    ).rejects.toThrow('BCGW proxy responded with status 503');
  });

  it('parses the response JSON with EsriJSON in Web Mercator', async () => {
    const responseData = { features: [{ geometry: {}, attributes: {} }] };
    const parsedFeatures = [{}];
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(responseData),
    } as any);
    mockReadFeatures.mockReturnValue(parsedFeatures);

    const result = await fetchBcgwFeaturesByIds({
      url: '/api/v1/bcgw',
      layer: '5',
      ids: ['AB001'],
    });

    expect(mockReadFeatures).toHaveBeenCalledWith(responseData, {
      featureProjection: 'EPSG:3857',
      dataProjection: 'EPSG:3857',
    });
    expect(result).toBe(parsedFeatures);
  });

  it('returns an empty array when no features are parsed', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({}),
    } as any);
    mockReadFeatures.mockReturnValue([]);

    const result = await fetchBcgwFeaturesByIds({
      url: '/api/v1/bcgw',
      layer: '3',
      ids: [],
    });

    expect(result).toEqual([]);
  });
});
