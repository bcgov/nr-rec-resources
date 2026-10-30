import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { BadRequestException, ConflictException } from '@nestjs/common';
import { GeospatialService } from '@/recreation-resources/geospatial/geospatial.service';
import { PrismaService } from '@/prisma.service';
import { SncscStatusRequestService } from '@/sncsc/sncsc-status-request.service';

describe('GeospatialService', () => {
  let service: GeospatialService;
  let prismaMock: any;
  let sncscStatusRequestServiceMock: any;

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
    };

    sncscStatusRequestServiceMock = {
      createStatusRequest: vi.fn().mockResolvedValue('status-request-guid'),
    };

    process.env.FOREST_CLIENT_API_URL = 'https://forest-client-api.example.ca';
    process.env.FOREST_CLIENT_API_KEY = 'test-api-key';

    service = new GeospatialService(
      prismaMock as unknown as PrismaService,
      sncscStatusRequestServiceMock as unknown as SncscStatusRequestService,
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

      prismaMock.recreation_map_feature.findMany.mockResolvedValueOnce([
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
  });

  describe('spatial submission helpers', () => {
    it('returns empty feature request elements when there are no entries', async () => {
      const tx = {
        $queryRaw: vi.fn(),
      };

      await expect(
        (service as any).buildFeatureRequestElements(tx, 'REC123', []),
      ).resolves.toEqual([]);
      expect(tx.$queryRaw).not.toHaveBeenCalled();
    });

    it('builds polygon and linear feature request elements', async () => {
      const tx = {
        $queryRaw: vi.fn().mockResolvedValue([
          {
            section_id: 'A',
            recreation_map_feature_guid: 'guid-a',
            recreation_resource_type: 'SIT',
            geometry_type_code: 'P',
            geometry_json: JSON.stringify({
              type: 'MultiPolygon',
              coordinates: [],
            }),
          },
        ]),
      };

      const entries = [
        {
          sectionId: 'A',
          geometryTypeCode: 'P',
          geometry: { type: 'MultiPolygon', coordinates: [] },
        },
        {
          sectionId: 'B',
          geometryTypeCode: 'L',
          geometry: { type: 'MultiLineString', coordinates: [] },
        },
      ];

      const result = await (service as any).buildFeatureRequestElements(
        tx,
        'REC123',
        entries,
      );

      expect(result).toHaveLength(2);
      expect(result[0]).toMatchObject({
        featureGeometryTypeCode: 'polygon',
        mapFeatureGuid: 'guid-a',
        mapFeatureTypeCode: 'SIT',
        polygon: expect.objectContaining({
          type: 'MultiPolygon',
          crs: expect.any(Object),
        }),
      });
      expect(result[1]).toMatchObject({
        featureGeometryTypeCode: 'linear',
        mapFeatureTypeCode: '',
        linear: expect.objectContaining({
          type: 'MultiLineString',
          crs: expect.any(Object),
        }),
      });
    });

    it('dispatches SNCSC status request and stores returned guid', async () => {
      const tx = {
        recreation_spatial_submission: {
          update: vi.fn(),
        },
      };
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
            polygon: { type: 'MultiPolygon', coordinates: [] },
          },
        ],
      );

      await (service as any).dispatchSncscStatusRequest(
        tx,
        {
          application_guid: 'app-guid-1',
          submission_id: '1234567',
          tenure_id: 'REC123',
          org_unit_code: 'DND',
          status_request_type_code: 'RPO',
          purpose_code: 'N',
        },
        [{ sectionId: 'A', geometryTypeCode: 'P', geometry: {} }],
      );

      expect(
        sncscStatusRequestServiceMock.createStatusRequest,
      ).toHaveBeenCalledTimes(1);
      expect(tx.recreation_spatial_submission.update).toHaveBeenCalledWith({
        where: { application_guid: 'app-guid-1' },
        data: {
          status_request_guid: 'status-request-guid',
          updated_by: 'system',
        },
      });
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
  });

  describe('updateGeospatialData', () => {
    it('executes updateMapFeaturesFromValidatedFile successfully', async () => {
      prismaMock.$queryRawUnsafe
        .mockResolvedValueOnce([{ max_rmf_skey: 10 }]) // For new features max_rmf_skey query
        .mockResolvedValueOnce([{ rmf_skey: 1, amendment_id: 1 }]) // For amended features rmf lookup
        .mockResolvedValueOnce([{ rmf_skey: 2, amendment_id: 1 }]); // For retired features rmf lookup

      const payload: any = {
        newFeatures: [
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
  });

  describe('updateMapFeaturesFromValidatedFile (missing feature handling)', () => {
    it('logs error when amending or retiring a non-existent feature rmf_skey', async () => {
      prismaMock.$queryRawUnsafe.mockResolvedValueOnce([]); // empty rmfDataQuery result for amendment
      prismaMock.$queryRawUnsafe.mockResolvedValueOnce([]); // empty rmfDataQuery result for retirement

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
      ).resolves.toBeUndefined();
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
