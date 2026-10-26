import { ExhibitAPdfBuilder } from '@/exhibit-a/exhibit-a-pdf-builder';
import {
  ExhibitAPageOrientation,
  ExhibitAPageSize,
} from '@/exhibit-a/dto/generate-exhibit-a.dto';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { PDFPage } from 'pdf-lib';

const MINIMAL_PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/aLsAAAAASUVORK5CYII=',
  'base64',
);

const baseInput = {
  submissionId: 'S1234567',
  pageSize: ExhibitAPageSize.A,
  pageOrientation: ExhibitAPageOrientation.Portrait,
  scale: 20000,
  header: {
    submission_id: 'S1234567',
    application_guid: 'app-guid',
    title: 'Sample Resource',
    forest_region: 'R01',
    forest_district: 'D01',
    district_name: 'District',
    mgt_unit_type: 'REC',
    mgt_unit_number: 'REC0001',
    drawn_by: 'tester',
    utm_zone: 10,
    length_km: 1.111,
  },
  mapImageBytes: MINIMAL_PNG,
};

describe('ExhibitAPdfBuilder', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders section entries in ascending numeric pointId order', async () => {
    const builder = new ExhibitAPdfBuilder();
    vi.spyOn(builder as any, 'asset').mockImplementation(() => MINIMAL_PNG);
    const drawTextSpy = vi.spyOn(PDFPage.prototype, 'drawText');

    await builder.build({
      ...baseInput,
      coordinateRows: [
        {
          pointId: '10',
          lengthKm: 0.11,
          pofc: [616100, 5720000],
          poft: [616200, 5720100],
        },
        {
          pointId: '2',
          lengthKm: 0.22,
          pofc: [616200, 5720100],
          poft: [616300, 5720200],
        },
        {
          pointId: '1',
          lengthKm: 0.33,
          pofc: [616300, 5720200],
          poft: [616400, 5720300],
        },
      ],
    });

    const sectionIds = drawTextSpy.mock.calls
      .map(([text]) => String(text))
      .filter((line) => /^\d+ \(/.test(line))
      .map((line) => Number(line.split(' ')[0]));

    expect(sectionIds).toEqual([1, 2, 10]);
  });

  it('uses raster logo candidates for the Exhibit A header logo', async () => {
    const builder = new ExhibitAPdfBuilder();
    const assetSpy = vi
      .spyOn(builder as any, 'asset')
      .mockImplementation(() => MINIMAL_PNG);

    await builder.build({
      ...baseInput,
      coordinateRows: [
        {
          pointId: '1',
          lengthKm: 0.1,
          pofc: [616100, 5720000],
          poft: [616200, 5720100],
        },
      ],
    });

    const firstAssetName = assetSpy.mock.calls[0]?.[0] as string;
    expect(firstAssetName).toBe('rst_logo.png');
    expect(firstAssetName).not.toBe('RST_nav_logo.svg');
  });

  it('measures a different map box for portrait and landscape layouts', async () => {
    const builder = new ExhibitAPdfBuilder();
    const portrait = await builder.measureMap({
      submissionId: baseInput.submissionId,
      pageSize: ExhibitAPageSize.B,
      pageOrientation: ExhibitAPageOrientation.Portrait,
      scale: baseInput.scale,
      header: baseInput.header,
    });
    const landscape = await builder.measureMap({
      submissionId: baseInput.submissionId,
      pageSize: ExhibitAPageSize.B,
      pageOrientation: ExhibitAPageOrientation.Landscape,
      scale: baseInput.scale,
      header: baseInput.header,
    });

    expect(portrait.widthPt).not.toBe(landscape.widthPt);
    expect(portrait.heightPt).not.toBe(landscape.heightPt);
  });

  it('throws for unsupported map image bytes', async () => {
    const builder = new ExhibitAPdfBuilder();
    vi.spyOn(builder as any, 'asset').mockImplementation(() => MINIMAL_PNG);

    await expect(
      builder.build({
        ...baseInput,
        mapImageBytes: Buffer.from([0x00, 0x01, 0x02]),
        coordinateRows: [],
      }),
    ).rejects.toThrow(/Unsupported Exhibit A image format/i);
  });

  it('throws when an expected bundled asset is missing', () => {
    const builder = new ExhibitAPdfBuilder();
    expect(() =>
      (builder as any).asset('definitely-missing-asset.png'),
    ).toThrow(/Exhibit A asset not found/i);
  });

  it('renders UTM, project type, and area/width/length header lines when provided', async () => {
    const builder = new ExhibitAPdfBuilder();
    vi.spyOn(builder as any, 'asset').mockImplementation(() => MINIMAL_PNG);
    const drawTextSpy = vi.spyOn(PDFPage.prototype, 'drawText');

    await builder.build({
      ...baseInput,
      header: {
        ...baseInput.header,
        district_name: '100 Mile House Natural Resource District',
        forest_district: 'DMH',
        title: '99 Mile Cross-Country Ski Trails',
        forest_region: 'RCB',
        project_type: 'Recreation Trail Established',
        utm_zone: 11,
        utm_easting: 412192,
        utm_northing: 5432303,
        area_ha: 39.6485,
        width_m: 10,
        length_km: 39.6485,
      },
      coordinateRows: [],
    });

    const lines = drawTextSpy.mock.calls.map(([text]) => String(text).trim());
    expect(lines).toContain('Natural Resource District:');
    expect(
      lines.some((line) => line.includes('100 Mile House Natural Resource')),
    ).toBe(true);
    expect(lines.some((line) => line.includes('District (DMH)'))).toBe(true);
    expect(lines).toContain('Recreation District');
    expect(
      lines.some((line) => line.includes('99 Mile Cross-Country Ski Trails')),
    ).toBe(true);
    expect(lines.some((line) => line.includes('(RCB)'))).toBe(true);
    expect(lines).toContain('Project Type:');
    expect(lines).toContain('Recreation Trail Established');
    expect(lines).toContain('UTM 11 412192 east 5432303 north');
    expect(lines).toContain('AREA (Ha):');
    expect(lines).toContain('39.6485');
    expect(lines).toContain('WIDTH (m):');
    expect(lines).toContain('10');
    expect(lines).toContain('LENGTH (km):');
    expect(lines).toContain('NAD 1983 BC Env Albers');
  });
});
