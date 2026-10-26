import { AppConfigService } from '@/app-config/app-config.service';
import { ExhibitAService } from '@/exhibit-a/exhibit-a.service';
import {
  ExhibitAPageOrientation,
  ExhibitAPageSize,
} from '@/exhibit-a/dto/generate-exhibit-a.dto';
import { BadGatewayException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/prisma.service';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const MINIMAL_JPEG = Buffer.from([
  0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01, 0x01,
  0x00, 0x00, 0x01, 0x00, 0x01, 0x00, 0x00, 0xff, 0xc0, 0x00, 0x11, 0x08, 0x00,
  0x10, 0x00, 0x10, 0x03, 0x01, 0x22, 0x00, 0x02, 0x11, 0x01, 0x03, 0x11, 0x01,
  0xff, 0xd9,
]);

describe('ExhibitAService', () => {
  let service: ExhibitAService;
  let prisma: {
    $queryRaw: ReturnType<typeof vi.fn>;
    $executeRaw: ReturnType<typeof vi.fn>;
  };
  let s3: {
    uploadFile: ReturnType<typeof vi.fn>;
    getSignedUrl: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    prisma = {
      $queryRaw: vi.fn(),
      $executeRaw: vi.fn().mockResolvedValue(1),
    };

    const config = {
      ftaMapService:
        'http://maps.gov.bc.ca/arcgis/rest/services/Utilities/PrintingTools/GPServer/Export%20Web%20Map%20Task/execute',
      ftaArcGisServersTemplate:
        'http://maps.gov.bc.ca/arcgis/rest/services/fta/%d/MapServer',
    };

    s3 = {
      uploadFile: vi.fn().mockResolvedValue('REC0001/exhibit-a-123.pdf'),
      getSignedUrl: vi
        .fn()
        .mockResolvedValue('https://example.com/s3/exhibit-a-123.pdf'),
    };

    service = new ExhibitAService(
      prisma as unknown as PrismaService,
      config as unknown as AppConfigService,
      s3 as never,
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('generates pdf from ArcGIS execute response URL', async () => {
    prisma.$queryRaw
      .mockResolvedValueOnce([
        {
          submission_id: 'S1234567',
          application_guid: 'guid-1',
          tenure_id: 'REC0001',
          title: 'Sample Resource',
          forest_region: 'R01',
          forest_district: 'D01',
          district_name: 'District',
          mgt_unit_type: 'REC',
          mgt_unit_number: 'REC0001',
          drawn_by: 'tester',
          submission_date: new Date('2026-10-19T00:00:00.000Z'),
          adjudication_comment: null,
        },
      ])
      .mockResolvedValueOnce([
        {
          section_id: '1',
          geojson: JSON.stringify({
            type: 'Polygon',
            coordinates: [
              [
                [-123.1, 49.2],
                [-123.0, 49.2],
                [-123.0, 49.3],
                [-123.1, 49.3],
                [-123.1, 49.2],
              ],
            ],
          }),
          label_geojson: JSON.stringify({
            type: 'Point',
            coordinates: [-123.05, 49.25],
          }),
        },
      ]);

    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({ layers: [{ id: 0 }, { id: 2 }, { id: 5 }] }),
          { status: 200 },
        ),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            results: [{ value: { url: 'https://example.com/map.jpg' } }],
          }),
          { status: 200 },
        ),
      )
      .mockResolvedValueOnce(
        new Response(MINIMAL_JPEG, {
          status: 200,
          headers: { 'Content-Type': 'image/jpeg' },
        }),
      );

    const result = await service.generate('S1234567', {
      pageSize: ExhibitAPageSize.B,
      pageOrientation: ExhibitAPageOrientation.Landscape,
      scale: 30000,
    });

    expect(String(fetchMock.mock.calls[0]?.[0])).toContain(
      'http://maps.gov.bc.ca/arcgis/rest/services/fta/',
    );

    const exportCallInit = fetchMock.mock.calls[1]?.[1];
    const params = new URLSearchParams(String(exportCallInit?.body ?? ''));
    const webMapJson = JSON.parse(params.get('Web_Map_as_JSON') ?? '{}') as {
      operationalLayers?: Array<{ id?: string; visibleLayers?: number[] }>;
    };
    const ftaLayer = webMapJson.operationalLayers?.find(
      (layer) => layer.id === 'fta-mapserver',
    );
    expect(ftaLayer?.visibleLayers).toEqual([0, 2, 5]);

    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(result.mapImageUrl).toBe('https://example.com/map.jpg');
    expect(result.pageSize).toBe(ExhibitAPageSize.B);
    expect(result.pageOrientation).toBe(ExhibitAPageOrientation.Landscape);
    expect(result.scale).toBe(30000);
    expect(result.pdfUrl).toBe('https://example.com/s3/exhibit-a-123.pdf');
    expect(result.pdfBuffer).toBeInstanceOf(Buffer);
    expect(result.pdfBuffer?.subarray(0, 4).toString('ascii')).toBe('%PDF');
  });

  it('accepts ArcGIS execute responses with object-shaped results', async () => {
    prisma.$queryRaw
      .mockResolvedValueOnce([
        {
          submission_id: 'S1234567',
          application_guid: 'guid-1',
          tenure_id: 'REC0001',
          title: 'Sample Resource',
          forest_region: 'R01',
          forest_district: 'D01',
          district_name: 'District',
          mgt_unit_type: 'REC',
          mgt_unit_number: 'REC0001',
          drawn_by: 'tester',
          submission_date: new Date('2026-10-19T00:00:00.000Z'),
          adjudication_comment: null,
        },
      ])
      .mockResolvedValueOnce([
        {
          section_id: '1',
          geojson: JSON.stringify({
            type: 'Polygon',
            coordinates: [
              [
                [-123.1, 49.2],
                [-123.0, 49.2],
                [-123.0, 49.3],
                [-123.1, 49.3],
                [-123.1, 49.2],
              ],
            ],
          }),
          label_geojson: JSON.stringify({
            type: 'Point',
            coordinates: [-123.05, 49.25],
          }),
        },
      ]);

    vi.spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({ layers: [{ id: 0 }, { id: 2 }, { id: 5 }] }),
          { status: 200 },
        ),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            results: {
              Output_File: {
                value: {
                  url: 'https://example.com/map-object-results.jpg',
                },
              },
            },
          }),
          { status: 200 },
        ),
      )
      .mockResolvedValueOnce(
        new Response(MINIMAL_JPEG, {
          status: 200,
          headers: { 'Content-Type': 'image/jpeg' },
        }),
      );

    const result = await service.generate('S1234567', {
      scale: 30000,
      pageSize: ExhibitAPageSize.A,
      pageOrientation: ExhibitAPageOrientation.Portrait,
    });

    expect(result.mapImageUrl).toBe(
      'https://example.com/map-object-results.jpg',
    );
    expect(result.pdfUrl).toBe('https://example.com/s3/exhibit-a-123.pdf');
    expect(result.pdfBuffer?.subarray(0, 4).toString('ascii')).toBe('%PDF');
  });

  it('falls back to nearest available FTA map scale when requested scale is unavailable', async () => {
    prisma.$queryRaw
      .mockResolvedValueOnce([
        {
          submission_id: 'S1234567',
          application_guid: 'guid-1',
          tenure_id: 'REC0001',
          title: 'Sample Resource',
          forest_region: 'R01',
          forest_district: 'D01',
          district_name: 'District',
          mgt_unit_type: 'REC',
          mgt_unit_number: 'REC0001',
          drawn_by: 'tester',
          submission_date: new Date('2026-10-19T00:00:00.000Z'),
          adjudication_comment: null,
        },
      ])
      .mockResolvedValueOnce([
        {
          section_id: '1',
          geojson: JSON.stringify({
            type: 'Polygon',
            coordinates: [
              [
                [-123.1, 49.2],
                [-123.0, 49.2],
                [-123.0, 49.3],
                [-123.1, 49.3],
                [-123.1, 49.2],
              ],
            ],
          }),
          label_geojson: JSON.stringify({
            type: 'Point',
            coordinates: [-123.05, 49.25],
          }),
        },
      ]);

    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ message: 'not found' }), { status: 404 }),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ layers: [{ id: 0 }, { id: 1 }] }), {
          status: 200,
        }),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            results: [
              { value: { url: 'https://example.com/map-fallback.jpg' } },
            ],
          }),
          { status: 200 },
        ),
      )
      .mockResolvedValueOnce(
        new Response(MINIMAL_JPEG, {
          status: 200,
          headers: { 'Content-Type': 'image/jpeg' },
        }),
      );

    const result = await service.generate('S1234567', {
      scale: 25000,
      pageSize: ExhibitAPageSize.A,
      pageOrientation: ExhibitAPageOrientation.Portrait,
    });

    const exportCallInit = fetchMock.mock.calls[2]?.[1];
    const params = new URLSearchParams(String(exportCallInit?.body ?? ''));
    const webMapJson = JSON.parse(params.get('Web_Map_as_JSON') ?? '{}') as {
      baseMap?: { baseMapLayers?: Array<{ url?: string }> };
    };

    const resolvedLayerUrl = webMapJson.baseMap?.baseMapLayers?.[0]?.url ?? '';
    expect(resolvedLayerUrl.includes('/fta/25000/MapServer')).toBe(false);
    expect(
      resolvedLayerUrl.includes('/fta/20000/MapServer') ||
        resolvedLayerUrl.includes('/fta/30000/MapServer'),
    ).toBe(true);
    expect(result.mapImageUrl).toBe('https://example.com/map-fallback.jpg');
    expect(result.pdfUrl).toBe('https://example.com/s3/exhibit-a-123.pdf');
    expect(result.scale).toBe(25000);
  });

  it('falls back to /layers metadata when root MapServer metadata has no layer ids', async () => {
    prisma.$queryRaw
      .mockResolvedValueOnce([
        {
          submission_id: 'S1234567',
          application_guid: 'guid-1',
          tenure_id: 'REC0001',
          title: 'Sample Resource',
          forest_region: 'R01',
          forest_district: 'D01',
          district_name: 'District',
          mgt_unit_type: 'REC',
          mgt_unit_number: 'REC0001',
          drawn_by: 'tester',
          submission_date: new Date('2026-10-19T00:00:00.000Z'),
        },
      ])
      .mockResolvedValueOnce([
        {
          section_id: '1',
          geojson: JSON.stringify({
            type: 'Polygon',
            coordinates: [
              [
                [-123.1, 49.2],
                [-123.0, 49.2],
                [-123.0, 49.3],
                [-123.1, 49.3],
                [-123.1, 49.2],
              ],
            ],
          }),
          label_geojson: JSON.stringify({
            type: 'Point',
            coordinates: [-123.05, 49.25],
          }),
        },
      ]);

    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ layers: [] }), { status: 200 }),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ layers: [{ id: 0 }, { id: 1 }] }), {
          status: 200,
        }),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            results: [
              { value: { url: 'https://example.com/map-no-layers.jpg' } },
            ],
          }),
          { status: 200 },
        ),
      )
      .mockResolvedValueOnce(
        new Response(MINIMAL_JPEG, {
          status: 200,
          headers: { 'Content-Type': 'image/jpeg' },
        }),
      );

    const result = await service.generate('S1234567', {
      scale: 30000,
      pageSize: ExhibitAPageSize.B,
      pageOrientation: ExhibitAPageOrientation.Landscape,
    });

    const exportCallInit = fetchMock.mock.calls[2]?.[1];
    const params = new URLSearchParams(String(exportCallInit?.body ?? ''));
    const webMapJson = JSON.parse(params.get('Web_Map_as_JSON') ?? '{}') as {
      operationalLayers?: Array<{ id?: string; visibleLayers?: number[] }>;
    };
    const ftaLayer = webMapJson.operationalLayers?.find(
      (layer) => layer.id === 'fta-mapserver',
    );

    expect(ftaLayer).toBeTruthy();
    expect(ftaLayer?.visibleLayers).toEqual([0, 1]);
    expect(result.mapImageUrl).toBe('https://example.com/map-no-layers.jpg');
  });

  it('returns latest stored exhibit url when generate=false', async () => {
    prisma.$queryRaw
      .mockResolvedValueOnce([
        {
          application_guid: '6444f5ab-cc12-4129-b66f-2deec3f26ec8',
          submission_id: 'S1234567',
          tenure_id: 'REC0001',
        },
      ])
      .mockResolvedValueOnce([
        {
          submission_id: 'S1234567',
          s3_key: 'REC0001/exhibit-a-S1234567-123.pdf',
          page_size: 'C',
          page_orientation: 'Portrait',
          scale: 30000,
        },
      ]);

    s3.getSignedUrl.mockResolvedValueOnce(
      'https://example.com/s3/exhibit-a-S1234567-123.pdf',
    );

    const result = await service.createOrGetByApplicationGuid(
      '6444f5ab-cc12-4129-b66f-2deec3f26ec8',
      {
        generate: false,
        userId: 'TESTER1',
        adjudicationComments: [
          { actionCode: 'REVIEWED', actionComment: 'reviewed' },
        ],
      },
    );

    expect(prisma.$executeRaw).toHaveBeenCalledTimes(1);
    expect(prisma.$executeRaw.mock.calls[0]).toContain(
      JSON.stringify([{ actionCode: 'REVIEWED', actionComment: 'reviewed' }]),
    );
    expect(result).toEqual({
      submissionId: 'S1234567',
      pdfUrl: 'https://example.com/s3/exhibit-a-S1234567-123.pdf',
      size: ExhibitAPageSize.C,
      orientation: ExhibitAPageOrientation.Portrait,
      scale: 30000,
    });
  });

  it('generates and persists exhibit metadata when generate=true', async () => {
    prisma.$queryRaw.mockResolvedValueOnce([
      {
        application_guid: '6444f5ab-cc12-4129-b66f-2deec3f26ec8',
        submission_id: 'S1234567',
        tenure_id: 'REC0001',
      },
    ]);

    const generateSpy = vi.spyOn(service, 'generate').mockResolvedValue({
      submissionId: 'S1234567',
      pageSize: ExhibitAPageSize.B,
      pageOrientation: ExhibitAPageOrientation.Landscape,
      scale: 30000,
      mapImageUrl: 'https://example.com/map.jpg',
      pdfBuffer: Buffer.from('%PDF-1.4 test', 'ascii'),
      pdfKey: 'REC0001/exhibit-a-S1234567-456.pdf',
      pdfUrl: 'https://example.com/s3/exhibit-a-S1234567-456.pdf',
    });

    const result = await service.createOrGetByApplicationGuid(
      '6444f5ab-cc12-4129-b66f-2deec3f26ec8',
      {
        generate: true,
        userId: 'TESTER1',
        adjudicationComments: [
          {
            actionCode: 'APPROVED',
            actionComment: 'approved for generation',
          },
        ],
        size: ExhibitAPageSize.B,
        orientation: ExhibitAPageOrientation.Landscape,
        scale: 30000,
      },
    );

    expect(generateSpy).toHaveBeenCalledWith('S1234567', {
      pageSize: ExhibitAPageSize.B,
      pageOrientation: ExhibitAPageOrientation.Landscape,
      scale: 30000,
    });
    expect(prisma.$executeRaw).toHaveBeenCalledTimes(2);
    expect(prisma.$executeRaw.mock.calls[1]).toContain('Landscape');
    expect(result).toEqual({
      submissionId: 'S1234567',
      pdfUrl: 'https://example.com/s3/exhibit-a-S1234567-456.pdf',
      size: ExhibitAPageSize.B,
      orientation: ExhibitAPageOrientation.Landscape,
      scale: 30000,
    });
  });

  it('throws NotFoundException when a submission has no map features', async () => {
    prisma.$queryRaw
      .mockResolvedValueOnce([
        {
          submission_id: 'S1234567',
          application_guid: 'guid-1',
          tenure_id: 'REC0001',
          title: 'Sample Resource',
          forest_region: 'R01',
          forest_district: 'D01',
          district_name: 'District',
          mgt_unit_type: 'REC',
          mgt_unit_number: 'REC0001',
          drawn_by: 'tester',
          submission_date: new Date('2026-10-19T00:00:00.000Z'),
        },
      ])
      .mockResolvedValueOnce([]);

    await expect(service.generate('S1234567', {})).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('throws BadGatewayException when feature geometry cannot be rendered', async () => {
    prisma.$queryRaw
      .mockResolvedValueOnce([
        {
          submission_id: 'S1234567',
          application_guid: 'guid-1',
          tenure_id: 'REC0001',
          title: 'Sample Resource',
          forest_region: 'R01',
          forest_district: 'D01',
          district_name: 'District',
          mgt_unit_type: 'REC',
          mgt_unit_number: 'REC0001',
          drawn_by: 'tester',
          submission_date: new Date('2026-10-19T00:00:00.000Z'),
        },
      ])
      .mockResolvedValueOnce([
        {
          section_id: '1',
          geojson: JSON.stringify({
            type: 'GeometryCollection',
            coordinates: [],
          }),
          label_geojson: JSON.stringify({
            type: 'Point',
            coordinates: [-123.05, 49.25],
          }),
        },
      ]);

    await expect(service.generate('S1234567', {})).rejects.toBeInstanceOf(
      BadGatewayException,
    );
  });

  it('throws when generate=false and no prior exhibit document exists', async () => {
    prisma.$queryRaw
      .mockResolvedValueOnce([
        {
          application_guid: '6444f5ab-cc12-4129-b66f-2deec3f26ec8',
          submission_id: 'S1234567',
          tenure_id: 'REC0001',
        },
      ])
      .mockResolvedValueOnce([]);

    await expect(
      service.createOrGetByApplicationGuid(
        '6444f5ab-cc12-4129-b66f-2deec3f26ec8',
        {
          generate: false,
          userId: 'TESTER1',
          adjudicationComments: [],
        },
      ),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('throws when generated Exhibit A is missing storage details', async () => {
    prisma.$queryRaw.mockResolvedValueOnce([
      {
        application_guid: '6444f5ab-cc12-4129-b66f-2deec3f26ec8',
        submission_id: 'S1234567',
        tenure_id: 'REC0001',
      },
    ]);

    vi.spyOn(service, 'generate').mockResolvedValue({
      submissionId: 'S1234567',
      pageSize: ExhibitAPageSize.B,
      pageOrientation: ExhibitAPageOrientation.Landscape,
      scale: 30000,
      mapImageUrl: 'https://example.com/map.jpg',
      pdfBuffer: undefined,
      pdfKey: undefined,
      pdfUrl: undefined,
    });

    await expect(
      service.createOrGetByApplicationGuid(
        '6444f5ab-cc12-4129-b66f-2deec3f26ec8',
        {
          generate: true,
          userId: 'TESTER1',
          adjudicationComments: [],
        },
      ),
    ).rejects.toBeInstanceOf(BadGatewayException);
  });

  it('returns projection-only fields from getExhibitA', async () => {
    vi.spyOn(service, 'generate').mockResolvedValue({
      submissionId: 'S1234567',
      pageSize: ExhibitAPageSize.A,
      pageOrientation: ExhibitAPageOrientation.Portrait,
      scale: 15000,
      mapImageUrl: 'https://example.com/map.jpg',
      pdfUrl: 'https://example.com/s3/file.pdf',
    });

    await expect(service.getExhibitA('S1234567')).resolves.toEqual({
      submissionId: 'S1234567',
      pdfUrl: 'https://example.com/s3/file.pdf',
      pageSize: ExhibitAPageSize.A,
      pageOrientation: ExhibitAPageOrientation.Portrait,
      scale: 15000,
    });
  });
});
