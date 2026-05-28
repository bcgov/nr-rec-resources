import { Test, TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { HttpModule, HttpService } from '@nestjs/axios';
import { BadRequestException } from '@nestjs/common';
import { AxiosResponse } from 'axios';
import { of } from 'rxjs';
import { GeospatialService } from './geospatial.service';

const BCGW_BASE =
  'https://maps.gov.bc.ca/arcgis/rest/services/whse/bcgw_pub_whse_forest_tenure/MapServer';

function makeResponse(data: unknown): AxiosResponse<any> {
  return {
    data,
    status: 200,
    statusText: 'OK',
    headers: {},
    config: { url: `${BCGW_BASE}/3/query`, headers: undefined },
  };
}

describe('GeospatialService', () => {
  let service: GeospatialService;
  let httpService: HttpService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [HttpModule],
      providers: [GeospatialService],
    }).compile();

    service = module.get<GeospatialService>(GeospatialService);
    httpService = module.get<HttpService>(HttpService);
  });

  // ── Layer validation ───────────────────────────────────────────────────────

  it('throws BadRequestException for unknown layer', async () => {
    await expect(service.getBcgwLayer('99', [])).rejects.toThrow(
      BadRequestException,
    );
  });

  // ── Empty ids ──────────────────────────────────────────────────────────────

  it('returns empty EsriJSON envelope for empty ids array', async () => {
    const result = await service.getBcgwLayer('3', []);
    expect(result).toEqual({ objectIdFieldName: 'OBJECTID', features: [] });
  });

  // ── FOREST_FILE_ID validation ──────────────────────────────────────────────

  it('throws BadRequestException for ID containing a space', async () => {
    await expect(service.getBcgwLayer('3', ['AB 001'])).rejects.toThrow(
      BadRequestException,
    );
  });

  it('throws BadRequestException for ID containing special characters', async () => {
    await expect(service.getBcgwLayer('3', ['AB;DROP'])).rejects.toThrow(
      BadRequestException,
    );
  });

  it('accepts IDs with letters, digits, hyphens, and underscores', async () => {
    vi.spyOn(httpService, 'get').mockReturnValue(
      of(makeResponse({ objectIdFieldName: 'OBJECTID', features: [] })),
    );

    await expect(
      service.getBcgwLayer('3', ['AB001', 'ab-001', 'ab_001', 'AB-001_XY']),
    ).resolves.not.toThrow();
  });

  // ── URL construction ───────────────────────────────────────────────────────

  it('queries the correct URL suffix /3/query for layer 3', async () => {
    const spy = vi
      .spyOn(httpService, 'get')
      .mockReturnValue(
        of(makeResponse({ objectIdFieldName: 'OBJECTID', features: [] })),
      );

    await service.getBcgwLayer('3', ['AB001']);

    expect(spy).toHaveBeenCalledWith(
      expect.stringContaining(`${BCGW_BASE}/3/query`),
    );
  });

  it('queries the correct URL suffix /5/query for layer 5', async () => {
    const spy = vi
      .spyOn(httpService, 'get')
      .mockReturnValue(
        of(makeResponse({ objectIdFieldName: 'OBJECTID', features: [] })),
      );

    await service.getBcgwLayer('5', ['AB001']);

    expect(spy).toHaveBeenCalledWith(
      expect.stringContaining(`${BCGW_BASE}/5/query`),
    );
  });

  it('WHERE clause contains LIFE_CYCLE_STATUS_CODE=ACTIVE and FOREST_FILE_ID IN list', async () => {
    const spy = vi
      .spyOn(httpService, 'get')
      .mockReturnValue(
        of(makeResponse({ objectIdFieldName: 'OBJECTID', features: [] })),
      );

    await service.getBcgwLayer('3', ['AB001', 'AB002']);

    const calledUrl: string = spy.mock.calls[0][0];
    // URLSearchParams encodes spaces as '+'; replace before decoding.
    const decoded = decodeURIComponent(calledUrl.replace(/\+/g, ' '));
    expect(decoded).toContain("LIFE_CYCLE_STATUS_CODE='ACTIVE'");
    expect(decoded).toContain("FOREST_FILE_ID IN ('AB001','AB002')");
  });

  it('URL contains outSR=102100', async () => {
    const spy = vi
      .spyOn(httpService, 'get')
      .mockReturnValue(
        of(makeResponse({ objectIdFieldName: 'OBJECTID', features: [] })),
      );

    await service.getBcgwLayer('3', ['AB001']);

    expect(spy.mock.calls[0][0]).toContain('outSR=102100');
  });

  it('URL contains OBJECTID and FOREST_FILE_ID in outFields', async () => {
    const spy = vi
      .spyOn(httpService, 'get')
      .mockReturnValue(
        of(makeResponse({ objectIdFieldName: 'OBJECTID', features: [] })),
      );

    await service.getBcgwLayer('3', ['AB001']);

    const decoded = decodeURIComponent(spy.mock.calls[0][0]);
    expect(decoded).toContain('OBJECTID');
    expect(decoded).toContain('FOREST_FILE_ID');
  });

  // ── Chunking ───────────────────────────────────────────────────────────────

  it('makes a single request for 200 or fewer IDs', async () => {
    const spy = vi
      .spyOn(httpService, 'get')
      .mockReturnValue(
        of(makeResponse({ objectIdFieldName: 'OBJECTID', features: [] })),
      );

    const ids = Array.from({ length: 200 }, (_, i) => `ID${i}`);
    await service.getBcgwLayer('3', ids);

    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('makes two requests for 201 IDs', async () => {
    const spy = vi
      .spyOn(httpService, 'get')
      .mockReturnValue(
        of(makeResponse({ objectIdFieldName: 'OBJECTID', features: [] })),
      );

    const ids = Array.from({ length: 201 }, (_, i) => `ID${i}`);
    await service.getBcgwLayer('3', ids);

    expect(spy).toHaveBeenCalledTimes(2);
  });

  // ── Merging ────────────────────────────────────────────────────────────────

  it('concatenates features from all chunks', async () => {
    const chunk1Response = makeResponse({
      objectIdFieldName: 'OBJECTID',
      geometryType: 'esriGeometryPolyline',
      spatialReference: { wkid: 102100 },
      features: [
        { attributes: { OBJECTID: 1 } },
        { attributes: { OBJECTID: 2 } },
      ],
    });
    const chunk2Response = makeResponse({
      objectIdFieldName: 'OBJECTID',
      geometryType: 'esriGeometryPolyline',
      spatialReference: { wkid: 102100 },
      features: [{ attributes: { OBJECTID: 3 } }],
    });

    const spy = vi.spyOn(httpService, 'get');
    spy.mockReturnValueOnce(of(chunk1Response));
    spy.mockReturnValueOnce(of(chunk2Response));

    const ids = Array.from({ length: 201 }, (_, i) => `ID${i}`);
    const result: any = await service.getBcgwLayer('3', ids);

    expect(result.features).toHaveLength(3);
    expect(result.features[0]).toEqual({ attributes: { OBJECTID: 1 } });
    expect(result.features[1]).toEqual({ attributes: { OBJECTID: 2 } });
    expect(result.features[2]).toEqual({ attributes: { OBJECTID: 3 } });
  });

  it('non-feature metadata comes from first chunk only — second chunk metadata is ignored', async () => {
    const chunk1Response = makeResponse({
      objectIdFieldName: 'OBJECTID',
      geometryType: 'esriGeometryPolyline',
      spatialReference: { wkid: 102100 },
      features: [{ attributes: { OBJECTID: 1 } }],
    });
    const chunk2Response = makeResponse({
      objectIdFieldName: 'OBJECTID',
      geometryType: 'esriGeometryPoint', // different — should be ignored
      spatialReference: { wkid: 4326 }, // different — should be ignored
      features: [{ attributes: { OBJECTID: 2 } }],
    });

    const spy = vi.spyOn(httpService, 'get');
    spy.mockReturnValueOnce(of(chunk1Response));
    spy.mockReturnValueOnce(of(chunk2Response));

    const ids = Array.from({ length: 201 }, (_, i) => `ID${i}`);
    const result: any = await service.getBcgwLayer('3', ids);

    expect(result.geometryType).toBe('esriGeometryPolyline');
    expect(result.spatialReference).toEqual({ wkid: 102100 });
  });

  it('skips features merge when a chunk response has no features property', async () => {
    vi.spyOn(httpService, 'get')
      .mockReturnValueOnce(
        of(
          makeResponse({
            objectIdFieldName: 'OBJECTID',
            features: [{ attributes: { OBJECTID: 1 } }],
          }),
        ),
      )
      .mockReturnValueOnce(
        // Second chunk returns a response with no features key (e.g. an empty ArcGIS error envelope)
        of(makeResponse({ objectIdFieldName: 'OBJECTID' })),
      );

    const ids = Array.from({ length: 201 }, (_, i) => `ID${i}`);
    const result: any = await service.getBcgwLayer('3', ids);

    // Only the first chunk's feature should be present; the second chunk is ignored gracefully
    expect(result.features).toHaveLength(1);
  });
});
