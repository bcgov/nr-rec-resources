import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { BadRequestException, ConflictException } from '@nestjs/common';
import { Prisma } from '@generated/prisma';
import { PrismaService } from '@/prisma.service';
import { SncscStatusRequestService } from '@/sncsc/sncsc-status-request.service';
import { GeospatialService } from '@/recreation-resources/geospatial/geospatial.service';

describe('GeospatialService', () => {
  let service: GeospatialService;
  let prismaMock: any;
  let sncscStatusRequestServiceMock: any;
  let exhibitAServiceMock: any;

  beforeEach(() => {
    vi.clearAllMocks();

    prismaMock = {
      $queryRawTyped: vi.fn(),
      $queryRawUnsafe: vi.fn(),
      $queryRaw: vi.fn(),
      $executeRaw: vi.fn(),
      $executeRawUnsafe: vi.fn(),
      $transaction: vi.fn(async (callback) => callback(prismaMock)),
      recreation_map_feature: {
        findMany: vi.fn(),
        findFirst: vi.fn(),
      },
      recreation_resource: {
        findUnique: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
      },
      natural_resource_org_unit: {
        findUnique: vi.fn(),
        findFirst: vi.fn(),
        create: vi.fn(),
      },
      recreation_spatial_submission: {
        update: vi.fn(),
      },
    };

    sncscStatusRequestServiceMock = {
      createStatusRequest: vi.fn().mockResolvedValue('status-request-guid'),
    };

    exhibitAServiceMock = {
      autoGenerateForApplicationGuid: vi.fn().mockResolvedValue(undefined),
    };

    process.env.FOREST_CLIENT_API_URL = 'https://forest-client-api.example.ca';
    process.env.FOREST_CLIENT_API_KEY = 'test-api-key';

    service = new GeospatialService(
      prismaMock as unknown as PrismaService,
      sncscStatusRequestServiceMock as unknown as SncscStatusRequestService,
      exhibitAServiceMock,
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe('resolveOrgUnitClientInfo', () => {
    it('fetches client number and name from Forest Client API when org unit code is DND', async () => {
      const fetchMock = vi.fn().mockResolvedValue({
        ok: true,
        text: vi.fn().mockResolvedValue(
          JSON.stringify([
            {
              acronym: 'DND',
              clientName: 'DISTRICT MANAGER NADINA (DND)',
              clientNumber: '00133887',
            },
          ]),
        ),
      });
      vi.stubGlobal('fetch', fetchMock);

      const result = await (service as any).resolveOrgUnitClientInfo('DND');

      expect(result).toEqual({
        client_number: '00133887',
        client_name: 'DISTRICT MANAGER NADINA (DND)',
      });
      expect(fetchMock).toHaveBeenCalledWith(
        expect.stringContaining('/api/clients/findByAcronym?acronym=DND'),
        expect.objectContaining({
          headers: expect.objectContaining({
            'X-API-KEY': 'test-api-key',
          }),
        }),
      );
    });

    it('throws when Forest Client API URL is not configured', async () => {
      delete process.env.FOREST_CLIENT_API_URL;

      await expect(
        (service as any).resolveOrgUnitClientInfo('DND'),
      ).rejects.toThrow(BadRequestException);
    });

    it('throws when Forest Client API key is not configured', async () => {
      delete process.env.FOREST_CLIENT_API_KEY;

      await expect(
        (service as any).resolveOrgUnitClientInfo('DND'),
      ).rejects.toThrow(BadRequestException);
    });

    it('throws when Forest Client API returns non-2xx', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue({
          ok: false,
          text: vi.fn().mockResolvedValue('nope'),
        }),
      );

      await expect(
        (service as any).resolveOrgUnitClientInfo('DND'),
      ).rejects.toThrow(/Unable to resolve client info from Forest Client API/);
    });

    it('throws when Forest Client API returns invalid JSON', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue({
          ok: true,
          text: vi.fn().mockResolvedValue('not json'),
        }),
      );

      await expect(
        (service as any).resolveOrgUnitClientInfo('DND'),
      ).rejects.toThrow(/returned invalid JSON/);
    });

    it('throws when Forest Client API response has no matching complete mapping', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue({
          ok: true,
          text: vi.fn().mockResolvedValue(
            JSON.stringify([
              {
                acronym: 'DND',
                clientName: 'District',
                clientNumber: '',
              },
            ]),
          ),
        }),
      );

      await expect(
        (service as any).resolveOrgUnitClientInfo('DND'),
      ).rejects.toThrow(/No client mapping was returned by Forest Client API/);
    });
  });

  describe('findGeospatialDataById', () => {
    it('returns null when geospatial query returns empty or undefined', async () => {
      prismaMock.$queryRawTyped.mockResolvedValueOnce([]);
      const result = await service.findGeospatialDataById('REC123');
      expect(result).toBeNull();
    });

    it('returns formatted geospatial DTO with sections when data exists', async () => {
      prismaMock.$queryRawTyped.mockResolvedValueOnce([
        {
          spatial_feature_geometry: ['geom1'],
          total_length_km: '10.5',
          total_area_hectares: '5.2',
          right_of_way_m: '15',
          site_point_geometry: 'point-geom',
          utm_zone: 10,
          utm_easting: 500000,
          utm_northing: 5450000,
          latitude: '49.2827',
          longitude: '-123.1207',
        },
      ]);

      prismaMock.$queryRaw.mockResolvedValueOnce([
        { section_id: 'Sec-1' },
        { section_id: null },
        { section_id: 'Sec-2' },
      ]);

      const result = await service.findGeospatialDataById('REC123');
      expect(result).toEqual({
        rec_resource_id: 'REC123',
        spatial_feature_geometry: ['geom1'],
        total_length_km: 10.5,
        total_area_hectares: 5.2,
        right_of_way_m: 15,
        site_point_geometry: 'point-geom',
        utm_zone: 10,
        utm_easting: 500000,
        utm_northing: 5450000,
        latitude: 49.2827,
        longitude: -123.1207,
        section_ids: ['Sec-1', 'Sec-2'],
      });
    });

    it('collapses backend-generated split section IDs for frontend amend matching', async () => {
      prismaMock.$queryRawTyped.mockResolvedValueOnce([
        {
          spatial_feature_geometry: ['geom1'],
          total_length_km: '10.5',
          total_area_hectares: '5.2',
          right_of_way_m: '15',
          site_point_geometry: 'point-geom',
          utm_zone: 10,
          utm_easting: 500000,
          utm_northing: 5450000,
          latitude: '49.2827',
          longitude: '-123.1207',
        },
      ]);

      prismaMock.$queryRaw.mockResolvedValueOnce([
        { section_id: 'Trail-A-1' },
        { section_id: 'Trail-A-2' },
        { section_id: 'Trail-A-3' },
        { section_id: 'Trail-B' },
        { section_id: 'Trail-C-1' },
        { section_id: null },
      ]);

      const result = await service.findGeospatialDataById('REC123');

      expect(result?.section_ids).toEqual(['Trail-A', 'Trail-B', 'Trail-C-1']);
    });

    it('keeps invalid generated section IDs unchanged when suffix parsing is not valid for collapsing', async () => {
      const veryLargeSuffix = `Trail-${'9'.repeat(400)}`;

      prismaMock.$queryRawTyped.mockResolvedValueOnce([
        {
          spatial_feature_geometry: ['geom1'],
          total_length_km: '10.5',
          total_area_hectares: '5.2',
          right_of_way_m: '15',
          site_point_geometry: 'point-geom',
          utm_zone: 10,
          utm_easting: 500000,
          utm_northing: 5450000,
          latitude: '49.2827',
          longitude: '-123.1207',
        },
      ]);

      prismaMock.$queryRaw.mockResolvedValueOnce([
        { section_id: '-1' },
        { section_id: 'Trail-0' },
        { section_id: veryLargeSuffix },
        { section_id: 'Trail-A-1' },
        { section_id: 'Trail-A-2' },
      ]);

      const result = await service.findGeospatialDataById('REC123');

      expect(result?.section_ids).toEqual([
        '-1',
        'Trail-0',
        veryLargeSuffix,
        'Trail-A',
      ]);
    });
  });

  describe('map sheet lookup', () => {
    it('throws when BCGS service returns non-2xx response', async () => {
      prismaMock.$queryRaw.mockResolvedValueOnce([
        { geometry_wkt: 'POLYGON((0 0,0 1,1 1,0 0))' },
      ]);
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue({
          ok: false,
          status: 500,
          statusText: 'Server Error',
          text: vi.fn().mockResolvedValue('fail'),
        }),
      );

      await expect(service.getMapSheetsForExhibitA('REC123')).rejects.toThrow(
        /Unable to query BCGS map sheets/,
      );
    });

    it('returns empty map sheets when resource has no geometry envelope', async () => {
      prismaMock.$queryRaw.mockResolvedValueOnce([{ geometry_wkt: null }]);

      await expect(service.getMapSheetsForExhibitA('REC123')).resolves.toEqual({
        allMapSheets: [],
        bestMapSheet: null,
      });
    });

    it('returns all intersecting map sheets and picks best by overlap area', async () => {
      prismaMock.$queryRaw.mockResolvedValueOnce([
        { geometry_wkt: 'POLYGON((0 0,0 1,1 1,0 0))' },
      ]);

      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue({
          ok: true,
          status: 200,
          statusText: 'OK',
          text: vi.fn().mockResolvedValue(
            JSON.stringify({
              features: [
                {
                  attributes: {
                    MAP_TILE_DISPLAY_NAME: '82G.001',
                    SHAPE_AREA: 10,
                  },
                },
                {
                  attributes: {
                    MAP_TILE_DISPLAY_NAME: '82G.002',
                    SHAPE_AREA: 25,
                  },
                },
              ],
            }),
          ),
        }),
      );

      await expect(service.getMapSheetsForExhibitA('REC123')).resolves.toEqual({
        allMapSheets: ['82G.001', '82G.002'],
        bestMapSheet: '82G.002',
      });
    });

    it('throws when BCGS service returns invalid JSON', async () => {
      prismaMock.$queryRaw.mockResolvedValueOnce([
        { geometry_wkt: 'POLYGON((0 0,0 1,1 1,0 0))' },
      ]);
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue({
          ok: true,
          status: 200,
          statusText: 'OK',
          text: vi.fn().mockResolvedValue('not-json'),
        }),
      );

      await expect(service.getMapSheetsForExhibitA('REC123')).rejects.toThrow(
        /invalid JSON/i,
      );
    });

    it('throws when BCGS service returns an error payload', async () => {
      prismaMock.$queryRaw.mockResolvedValueOnce([
        { geometry_wkt: 'POLYGON((0 0,0 1,1 1,0 0))' },
      ]);
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue({
          ok: true,
          status: 200,
          statusText: 'OK',
          text: vi
            .fn()
            .mockResolvedValue(
              JSON.stringify({ error: { message: 'Map sheet service error' } }),
            ),
        }),
      );

      await expect(service.getMapSheetsForExhibitA('REC123')).rejects.toThrow(
        /Map sheet service error/,
      );
    });

    it('falls back to first valid map sheet when overlap features are unavailable', () => {
      const result = (service as any).chooseBestMapSheet([
        { mapSheet: '82G.100', raw: {} },
        { mapSheet: '82G.101', raw: {} },
      ]);

      expect(result).toBe('82G.100');
    });

    it('uses AREA as overlap fallback when SHAPE_AREA is missing', () => {
      const result = (service as any).chooseBestMapSheet(
        [
          { mapSheet: '82G.200', raw: {} },
          { mapSheet: '82G.201', raw: {} },
        ],
        [{ attributes: { AREA: 15 } }, { attributes: { AREA: 30 } }],
      );

      expect(result).toBe('82G.201');
    });

    it('falls back to first valid map sheet when ranked overlaps are empty', () => {
      const result = (service as any).chooseBestMapSheet(
        [{ mapSheet: '82G.900', raw: {} }],
        [{ attributes: {} }],
      );

      expect(result).toBe('82G.900');
    });
  });

  describe('spatial submission helpers', () => {
    const makeKnownRequestError = (code: string, target?: unknown): Error => {
      const err = Object.assign(new Error('known request error'), {
        code,
        meta: target === undefined ? undefined : { target },
      });
      Object.setPrototypeOf(
        err,
        Prisma.PrismaClientKnownRequestError.prototype,
      );
      return err;
    };

    it('returns empty feature request elements when a submission snapshot has no rows', async () => {
      const tx = {
        $queryRaw: vi.fn().mockResolvedValue([]),
      };

      await expect(
        (service as any).buildFeatureRequestElements(tx, 'app-guid-1'),
      ).resolves.toEqual([]);
      expect(tx.$queryRaw).toHaveBeenCalledTimes(1);
    });

    it('builds polygon and linear feature request elements', async () => {
      const tx = {
        $queryRaw: vi.fn().mockResolvedValue([
          {
            section_id: 'A',
            purpose_code: 'N',
            map_feature_guid: 'guid-a',
            feature_record_guid: 'record-guid-a',
            feature_business_identifier: 'REC123 SEC A',
            recreation_resource_type: 'SIT',
            recreation_resource_type_description: 'Campsite',
            geometry_type_code: 'P',
            geometry_json: JSON.stringify({
              type: 'MultiPolygon',
              coordinates: [],
            }),
          },
          {
            section_id: 'B',
            purpose_code: 'A',
            map_feature_guid: 'guid-b',
            feature_record_guid: 'record-guid-b',
            feature_business_identifier: 'REC123 SEC B',
            recreation_resource_type: null,
            recreation_resource_type_description: null,
            geometry_type_code: 'L',
            geometry_json: JSON.stringify({
              type: 'MultiLineString',
              coordinates: [
                [
                  [0, 0],
                  [1, 1],
                ],
              ],
            }),
          },
        ]),
      };

      const result = await (service as any).buildFeatureRequestElements(
        tx,
        'app-guid-1',
      );
      expect(result).toHaveLength(2);
      expect(result[0]).toMatchObject({
        featureGeometryTypeCode: 'polygon',
        mapFeatureGuid: 'guid-a',
        mapFeatureTypeCode: 'SIT',
        featureName: 'Campsite',
        polygon: expect.objectContaining({
          type: 'MultiPolygon',
          crs: expect.any(Object),
        }),
      });
      expect(result[1]).toMatchObject({
        featureGeometryTypeCode: 'line',
        mapFeatureTypeCode: '',
        featureName: null,
        line: expect.objectContaining({
          type: 'LineString',
          crs: expect.any(Object),
        }),
      });
    });

    it('splits MultiLineString into one SNCSC linear element per line section', async () => {
      const tx = {
        $queryRaw: vi.fn().mockResolvedValue([
          {
            section_id: 'L1',
            purpose_code: 'A',
            map_feature_guid: 'guid-l1',
            feature_record_guid: 'record-guid-l1',
            feature_business_identifier: 'REC123 SEC L1',
            recreation_resource_type: 'RTE',
            geometry_type_code: 'L',
            geometry_json: JSON.stringify({
              type: 'MultiLineString',
              coordinates: [
                [
                  [0, 0],
                  [1, 1],
                ],
                [
                  [2, 2],
                  [3, 3],
                ],
              ],
            }),
          },
        ]),
      };

      const result = await (service as any).buildFeatureRequestElements(
        tx,
        'app-guid-1',
      );

      expect(result).toHaveLength(2);
      expect(result[0]).toMatchObject({
        featureGeometryTypeCode: 'line',
        mapFeatureGuid: 'guid-l1',
        line: expect.objectContaining({ type: 'LineString' }),
      });
      expect(result[1]).toMatchObject({
        featureGeometryTypeCode: 'line',
        line: expect.objectContaining({ type: 'LineString' }),
      });
      expect(result[1].mapFeatureGuid).not.toBe('guid-l1');
    });

    it('builds one SNCSC feature element per entry when section IDs repeat', async () => {
      const tx = {
        $queryRaw: vi.fn().mockResolvedValue([
          {
            section_id: 'L1',
            purpose_code: 'A',
            map_feature_guid: 'guid-l1-a',
            feature_record_guid: 'record-guid-l1-a',
            feature_business_identifier: 'REC123 SEC L1',
            recreation_resource_type: 'RTE',
            geometry_type_code: 'L',
            geometry_json: JSON.stringify({
              type: 'LineString',
              coordinates: [
                [0, 0],
                [1, 1],
              ],
            }),
          },
          {
            section_id: 'L1',
            purpose_code: 'N',
            map_feature_guid: 'guid-l1-b',
            feature_record_guid: 'record-guid-l1-b',
            feature_business_identifier: 'REC123 SEC L1',
            recreation_resource_type: 'RTE',
            geometry_type_code: 'L',
            geometry_json: JSON.stringify({
              type: 'LineString',
              coordinates: [
                [2, 2],
                [3, 3],
              ],
            }),
          },
        ]),
      };

      const result = await (service as any).buildFeatureRequestElements(
        tx,
        'app-guid-1',
      );

      expect(result).toHaveLength(2);
      expect(result[0]).toMatchObject({ mapFeatureGuid: 'guid-l1-a' });
      expect(result[1]).toMatchObject({ mapFeatureGuid: 'guid-l1-b' });
      expect(result[0]).toMatchObject({
        line: expect.objectContaining({ type: 'LineString' }),
      });
      expect(result[1]).toMatchObject({
        line: expect.objectContaining({ type: 'LineString' }),
      });
    });

    it('ensures mapFeatureGuid is unique even when stored rows reuse the same guid', async () => {
      const tx = {
        $queryRaw: vi.fn().mockResolvedValue([
          {
            section_id: 'S1',
            purpose_code: 'A',
            map_feature_guid: 'dup-guid',
            feature_record_guid: 'record-guid-s1',
            feature_business_identifier: 'REC123 SEC S1',
            recreation_resource_type: 'RTE',
            geometry_type_code: 'L',
            geometry_json: JSON.stringify({
              type: 'LineString',
              coordinates: [
                [0, 0],
                [1, 1],
              ],
            }),
          },
          {
            section_id: 'S2',
            purpose_code: 'A',
            map_feature_guid: 'dup-guid',
            feature_record_guid: 'record-guid-s2',
            feature_business_identifier: 'REC123 SEC S2',
            recreation_resource_type: 'RTE',
            geometry_type_code: 'L',
            geometry_json: JSON.stringify({
              type: 'LineString',
              coordinates: [
                [2, 2],
                [3, 3],
              ],
            }),
          },
        ]),
      };

      const result = await (service as any).buildFeatureRequestElements(
        tx,
        'app-guid-1',
      );

      expect(result).toHaveLength(2);
      expect(result[0]).toMatchObject({ mapFeatureGuid: 'dup-guid' });
      expect(result[1].mapFeatureGuid).not.toBe('dup-guid');
      expect(new Set(result.map((item) => item.mapFeatureGuid)).size).toBe(2);
    });

    it('dispatches SNCSC status request and stores returned guid', async () => {
      vi.spyOn(service as any, 'resolveOrgUnitClientInfo').mockResolvedValue({
        client_number: '00133887',
        client_name: 'District Manager',
      });
      vi.spyOn(service as any, 'buildFeatureRequestElements').mockResolvedValue(
        [
          {
            '@type': 'FeatureRequestResource',
            mapFeatureGuid: 'map-guid-1',
            featureRecordGuid: 'feature-guid-1',
            featureGeometryTypeCode: 'polygon',
            mapFeatureTypeCode: 'SIT',
            featureName: 'Campsite',
            sourceSectionId: 'A',
            polygon: { type: 'MultiPolygon', coordinates: [] },
          },
        ],
      );

      await (service as any).dispatchSncscStatusRequest(prismaMock, {
        application_guid: 'app-guid-1',
        submission_id: '1234567',
        tenure_id: 'REC123',
        org_unit_code: 'DND',
        status_request_type_code: 'RPO',
        purpose_code: 'N',
      });

      expect(
        sncscStatusRequestServiceMock.createStatusRequest,
      ).toHaveBeenCalledTimes(1);
      expect(
        sncscStatusRequestServiceMock.createStatusRequest,
      ).toHaveBeenCalledWith(
        expect.objectContaining({
          purposeCode: 'N',
          featureRequests: {
            '@type': 'FeatureRequestResources',
            elements: [
              expect.objectContaining({
                featureName: 'Campsite',
                featureBusinessIdentifier: 'REC123 SEC A',
                featurePurposeCode: 'N',
              }),
            ],
          },
        }),
      );
      expect(
        prismaMock.recreation_spatial_submission.update,
      ).toHaveBeenCalledWith({
        where: { application_guid: 'app-guid-1' },
        data: {
          status_request_guid: 'status-request-guid',
          updated_by: 'system',
        },
      });
    });

    it('dispatches SNCSC status request with feature business identifier for amend purpose', async () => {
      vi.spyOn(service as any, 'resolveOrgUnitClientInfo').mockResolvedValue({
        client_number: '00133887',
        client_name: 'District Manager',
      });
      vi.spyOn(service as any, 'buildFeatureRequestElements').mockResolvedValue(
        [
          {
            '@type': 'FeatureRequestResource',
            mapFeatureGuid: 'map-guid-1',
            featureRecordGuid: 'feature-guid-1',
            featureGeometryTypeCode: 'polygon',
            mapFeatureTypeCode: 'SIT',
            featureName: 'Campsite',
            sourceSectionId: 'A',
            polygon: { type: 'MultiPolygon', coordinates: [] },
          },
        ],
      );

      await (service as any).dispatchSncscStatusRequest(prismaMock, {
        application_guid: 'app-guid-1',
        submission_id: '1234567',
        tenure_id: 'REC123',
        org_unit_code: 'DND',
        status_request_type_code: 'RPO',
        purpose_code: 'A',
      });

      const payloadArg =
        sncscStatusRequestServiceMock.createStatusRequest.mock.calls[0]?.[0];
      const firstElement = payloadArg?.featureRequests?.elements?.[0];

      expect(firstElement).toMatchObject({
        featureBusinessIdentifier: 'REC123 SEC A',
        featurePurposeCode: 'A',
      });
    });

    it('dispatches SNCSC status request with per-feature purpose codes for mixed actions', async () => {
      vi.spyOn(service as any, 'resolveOrgUnitClientInfo').mockResolvedValue({
        client_number: '00133887',
        client_name: 'District Manager',
      });
      vi.spyOn(service as any, 'buildFeatureRequestElements').mockResolvedValue(
        [
          {
            '@type': 'FeatureRequestResource',
            mapFeatureGuid: 'map-guid-1',
            featureRecordGuid: 'feature-guid-1',
            featureGeometryTypeCode: 'line',
            mapFeatureTypeCode: 'RTR',
            featureName: 'Recreation trail reserve',
            sourceSectionId: '20566',
            sourcePurposeCode: 'N',
            line: { type: 'LineString', coordinates: [] },
          },
          {
            '@type': 'FeatureRequestResource',
            mapFeatureGuid: 'map-guid-2',
            featureRecordGuid: 'feature-guid-2',
            featureGeometryTypeCode: 'line',
            mapFeatureTypeCode: 'RTR',
            featureName: 'Recreation trail reserve',
            sourceSectionId: '12',
            sourcePurposeCode: 'R',
            line: { type: 'LineString', coordinates: [] },
          },
        ],
      );

      await (service as any).dispatchSncscStatusRequest(prismaMock, {
        application_guid: 'app-guid-1',
        submission_id: '1234567',
        tenure_id: 'REC123',
        org_unit_code: 'DND',
        status_request_type_code: 'RL',
        purpose_code: 'A',
      });

      const payloadArg =
        sncscStatusRequestServiceMock.createStatusRequest.mock.calls[0]?.[0];
      expect(payloadArg?.featureRequests?.elements).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            featureBusinessIdentifier: 'REC123 SEC 20566',
            featurePurposeCode: 'N',
          }),
          expect.objectContaining({
            featureBusinessIdentifier: 'REC123 SEC 12',
            featurePurposeCode: 'R',
          }),
        ]),
      );
    });

    it('logs warning when SNCSC returns no status request guid', async () => {
      vi.spyOn(service as any, 'resolveOrgUnitClientInfo').mockResolvedValue({
        client_number: '00133887',
        client_name: 'District Manager',
      });
      vi.spyOn(service as any, 'buildFeatureRequestElements').mockResolvedValue(
        [],
      );
      sncscStatusRequestServiceMock.createStatusRequest.mockResolvedValueOnce(
        null,
      );
      const warnSpy = vi
        .spyOn((service as any).logger, 'warn')
        .mockImplementation(() => undefined);

      await (service as any).dispatchSncscStatusRequest(prismaMock, {
        application_guid: 'app-guid-1',
        submission_id: '1234567',
        tenure_id: 'REC123',
        org_unit_code: 'DND',
        status_request_type_code: 'RPO',
        purpose_code: 'A',
      });

      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('did not include a status request guid'),
      );
      expect(
        prismaMock.recreation_spatial_submission.update,
      ).not.toHaveBeenCalled();
    });

    it('logs and rethrows when SNCSC request fails', async () => {
      vi.spyOn(service as any, 'resolveOrgUnitClientInfo').mockResolvedValue({
        client_number: '00133887',
        client_name: 'District Manager',
      });
      vi.spyOn(service as any, 'buildFeatureRequestElements').mockResolvedValue(
        [],
      );
      const dispatchError = new Error('SNCSC unavailable');
      sncscStatusRequestServiceMock.createStatusRequest.mockRejectedValueOnce(
        dispatchError,
      );
      const errorSpy = vi
        .spyOn((service as any).logger, 'error')
        .mockImplementation(() => undefined);

      await expect(
        (service as any).dispatchSncscStatusRequest(prismaMock, {
          application_guid: 'app-guid-1',
          submission_id: '1234567',
          tenure_id: 'REC123',
          org_unit_code: 'DND',
          status_request_type_code: 'RPO',
          purpose_code: 'A',
        }),
      ).rejects.toThrow('SNCSC unavailable');

      expect(errorSpy).toHaveBeenCalledWith(
        expect.stringContaining('SNCSC status request dispatch failed'),
        expect.any(String),
      );
    });

    it('creates a spatial submission when org unit code is provided', async () => {
      const tx = {
        natural_resource_org_unit: {
          findUnique: vi.fn(),
        },
        recreation_spatial_submission: {
          create: vi.fn().mockResolvedValue({
            application_guid: 'app-guid-1',
            submission_id: '1234567',
            tenure_id: 'REC123',
            org_unit_code: 'DND',
            status_request_type_code: 'RPO',
            purpose_code: 'N',
          }),
        },
      };

      const created = await (service as any).createSpatialSubmission(tx, {
        rec_resource_id: 'REC123',
        statusRequestTypeCode: 'RPO',
        purposeCode: 'N',
        recreationTypeCode: 'SIT',
        submittedBy: 'idir\\tester',
        orgUnitCode: ' DND ',
      });

      expect(created).toMatchObject({
        application_guid: 'app-guid-1',
        org_unit_code: 'DND',
      });
      expect(tx.recreation_spatial_submission.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            tenure_id: 'REC123',
            org_unit_code: 'DND',
            status_request_type_code: 'RPO',
            purpose_code: 'N',
          }),
        }),
      );
    });

    it('falls back to latest submission org unit code when natural unit is missing', async () => {
      const tx = {
        natural_resource_org_unit: {
          findUnique: vi.fn().mockResolvedValue(null),
        },
        recreation_spatial_submission: {
          findFirst: vi.fn().mockResolvedValue({ org_unit_code: 'DCC' }),
          create: vi.fn().mockResolvedValue({
            application_guid: 'app-guid-2',
            submission_id: '7654321',
            tenure_id: 'REC999',
            org_unit_code: 'DCC',
            status_request_type_code: 'RL',
            purpose_code: 'A',
          }),
        },
      };

      const created = await (service as any).createSpatialSubmission(tx, {
        rec_resource_id: 'REC999',
        statusRequestTypeCode: 'RL',
        purposeCode: 'A',
        recreationTypeCode: 'RTE',
        submittedBy: 'idir\\tester',
      });

      expect(created).toMatchObject({
        application_guid: 'app-guid-2',
        org_unit_code: 'DCC',
      });
      expect(tx.recreation_spatial_submission.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { tenure_id: 'REC999' },
        }),
      );
      expect(tx.recreation_spatial_submission.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            org_unit_code: 'DCC',
            purpose_code: 'A',
          }),
        }),
      );
    });

    it('returns null when org unit code cannot be resolved', async () => {
      const tx = {
        natural_resource_org_unit: {
          findUnique: vi.fn().mockResolvedValue(null),
        },
        recreation_spatial_submission: {
          findFirst: vi.fn().mockResolvedValue(null),
          create: vi.fn(),
        },
      };

      await expect(
        (service as any).createSpatialSubmission(tx, {
          rec_resource_id: 'REC-NO-ORG',
          statusRequestTypeCode: 'RPO',
          purposeCode: 'N',
        }),
      ).resolves.toBeNull();
      expect(tx.recreation_spatial_submission.create).not.toHaveBeenCalled();
    });

    it('returns null when recreation_spatial_submission.create is unavailable', async () => {
      const tx = {
        natural_resource_org_unit: {
          findUnique: vi.fn().mockResolvedValue({ org_unit_code: 'DND' }),
        },
        recreation_spatial_submission: {},
      };

      await expect(
        (service as any).createSpatialSubmission(tx, {
          rec_resource_id: 'REC123',
          statusRequestTypeCode: 'RPO',
          purposeCode: 'N',
        }),
      ).resolves.toBeNull();
    });

    it('validates SNCSC payload @type structure', () => {
      const validPayload = {
        '@type': 'StatusRequestResource',
        featureRequests: {
          '@type': 'FeatureRequestResources',
          elements: [{ '@type': 'FeatureRequestResource' }],
        },
      };

      expect(() =>
        (service as any).validateSncscPayloadTypes(validPayload),
      ).not.toThrow();

      expect(() =>
        (service as any).validateSncscPayloadTypes({
          featureRequests: validPayload.featureRequests,
        }),
      ).toThrow(/StatusRequestResource/);
    });

    it('throws when SNCSC payload misses featureRequests object', () => {
      expect(() =>
        (service as any).validateSncscPayloadTypes({
          '@type': 'StatusRequestResource',
        }),
      ).toThrow(/missing featureRequests/);
    });

    it('throws when SNCSC payload featureRequests @type is invalid', () => {
      expect(() =>
        (service as any).validateSncscPayloadTypes({
          '@type': 'StatusRequestResource',
          featureRequests: {
            '@type': 'WrongType',
            elements: [],
          },
        }),
      ).toThrow(/FeatureRequestResources/);
    });

    it('throws when SNCSC payload featureRequests.elements is not an array', () => {
      expect(() =>
        (service as any).validateSncscPayloadTypes({
          '@type': 'StatusRequestResource',
          featureRequests: {
            '@type': 'FeatureRequestResources',
            elements: 'bad',
          },
        }),
      ).toThrow(/must be an array/);
    });

    it('throws when SNCSC payload featureRequests.elements item misses @type', () => {
      expect(() =>
        (service as any).validateSncscPayloadTypes({
          '@type': 'StatusRequestResource',
          featureRequests: {
            '@type': 'FeatureRequestResources',
            elements: [{}],
          },
        }),
      ).toThrow(/FeatureRequestResource/);
    });

    it('classifies submission id conflict only for Prisma P2002 submission_id violations', () => {
      expect(
        (service as any).isSubmissionIdUniqueConflict(new Error('x')),
      ).toBe(false);
      expect(
        (service as any).isSubmissionIdUniqueConflict(
          makeKnownRequestError('P2025', ['submission_id']),
        ),
      ).toBe(false);
      expect(
        (service as any).isSubmissionIdUniqueConflict(
          makeKnownRequestError('P2002', ['another_field']),
        ),
      ).toBe(false);
      expect(
        (service as any).isSubmissionIdUniqueConflict(
          makeKnownRequestError('P2002', ['submission_id']),
        ),
      ).toBe(true);
      expect(
        (service as any).isSubmissionIdUniqueConflict(
          makeKnownRequestError(
            'P2002',
            'recreation_spatial_submission.submission_id',
          ),
        ),
      ).toBe(true);
    });

    it('retries submission create on unique submission_id conflicts and succeeds', async () => {
      const tx = {
        recreation_spatial_submission: {
          create: vi
            .fn()
            .mockRejectedValueOnce(
              makeKnownRequestError('P2002', ['submission_id']),
            )
            .mockResolvedValueOnce({
              application_guid: 'app-guid-3',
              submission_id: '1234567',
              tenure_id: 'REC123',
              org_unit_code: 'DND',
              status_request_type_code: 'RPO',
              purpose_code: 'A',
            }),
        },
      };

      const result = await (service as any).createSpatialSubmission(tx, {
        rec_resource_id: 'REC123',
        statusRequestTypeCode: 'RPO',
        purposeCode: 'A',
        orgUnitCode: 'DND',
      });

      expect(result?.application_guid).toBe('app-guid-3');
      expect(tx.recreation_spatial_submission.create).toHaveBeenCalledTimes(2);
    });

    it('throws ConflictException when unique submission id cannot be generated after max retries', async () => {
      const tx = {
        recreation_spatial_submission: {
          create: vi
            .fn()
            .mockRejectedValue(
              makeKnownRequestError('P2002', ['submission_id']),
            ),
        },
      };

      await expect(
        (service as any).createSpatialSubmission(tx, {
          rec_resource_id: 'REC123',
          statusRequestTypeCode: 'RPO',
          purposeCode: 'A',
          orgUnitCode: 'DND',
        }),
      ).rejects.toThrow(ConflictException);
      expect(tx.recreation_spatial_submission.create).toHaveBeenCalledTimes(10);
    });

    it('returns null purpose code for no update work and derives RL for linear entries', () => {
      expect((service as any).derivePurposeCodeForUpdate(0, 0, 0)).toBeNull();
      expect(
        (service as any).deriveStatusRequestTypeCode([
          { sectionId: 'L1', geometryTypeCode: 'L', geometry: {} },
        ]),
      ).toBe('RL');
    });

    it('keeps non-linear geometry untouched for SNCSC line conversion fallback', () => {
      const geometry = { type: 'Polygon', coordinates: [] };
      expect((service as any).toSncscLineStrings(geometry)).toEqual([geometry]);
    });

    it('normalizes line source metrics when FEATURE_LE appears to be metres', () => {
      const normalized = (service as any).flattenFeatures([
        {
          section_id: 'Linear-1',
          geometry: {
            type: 'LineString',
            coordinates: [
              [0, 0],
              [1, 1],
            ],
          },
          properties: {
            FEATURE_LE: 2000,
          },
        },
      ]);

      expect(normalized[0]?.sourceMetrics?.lengthKm).toBe(2);
    });

    it('ignores FEATURE__1 when it mirrors line length in metres', () => {
      const normalized = (service as any).flattenFeatures([
        {
          section_id: 'Linear-2',
          geometry: {
            type: 'LineString',
            coordinates: [
              [0, 0],
              [1, 1],
            ],
          },
          properties: {
            FEATURE_LE: 1.3695,
            FEATURE__1: 1369.5332,
          },
        },
      ]);

      expect(normalized[0]?.sourceMetrics?.rightOfWayM).toBeNull();
    });

    it('returns empty normalized entries when geometry type is missing', () => {
      const normalized = (service as any).flattenFeatures([
        {
          section_id: 'NoType',
          geometry: { coordinates: [] },
        },
      ]);

      expect(normalized).toEqual([]);
    });
  });

  describe('updateMapFeaturesFromValidatedFile', () => {
    it('amends an existing linear feature from newFeatures when section already exists', async () => {
      prismaMock.$queryRaw
        .mockResolvedValueOnce([{ rmf_skey: 77 }])
        .mockResolvedValueOnce([{ max_rmf_skey: 10 }])
        .mockResolvedValueOnce([{ next: 3 }])
        .mockResolvedValueOnce([{ rmf_skey: 77, amendment_id: 2 }]);
      prismaMock.recreation_map_feature.findMany.mockResolvedValueOnce([
        { section_id: 'Trail-1', rmf_skey: 77, amendment_id: 2 },
      ]);
      prismaMock.natural_resource_org_unit.findUnique.mockResolvedValueOnce({
        org_unit_code: 'DND',
      });
      prismaMock.recreation_spatial_submission = {
        create: vi.fn().mockResolvedValue({
          application_guid: 'app-guid-1',
          submission_id: '7654321',
          tenure_id: 'REC123',
          org_unit_code: 'DND',
          status_request_type_code: 'RL',
          purpose_code: 'A',
        }),
        update: vi.fn(),
      };

      vi.spyOn(service as any, 'resolveOrgUnitClientInfo').mockResolvedValue({
        client_number: '00133887',
        client_name: 'District Manager',
      });
      vi.spyOn(service as any, 'buildFeatureRequestElements').mockResolvedValue(
        [],
      );

      const insertSpy = vi.spyOn(service as any, 'insertMapFeatureAndGeometry');

      await service.updateMapFeaturesFromValidatedFile('REC123', {
        newFeatures: [
          {
            section_id: 'Trail-1',
            geometry: {
              type: 'LineString',
              coordinates: [
                [0, 0],
                [1, 1],
              ],
            },
          },
        ],
      } as any);

      expect(insertSpy).toHaveBeenCalledTimes(1);
      expect(insertSpy.mock.calls[0]?.[0]).toBe(11);
      expect(insertSpy.mock.calls[0]?.[9]).toMatchObject({
        amendmentId: 3,
        currentInd: 'N',
      });
    });

    it('throws BadRequestException when a new geometry is identical to a retired geometry with a different section id', async () => {
      await expect(
        service.updateMapFeaturesFromValidatedFile('REC123', {
          newFeatures: [
            {
              section_id: 'The Johnson',
              geometry: {
                type: 'LineString',
                coordinates: [
                  [10, 10],
                  [11, 11],
                  [12, 12],
                  [13, 13],
                ],
              },
            },
          ],
          retiredFeatures: [
            {
              section_id: '13',
              geometry: {
                type: 'LineString',
                coordinates: [
                  [10, 10],
                  [11, 11],
                  [12, 12],
                  [13, 13],
                ],
              },
            },
          ],
        } as any),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('updateGeospatialData', () => {
    it('executes updateMapFeaturesFromValidatedFile successfully', async () => {
      prismaMock.$queryRaw
        .mockResolvedValueOnce([{ rmf_skey: 1 }])
        .mockResolvedValueOnce([{ max_rmf_skey: 10 }])
        .mockResolvedValueOnce([{ next: 2 }])
        .mockResolvedValueOnce([{ rmf_skey: 5, amendment_id: 1 }])
        .mockResolvedValueOnce([{ rmf_skey: 6, amendment_id: 1 }])
        .mockResolvedValueOnce([{ rmf_skey: 7, amendment_id: 1 }]);

      const payload: any = {
        newFeatures: [
          {
            geometry: {
              type: 'Polygon',
              coordinates: [
                [
                  [2, 2],
                  [2, 3],
                  [3, 3],
                  [2, 2],
                ],
              ],
            },
            section_id: 'NewSec',
          },
        ],
        amendedFeatures: [
          {
            geometry: {
              type: 'LineString',
              coordinates: [
                [0, 0],
                [1, 1],
              ],
            },
            section_id: 'AmendedSec',
          },
        ],
        retiredFeatures: [
          {
            geometry: {
              type: 'Polygon',
              coordinates: [
                [
                  [0, 0],
                  [0, 1],
                  [1, 1],
                  [0, 0],
                ],
              ],
            },
            section_id: 'RetiredSec',
          },
        ],
        recreation_type_code: 'SIT',
        submitted_by: 'user@gov.bc.ca',
      };

      await expect(
        service.updateGeospatialData('REC123', payload),
      ).resolves.toBeUndefined();
    });

    it('throws when only part of the UTM triplet is provided', async () => {
      vi.spyOn(
        service as any,
        'updateMapFeaturesFromValidatedFile',
      ).mockResolvedValue(undefined);

      await expect(
        service.updateGeospatialData('REC123', {
          utm_zone: 10,
          utm_easting: 500000,
        } as any),
      ).rejects.toThrow(
        /utm_zone, utm_easting, and utm_northing must be provided together/i,
      );
    });

    it('validates and upserts site point when complete UTM payload is provided', async () => {
      vi.spyOn(
        service as any,
        'updateMapFeaturesFromValidatedFile',
      ).mockResolvedValue(undefined);
      const validateSpy = vi
        .spyOn(service as any, 'validateUtmAgainstFeatureGeometry')
        .mockResolvedValue(undefined);
      const upsertSpy = vi
        .spyOn(service as any, 'upsertSitePointFromUtm')
        .mockResolvedValue(undefined);

      await expect(
        service.updateGeospatialData('REC123', {
          utm_zone: 10,
          utm_easting: 500000,
          utm_northing: 5450000,
        } as any),
      ).resolves.toBeUndefined();

      expect(validateSpy).toHaveBeenCalledWith('REC123', 10, 500000, 5450000);
      expect(upsertSpy).toHaveBeenCalledWith('REC123', 10, 500000, 5450000);
    });

    it('updates right_of_way when payload includes right_of_way_m', async () => {
      vi.spyOn(
        service as any,
        'updateMapFeaturesFromValidatedFile',
      ).mockResolvedValue(undefined);
      prismaMock.$executeRaw.mockResolvedValueOnce(1);

      await expect(
        service.updateGeospatialData('REC123', {
          right_of_way_m: 12,
        } as any),
      ).resolves.toBeUndefined();

      expect(prismaMock.$executeRaw).toHaveBeenCalledTimes(1);
    });
  });

  describe('normalizeGeometryEntry (via createMapFeaturesFromValidatedFile)', () => {
    it('throws BadRequestException for unsupported geometry types', async () => {
      const payload: any = {
        features: [
          {
            geometry: { type: 'UnsupportedType', coordinates: [] },
            section_id: 'BadSec',
          },
        ],
      };

      prismaMock.recreation_resource.findUnique.mockResolvedValueOnce({
        rec_resource_id: 'REC123',
      });
      prismaMock.recreation_map_feature.findFirst.mockResolvedValueOnce(null);

      await expect(
        service.createMapFeaturesFromValidatedFile('REC123', payload),
      ).rejects.toThrow(BadRequestException);
    });

    it('successfully normalizes MultiPolygon and MultiLineString geometries', async () => {
      const payload: any = {
        features: [
          {
            geometry: { type: 'MultiPolygon', coordinates: [] },
            section_id: 'MP',
          },
          {
            geometry: { type: 'MultiLineString', coordinates: [] },
            section_id: 'MLS',
          },
        ],
        recreation_type_code: 'SIT',
        submitted_by: 'user@gov.bc.ca',
      };

      prismaMock.recreation_resource.findUnique.mockResolvedValueOnce(null);
      prismaMock.recreation_map_feature.findFirst.mockResolvedValueOnce(null);
      prismaMock.$queryRawUnsafe.mockResolvedValueOnce([{ max_rmf_skey: 0 }]);

      await expect(
        service.createMapFeaturesFromValidatedFile('REC123', payload),
      ).resolves.toBeUndefined();

      expect(prismaMock.recreation_resource.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            rec_resource_id: 'REC123',
            rec_status_code: 'PE',
          }),
        }),
      );
    });

    it('persists MultiLineString upload as one LineString feature per section', async () => {
      prismaMock.recreation_resource.findUnique.mockResolvedValueOnce({
        rec_resource_id: 'REC123',
      });
      prismaMock.recreation_map_feature.findFirst.mockResolvedValueOnce(null);
      prismaMock.$queryRawUnsafe.mockResolvedValueOnce([{ max_rmf_skey: 0 }]);
      prismaMock.natural_resource_org_unit.findUnique.mockResolvedValueOnce({
        org_unit_code: 'DND',
      });
      prismaMock.recreation_spatial_submission = {
        create: vi.fn().mockResolvedValue({
          application_guid: 'app-guid-1',
          submission_id: '1234567',
          tenure_id: 'REC123',
          org_unit_code: 'DND',
          status_request_type_code: 'RL',
          purpose_code: 'N',
        }),
        update: vi.fn(),
      };
      vi.spyOn(service as any, 'resolveOrgUnitClientInfo').mockResolvedValue({
        client_number: '00133887',
        client_name: 'District Manager',
      });
      vi.spyOn(service as any, 'buildFeatureRequestElements').mockResolvedValue(
        [],
      );

      const insertSpy = vi.spyOn(service as any, 'insertMapFeatureAndGeometry');

      const payload: any = {
        features: [
          {
            section_id: 'Trail-A',
            geometry: {
              type: 'MultiLineString',
              coordinates: [
                [
                  [0, 0],
                  [1, 1],
                ],
                [
                  [2, 2],
                  [3, 3],
                ],
              ],
            },
          },
        ],
      };

      await service.createMapFeaturesFromValidatedFile('REC123', payload);

      expect(insertSpy).toHaveBeenCalledTimes(2);
      expect(insertSpy.mock.calls[0]?.[2]).toBe('Trail-A-1');
      expect(insertSpy.mock.calls[0]?.[6]).toMatchObject({
        type: 'LineString',
        coordinates: [
          [0, 0],
          [1, 1],
        ],
      });
      expect(insertSpy.mock.calls[1]?.[2]).toBe('Trail-A-2');
      expect(insertSpy.mock.calls[1]?.[6]).toMatchObject({
        type: 'LineString',
        coordinates: [
          [2, 2],
          [3, 3],
        ],
      });
    });
  });

  describe('createMapFeaturesFromValidatedFile', () => {
    it('throws BadRequestException when features array is empty or missing', async () => {
      await expect(
        service.createMapFeaturesFromValidatedFile('REC123', {
          features: [],
        } as any),
      ).rejects.toThrow(BadRequestException);
    });

    it('creates resource if it does not exist, seeds natural unit, and inserts features', async () => {
      prismaMock.recreation_resource.findUnique.mockResolvedValueOnce(null);
      prismaMock.natural_resource_org_unit.findUnique.mockResolvedValueOnce(
        null,
      );
      prismaMock.natural_resource_org_unit.findFirst.mockResolvedValueOnce({
        org_unit_no: 1,
        org_unit_code: 'DCC',
        org_unit_name: 'Chilliwack',
        location_code: 'LOC',
        org_level_code: 'DIST',
        office_name_code: 'OFF',
        region_no: 1,
        region_code: 'REG',
        district_no: 1,
        district_code: 'DCC',
        effective_date: new Date(),
        expiry_date: null,
      });
      prismaMock.recreation_map_feature.findFirst.mockResolvedValueOnce(null);
      prismaMock.$queryRawUnsafe.mockResolvedValueOnce([{ max_rmf_skey: 5 }]);

      const payload: any = {
        features: [
          {
            geometry: {
              type: 'Polygon',
              coordinates: [
                [
                  [0, 0],
                  [0, 1],
                  [1, 1],
                  [0, 0],
                ],
              ],
            },
          },
        ],
        recreation_district_code: 'RDCC',
        natural_resource_district_code: 'DCC',
        rec_resource_name: 'Test Trail',
        submitted_by: 'tester',
      };

      await expect(
        service.createMapFeaturesFromValidatedFile('REC123', payload),
      ).resolves.toBeUndefined();
    });

    it('updates existing resource patch fields and skips natural unit seed if already present', async () => {
      prismaMock.recreation_resource.findUnique.mockResolvedValueOnce({
        rec_resource_id: 'REC123',
        district_code: null,
        name: 'Old Name',
      });
      prismaMock.natural_resource_org_unit.findUnique.mockResolvedValueOnce({
        rec_resource_id: 'REC123',
      });
      prismaMock.recreation_map_feature.findFirst.mockResolvedValueOnce(null);
      prismaMock.$queryRawUnsafe.mockResolvedValueOnce([{ max_rmf_skey: 0 }]);

      const payload: any = {
        features: [
          {
            geometry: {
              type: 'LineString',
              coordinates: [
                [0, 0],
                [1, 1],
              ],
            },
            section_id: 'LineSec',
          },
        ],
        recreation_district_code: 'RDCC',
        natural_resource_district_code: 'DCC',
        rec_resource_name: 'New Name',
      };

      await expect(
        service.createMapFeaturesFromValidatedFile('REC123', payload),
      ).resolves.toBeUndefined();
    });

    it('throws ConflictException if map features already exist for the resource', async () => {
      prismaMock.recreation_resource.findUnique.mockResolvedValueOnce({
        rec_resource_id: 'REC123',
      });
      prismaMock.recreation_map_feature.findFirst.mockResolvedValueOnce({
        rmf_skey: 1,
      });

      const payload: any = {
        features: [
          {
            geometry: {
              type: 'Polygon',
              coordinates: [
                [
                  [0, 0],
                  [0, 1],
                  [1, 1],
                  [0, 0],
                ],
              ],
            },
          },
        ],
      };

      await expect(
        service.createMapFeaturesFromValidatedFile('REC123', payload),
      ).rejects.toThrow(ConflictException);
    });

    it('logs warning when natural resource district template is not found', async () => {
      prismaMock.recreation_resource.findUnique.mockResolvedValueOnce({
        rec_resource_id: 'REC123',
      });
      prismaMock.natural_resource_org_unit.findUnique.mockResolvedValueOnce(
        null,
      );
      prismaMock.natural_resource_org_unit.findFirst.mockResolvedValueOnce(
        null,
      );
      prismaMock.recreation_map_feature.findFirst.mockResolvedValueOnce(null);
      prismaMock.$queryRawUnsafe.mockResolvedValueOnce([{ max_rmf_skey: 0 }]);

      const payload: any = {
        features: [
          {
            geometry: {
              type: 'Polygon',
              coordinates: [
                [
                  [0, 0],
                  [0, 1],
                  [1, 1],
                  [0, 0],
                ],
              ],
            },
          },
        ],
        natural_resource_district_code: 'UNKNOWN',
      };

      await expect(
        service.createMapFeaturesFromValidatedFile('REC123', payload),
      ).resolves.toBeUndefined();
    });

    it('throws BadRequestException when no supported geometries remain after normalization', async () => {
      prismaMock.recreation_resource.findUnique.mockResolvedValueOnce({
        rec_resource_id: 'REC123',
      });
      prismaMock.recreation_map_feature.findFirst.mockResolvedValueOnce(null);

      await expect(
        service.createMapFeaturesFromValidatedFile('REC123', {
          features: [
            {
              section_id: 'NoType',
              geometry: { coordinates: [] } as any,
            },
          ],
        } as any),
      ).rejects.toThrow(/No supported geometries were found/);
    });
  });

  describe('updateMapFeaturesFromValidatedFile (missing feature handling)', () => {
    it('treats amended features as new inserts when no active map features exist', async () => {
      prismaMock.$queryRaw
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([{ max_rmf_skey: 41 }])
        .mockResolvedValueOnce([{ next: 0 }])
        .mockResolvedValueOnce([]);

      const insertSpy = vi.spyOn(service as any, 'insertMapFeatureAndGeometry');

      await expect(
        service.updateGeospatialData('REC123', {
          newFeatures: [],
          amendedFeatures: [
            {
              section_id: 'Trail-Amended',
              geometry: {
                type: 'LineString',
                coordinates: [
                  [0, 0],
                  [1, 1],
                ],
              },
            },
          ],
          retiredFeatures: [],
          submitted_by: 'idir\\tester',
        } as any),
      ).resolves.toBeUndefined();

      expect(insertSpy).toHaveBeenCalledTimes(1);
      expect(insertSpy.mock.calls[0]?.[0]).toBe(42);
      expect(insertSpy.mock.calls[0]?.[1]).toBe('REC123');
    });

    it('throws when amending or retiring a non-existent feature', async () => {
      prismaMock.$queryRaw
        .mockResolvedValueOnce([{ rmf_skey: 1 }])
        .mockResolvedValueOnce([{ max_rmf_skey: 41 }])
        .mockResolvedValueOnce([{ next: 2 }])
        .mockResolvedValueOnce([]);

      const payload: any = {
        amendedFeatures: [
          {
            geometry: {
              type: 'Polygon',
              coordinates: [
                [
                  [0, 0],
                  [0, 1],
                  [1, 1],
                  [0, 0],
                ],
              ],
            },
            section_id: 'MissingAmended',
          },
        ],
        retiredFeatures: [
          {
            geometry: {
              type: 'Polygon',
              coordinates: [
                [
                  [0, 0],
                  [0, 1],
                  [1, 1],
                  [0, 0],
                ],
              ],
            },
            section_id: 'MissingRetired',
          },
        ],
      };

      await expect(
        service.updateGeospatialData('REC123', payload),
      ).rejects.toThrow(BadRequestException);
    });

    it('logs error for missing amended/retired linear features and retires existing linear rows', async () => {
      prismaMock.$queryRaw
        .mockResolvedValueOnce([{ rmf_skey: 10 }])
        .mockResolvedValueOnce([{ max_rmf_skey: 200 }])
        .mockResolvedValueOnce([{ next: 2 }])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([{ rmf_skey: 77, amendment_id: 1 }]);
      prismaMock.natural_resource_org_unit.findUnique.mockResolvedValueOnce({
        org_unit_code: 'DND',
      });
      prismaMock.recreation_spatial_submission = {
        create: vi.fn().mockResolvedValue({
          application_guid: 'app-guid-1',
          submission_id: '9999999',
          tenure_id: 'REC123',
          org_unit_code: 'DND',
          status_request_type_code: 'RL',
          purpose_code: 'A',
        }),
        update: vi.fn(),
      };
      vi.spyOn(service as any, 'resolveOrgUnitClientInfo').mockResolvedValue({
        client_number: '00133887',
        client_name: 'District Manager',
      });
      vi.spyOn(service as any, 'buildFeatureRequestElements').mockResolvedValue(
        [],
      );

      const insertSpy = vi.spyOn(service as any, 'insertMapFeatureAndGeometry');

      await expect(
        service.updateGeospatialData('REC123', {
          amendedFeatures: [
            {
              section_id: 'MissingLineAmended',
              geometry: {
                type: 'LineString',
                coordinates: [
                  [0, 0],
                  [1, 1],
                ],
              },
            },
          ],
          retiredFeatures: [
            {
              section_id: 'ExistingLineRetired',
              geometry: {
                type: 'LineString',
                coordinates: [
                  [2, 2],
                  [3, 3],
                ],
              },
            },
          ],
          submitted_by: 'idir\\tester',
          recreation_type_code: 'RTE',
        } as any),
      ).rejects.toThrow(BadRequestException);

      expect(insertSpy).not.toHaveBeenCalled();
    });
  });

  describe('upsertSitePointFromUtm', () => {
    it('executes upsert site point raw query successfully', async () => {
      prismaMock.$executeRaw.mockResolvedValueOnce(1);
      await expect(
        service.upsertSitePointFromUtm('REC123', 10, 500000, 5450000),
      ).resolves.toBeUndefined();
    });
  });

  describe('validateUtmAgainstFeatureGeometry (private via method execution / mocking)', () => {
    it('skips validation when feature count is 0', async () => {
      prismaMock.$queryRaw.mockResolvedValueOnce([
        { feature_count: BigInt(0), passes_check: null },
      ]);
      // Trigger via private method access using any cast
      await expect(
        (service as any).validateUtmAgainstFeatureGeometry(
          'REC123',
          10,
          500000,
          5450000,
        ),
      ).resolves.toBeUndefined();
    });

    it('throws BadRequestException when UTM check fails passes_check', async () => {
      prismaMock.$queryRaw.mockResolvedValueOnce([
        { feature_count: BigInt(1), passes_check: false },
      ]);
      await expect(
        (service as any).validateUtmAgainstFeatureGeometry(
          'REC123',
          10,
          500000,
          5450000,
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('passes successfully when UTM check passes', async () => {
      prismaMock.$queryRaw.mockResolvedValueOnce([
        { feature_count: BigInt(1), passes_check: true },
      ]);
      await expect(
        (service as any).validateUtmAgainstFeatureGeometry(
          'REC123',
          10,
          500000,
          5450000,
        ),
      ).resolves.toBeUndefined();
    });
  });
});
