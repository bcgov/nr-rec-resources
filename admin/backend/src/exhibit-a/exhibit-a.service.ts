import proj4 from 'proj4';
import { AppConfigService } from '@/app-config/app-config.service';
import { PrismaService } from '@/prisma.service';
import { S3Service } from '@/s3/s3.service';
import {
  BadGatewayException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  CreateExhibitAByApplicationGuidRequestDto,
  CreateExhibitAByApplicationGuidResultDto,
  ExhibitAPageOrientation,
  ExhibitAPageSize,
  GenerateExhibitARequestDto,
} from './dto/generate-exhibit-a.dto';
import {
  ExhibitAPdfBuilder,
  ExhibitAPdfCoordinateRow,
  ExhibitAPdfHeader,
} from '@/exhibit-a/exhibit-a-pdf-builder';
import {
  DEFAULT_FTA_ARCGIS_SERVER_TEMPLATE,
  DEFAULT_FTA_MAP_SERVICE,
  EXPORT_TIMEOUT_MS,
  FETCH_TIMEOUT_MS,
  KNOWN_FTA_SERVICE_SCALES,
  LAYER_CACHE_TTL_MS,
  MAX_DPI,
  MAX_EXPORT_PX,
  MIN_DPI,
  PAGE_SIZE_RULES,
  SCALE_BY_SPAN,
  WGS84,
  clamp,
  toEnum,
} from './exhibit-a.constants';
import {
  ExhibitADocLookupRow,
  ExhibitAResult,
  FeatureRow,
  GeoJsonGeometry,
  HeaderRow,
  LabelGraphic,
  LayersPayload,
  LonLat,
  SpatialBounds,
  SubmissionGraphic,
  SubmissionLookupRow,
} from './exhibit-a.types';
import {
  calculateExtent,
  lineInfo,
  parseGeoJsonGeometry,
  toCoordinatePair,
  toEsriGeometry,
} from './exhibit-a.geometry.helpers';
import {
  buildWebMapJson,
  extractArcGisDiagnostic,
  findOutputUrl,
} from './exhibit-a.arcgis.helpers';

type Json = Record<string, unknown>;
type PrismaRawQueryError = {
  code?: string;
  message?: string;
  meta?: {
    code?: string;
    message?: string;
  };
};

const spans = (e: SpatialBounds): [number, number] => [
  Math.abs(e.xmax - e.xmin),
  Math.abs(e.ymax - e.ymin),
];

/** Point graphic in WGS84 for the ArcGIS web map. */
const toPointGraphic = ([x, y]: LonLat): Json => ({
  x,
  y,
  spatialReference: WGS84,
});

/** Returns the first row or throws NotFound. */
function firstOrThrow<T>(rows: T[], message: string): T {
  if (!rows[0]) throw new NotFoundException(message);
  return rows[0];
}

@Injectable()
export class ExhibitAService {
  private readonly pdfBuilder = new ExhibitAPdfBuilder();
  private readonly layerCache = new Map<
    string,
    { ids: number[]; expires: number }
  >();

  constructor(
    private readonly prisma: PrismaService,
    private readonly appConfig: AppConfigService,
    private readonly s3Service: S3Service,
  ) {}

  async generate(
    submissionId: string,
    options: GenerateExhibitARequestDto,
  ): Promise<ExhibitAResult> {
    const [header, featureRows] = await Promise.all([
      this.loadSubmissionHeader(submissionId),
      this.loadSubmissionFeatures(submissionId),
    ]);

    if (featureRows.length === 0) {
      throw new NotFoundException(
        `No map features found for submission_id: ${submissionId}`,
      );
    }

    const { sourceGeometries, geometryFeatures, labelFeatures } =
      this.toGraphics(featureRows);
    const geometryMode = this.detectGeometryMode(sourceGeometries);

    if (geometryFeatures.length === 0) {
      throw new BadGatewayException(
        `No renderable geometry found for submission_id: ${submissionId}`,
      );
    }

    const extent = calculateExtent(sourceGeometries);
    const utmZone = clamp(
      Math.floor(((extent.xmin + extent.xmax) / 2 + 180) / 6) + 1,
      1,
      60,
    );
    const { coordinateRows, pofcPoints, poftPoints, totalLengthKm } =
      this.toSections(featureRows, sourceGeometries, utmZone);

    const scale = options.scale ?? this.determineScale(extent);
    const pageOrientation =
      options.pageOrientation ?? this.determineOrientation(extent);
    const pageSize = options.pageSize ?? this.determinePageSize(extent, scale);

    const pdfHeader: ExhibitAPdfHeader = {
      ...header,
      // Keeps the old output unless a real tsa column is selected.
      tsa: header.tsa ?? header.forest_district,
      utm_zone: header.utm_zone ?? utmZone,
      utm_easting: header.utm_easting ?? null,
      utm_northing: header.utm_northing ?? null,
      area_ha: header.area_ha ?? null,
      width_m: header.width_m ?? null,
      project_type: header.project_type ?? header.mgt_unit_type,
      length_km: header.length_km ?? totalLengthKm,
      geometry_mode: geometryMode,
    };
    const layout = {
      submissionId,
      header: pdfHeader,
      pageSize,
      pageOrientation,
      scale,
    };

    // Export the map at exactly the PDF map box size, so the printed scale is
    // true (ground coverage = box inches x scale) and the image isn't cropped.
    const { widthPt, heightPt } = await this.pdfBuilder.measureMap(layout);
    const [inW, inH] = [widthPt / 72, heightPt / 72];
    const dpi = clamp(MAX_EXPORT_PX / Math.max(inW, inH), MIN_DPI, MAX_DPI);
    const outputSize = [Math.round(inW * dpi), Math.round(inH * dpi)];

    const { mapServerUrl, visibleLayers } = await this.resolveMapServer(scale);
    const mapImageUrl = await this.exportMapImage(
      buildWebMapJson({
        mapServerUrl,
        visibleLayers,
        geometryFeatures,
        labelFeatures,
        pofcPoints,
        poftPoints,
        extent,
        scale,
        outputSize,
        dpi,
      }),
    );

    const pdfBuffer = await this.pdfBuilder.build({
      ...layout,
      mapImageBytes: await this.downloadBinary(mapImageUrl),
      coordinateRows,
    });
    const upload = await this.uploadPdfToS3(
      header.tenure_id,
      submissionId,
      pdfBuffer,
    );

    return {
      submissionId,
      pdfBuffer,
      pdfUrl: upload.url,
      pdfKey: upload.key,
      mapImageUrl,
      pageSize,
      pageOrientation,
      scale,
    };
  }

  async createOrGetByApplicationGuid(
    applicationGuid: string,
    payload: CreateExhibitAByApplicationGuidRequestDto,
  ): Promise<CreateExhibitAByApplicationGuidResultDto> {
    const submission =
      await this.loadSubmissionByApplicationGuid(applicationGuid);

    const normalizedComment =
      payload.adjudicationComments === undefined
        ? null
        : JSON.stringify(payload.adjudicationComments);
    const userId = payload.userId.trim();

    await this.prisma.$executeRaw`
      UPDATE rst.recreation_spatial_submission
      SET adjudication_comment = ${normalizedComment},
          updated_by = ${userId},
          created_by = COALESCE(created_by, ${userId}),
          updated_at = CURRENT_TIMESTAMP
      WHERE application_guid = ${applicationGuid}::uuid
    `;

    if (!payload.generate) {
      const existing = await this.loadLatestExhibitAForSubmission(
        submission.submission_id,
      );
      if (!existing) {
        throw new NotFoundException(
          `No Exhibit A found for submission_id: ${submission.submission_id}`,
        );
      }

      return {
        submissionId: existing.submission_id,
        pdfUrl: await this.s3Service.getSignedUrl(existing.s3_key),
        size: toEnum(ExhibitAPageSize, existing.page_size),
        orientation: this.toOrientation(existing.page_orientation),
        scale: existing.scale ?? undefined,
      };
    }

    const generated = await this.generate(submission.submission_id, {
      pageSize: payload.size,
      pageOrientation: payload.orientation,
      scale: payload.scale,
    });

    if (!generated.pdfUrl || !generated.pdfKey || !generated.pdfBuffer) {
      throw new BadGatewayException(
        `Generated Exhibit A is missing storage details for submission_id: ${submission.submission_id}`,
      );
    }

    await this.saveGeneratedExhibitAMetadata({
      recResourceId: submission.tenure_id,
      submissionId: submission.submission_id,
      s3Key: generated.pdfKey,
      size: generated.pageSize,
      orientation: this.toDbOrientation(generated.pageOrientation),
      scale: generated.scale,
      userId,
      fileSize: generated.pdfBuffer.length,
    });

    return {
      submissionId: generated.submissionId,
      pdfUrl: generated.pdfUrl,
      size: generated.pageSize,
      orientation: generated.pageOrientation,
      scale: generated.scale,
    };
  }

  async getExhibitA(
    submissionId: string,
  ): Promise<
    Pick<
      ExhibitAResult,
      'submissionId' | 'pdfUrl' | 'pageSize' | 'pageOrientation' | 'scale'
    >
  > {
    const r = await this.generate(submissionId, {});
    return {
      submissionId: r.submissionId,
      pdfUrl: r.pdfUrl,
      pageSize: r.pageSize,
      pageOrientation: r.pageOrientation,
      scale: r.scale,
    };
  }

  /* ------------------------------ geometry ------------------------------ */

  /** Parses every feature row into source geometry + ArcGIS geometry / label graphics. */
  private toGraphics(featureRows: FeatureRow[]) {
    const sourceGeometries: GeoJsonGeometry[] = [];
    const geometryFeatures: SubmissionGraphic[] = [];
    const labelFeatures: LabelGraphic[] = [];

    featureRows.forEach((row, index) => {
      const geometry = parseGeoJsonGeometry(row.geojson, 'geojson');
      sourceGeometries.push(geometry);

      const esri = toEsriGeometry(geometry);
      if (esri) {
        geometryFeatures.push({
          ...esri,
          attributes: {
            OBJECTID: index + 1,
            section_id: row.section_id ?? `${index + 1}`,
          },
        });
      }

      const label = parseGeoJsonGeometry(row.label_geojson, 'label_geojson');
      const point =
        label.type === 'Point' ? toCoordinatePair(label.coordinates) : null;
      if (point) {
        labelFeatures.push({
          geometry: toPointGraphic(point),
          attributes: { text: row.section_id ?? '' },
        });
      }
    });

    return { sourceGeometries, geometryFeatures, labelFeatures };
  }

  /** Per-section PofC / PofT (line start / end) in UTM, plus lengths. */
  private toSections(
    featureRows: FeatureRow[],
    sourceGeometries: GeoJsonGeometry[],
    utmZone: number,
  ) {
    const { forward } = proj4(
      'EPSG:4326',
      `+proj=utm +zone=${utmZone} +datum=NAD83 +units=m +no_defs`,
    );
    const toUtm = (p: LonLat) => forward(p) as [number, number];

    const coordinateRows: ExhibitAPdfCoordinateRow[] = [];
    const pofcPoints: Json[] = [];
    const poftPoints: Json[] = [];
    let totalLengthKm = 0;

    featureRows.forEach((row, index) => {
      const info = lineInfo(sourceGeometries[index]!, toUtm);
      if (!info) return;

      totalLengthKm += info.lengthKm;
      pofcPoints.push(toPointGraphic(info.startLL));
      poftPoints.push(toPointGraphic(info.endLL));
      coordinateRows.push({
        pointId: row.section_id?.trim() || `${index + 1}`,
        lengthKm: info.lengthKm,
        pofc: info.pofc,
        poft: info.poft,
      });
    });

    return { coordinateRows, pofcPoints, poftPoints, totalLengthKm };
  }

  /** Classifies submission geometry so Exhibit A metrics can be rendered contextually. */
  private detectGeometryMode(
    sourceGeometries: GeoJsonGeometry[],
  ): ExhibitAPdfHeader['geometry_mode'] {
    const hasLine = sourceGeometries.some(
      (geometry) =>
        geometry.type === 'LineString' || geometry.type === 'MultiLineString',
    );
    const hasPolygon = sourceGeometries.some(
      (geometry) =>
        geometry.type === 'Polygon' || geometry.type === 'MultiPolygon',
    );

    if (hasLine && hasPolygon) return 'mixed';
    if (hasLine) return 'linear';
    if (hasPolygon) return 'polygon';
    return null;
  }

  /* ------------------------------ database ------------------------------ */

  private async loadSubmissionHeader(submissionId: string): Promise<HeaderRow> {
    const rows = await this.prisma.$queryRaw<HeaderRow[]>`
      SELECT
        rss.submission_id,
        rss.application_guid,
        rss.tenure_id,
        rr.name AS title,
        nrou.region_code AS forest_region,
        nrou.district_code AS forest_district,
        nrou.org_unit_name AS district_name,
        rss.recreation_resource_type AS mgt_unit_type,
        rrtype.description AS project_type,
        rr.rec_resource_id AS mgt_unit_number,
        COALESCE(rss.updated_by, rss.created_by) AS drawn_by,
        rss.submission_date,
        site.utm_zone,
        site.utm_easting,
        site.utm_northing,
        metrics.area_ha,
        rr.right_of_way::numeric AS width_m,
        metrics.length_km
      FROM rst.recreation_spatial_submission rss
      INNER JOIN rst.recreation_resource rr
        ON rr.rec_resource_id = rss.tenure_id
      LEFT JOIN rst.natural_resource_org_unit nrou
        ON nrou.rec_resource_id = rr.rec_resource_id
      LEFT JOIN LATERAL (
        SELECT
          ROUND(
            SUM(
              CASE
                WHEN public.ST_GeometryType(g.geom_3005) IN ('ST_Polygon', 'ST_MultiPolygon')
                THEN public.ST_Area(g.geom_3005)
                ELSE 0
              END
            )::numeric / 10000,
            4
          ) AS area_ha,
          ROUND(
            SUM(
              CASE
                WHEN public.ST_GeometryType(g.geom_3005) IN ('ST_Polygon', 'ST_MultiPolygon')
                THEN public.ST_Perimeter(g.geom_3005)
                WHEN public.ST_GeometryType(g.geom_3005) IN ('ST_LineString', 'ST_MultiLineString')
                THEN public.ST_Length(g.geom_3005)
                ELSE 0
              END
            )::numeric / 1000,
            4
          ) AS length_km
        FROM (
          SELECT
            CASE
              WHEN public.ST_SRID(rmfg.geometry) = 0
                THEN public.ST_SetSRID(rmfg.geometry, 3005)
              ELSE rmfg.geometry
            END AS geom_3005
          FROM rst.recreation_map_feature rmf
          INNER JOIN rst.recreation_map_feature_geom rmfg
            ON rmfg.rmf_skey = rmf.rmf_skey
          WHERE rmf.rec_resource_id = rss.tenure_id
            AND rmf.retirement_date IS NULL
        ) g
      ) metrics ON TRUE
      LEFT JOIN LATERAL (
        SELECT
          z.utm_zone,
          ROUND(public.ST_X(public.ST_Transform(z.geom_3005, z.utm_srid)))::integer AS utm_easting,
          ROUND(public.ST_Y(public.ST_Transform(z.geom_3005, z.utm_srid)))::integer AS utm_northing
        FROM (
          SELECT
            p.geom_3005,
            FLOOR((public.ST_X(w.wgs84) + 180) / 6)::integer + 1 AS utm_zone,
            32600 + FLOOR((public.ST_X(w.wgs84) + 180) / 6)::integer + 1 AS utm_srid
          FROM (
            SELECT
              CASE
                WHEN public.ST_SRID(rsp.geometry) = 0
                  THEN public.ST_SetSRID(rsp.geometry, 3005)
                ELSE rsp.geometry
              END AS geom_3005
            FROM rst.recreation_site_point rsp
            WHERE rsp.rec_resource_id = rss.tenure_id
            LIMIT 1
          ) p
          CROSS JOIN LATERAL (
            SELECT public.ST_Transform(p.geom_3005, 4326) AS wgs84
          ) w
        ) z
      ) site ON TRUE
      LEFT JOIN LATERAL (
        SELECT rrtv.description
        FROM rst.recreation_resource_type_view_admin rrtv
        WHERE rrtv.rec_resource_id = rr.rec_resource_id
        ORDER BY rrtv.rec_resource_type_code
        LIMIT 1
      ) rrtype ON TRUE
      WHERE rss.submission_id = ${submissionId}
      LIMIT 1
    `;
    return firstOrThrow(
      rows,
      `Spatial submission not found for submission_id: ${submissionId}`,
    );
  }

  private async loadSubmissionByApplicationGuid(
    applicationGuid: string,
  ): Promise<SubmissionLookupRow> {
    const rows = await this.prisma.$queryRaw<SubmissionLookupRow[]>`
      SELECT application_guid::text AS application_guid, submission_id, tenure_id
      FROM rst.recreation_spatial_submission
      WHERE application_guid = ${applicationGuid}::uuid
      LIMIT 1
    `;
    return firstOrThrow(
      rows,
      `Spatial submission not found for application_guid: ${applicationGuid}`,
    );
  }

  private async loadLatestExhibitAForSubmission(
    submissionId: string,
  ): Promise<ExhibitADocLookupRow | null> {
    const rows = await this.prisma.$queryRaw<ExhibitADocLookupRow[]>`
      SELECT submission_id, s3_key, page_size, page_orientation, scale
      FROM rst.recreation_exhibit_a_doc
      WHERE submission_id = ${submissionId}
      ORDER BY created_at DESC NULLS LAST, updated_at DESC NULLS LAST
      LIMIT 1
    `;
    return rows[0] ?? null;
  }

  private async saveGeneratedExhibitAMetadata(input: {
    recResourceId: string;
    submissionId: string;
    s3Key: string;
    size: ExhibitAPageSize;
    orientation: string;
    scale: number;
    userId: string;
    fileSize: number;
  }): Promise<void> {
    const leaf = input.s3Key.split('/').pop() || input.s3Key;
    const fileName = leaf.replace(/\.pdf$/i, '');

    try {
      await this.prisma.$executeRaw`
        WITH archived AS (
          DELETE FROM rst.recreation_exhibit_a_doc
          WHERE rec_resource_id = ${input.recResourceId}
            AND submission_id = ${input.submissionId}
        )
        INSERT INTO rst.recreation_exhibit_a_doc (
          rec_resource_id,
          file_name,
          extension,
          file_size,
          s3_key,
          submission_id,
          page_size,
          page_orientation,
          scale,
          generation_method,
          created_by,
          updated_by
        )
        VALUES (
          ${input.recResourceId},
          ${fileName},
          'pdf',
          ${input.fileSize},
          ${input.s3Key},
          ${input.submissionId},
          ${input.size},
          ${input.orientation},
          ${input.scale},
          'regenerate',
          ${input.userId},
          ${input.userId}
        )
      `;
    } catch (error) {
      if (!this.isMissingGenerationMethodColumn(error)) {
        throw error;
      }

      await this.prisma.$executeRaw`
        WITH archived AS (
          DELETE FROM rst.recreation_exhibit_a_doc
          WHERE rec_resource_id = ${input.recResourceId}
            AND submission_id = ${input.submissionId}
        )
        INSERT INTO rst.recreation_exhibit_a_doc (
          rec_resource_id,
          file_name,
          extension,
          file_size,
          s3_key,
          submission_id,
          page_size,
          page_orientation,
          scale,
          created_by,
          updated_by
        )
        VALUES (
          ${input.recResourceId},
          ${fileName},
          'pdf',
          ${input.fileSize},
          ${input.s3Key},
          ${input.submissionId},
          ${input.size},
          ${input.orientation},
          ${input.scale},
          ${input.userId},
          ${input.userId}
        )
      `;
    }
  }

  private isMissingGenerationMethodColumn(error: unknown): boolean {
    const raw = error as PrismaRawQueryError;
    if (raw?.code !== 'P2010') return false;
    if (raw?.meta?.code !== '42703') return false;

    const message = `${raw.meta?.message ?? ''} ${raw.message ?? ''}`;
    return message.includes('generation_method');
  }

  /** The SRID fix-up is computed once per row (LATERAL) instead of twice. */
  private async loadSubmissionFeatures(
    submissionId: string,
  ): Promise<FeatureRow[]> {
    return this.prisma.$queryRaw<FeatureRow[]>`
      SELECT
        rmf.section_id,
        public.ST_AsGeoJSON(public.ST_Transform(g.geom, 4326), 7) AS geojson,
        public.ST_AsGeoJSON(
          public.ST_Transform(public.ST_PointOnSurface(g.geom), 4326),
          7
        ) AS label_geojson
      FROM rst.recreation_spatial_submission rss
      INNER JOIN rst.recreation_map_feature rmf
        ON rmf.rec_resource_id = rss.tenure_id
      INNER JOIN rst.recreation_map_feature_geom rmfg
        ON rmfg.rmf_skey = rmf.rmf_skey
      CROSS JOIN LATERAL (
        SELECT CASE
          WHEN public.ST_SRID(rmfg.geometry) = 0
            THEN public.ST_SetSRID(rmfg.geometry, 3005)
          ELSE rmfg.geometry
        END AS geom
      ) g
      WHERE rss.submission_id = ${submissionId}
        AND rmf.retirement_date IS NULL
      ORDER BY rmf.rmf_skey
    `;
  }

  /* --------------------------- scale / page size ------------------------- */

  private determineScale(e: SpatialBounds): number {
    const span = Math.max(...spans(e));
    return SCALE_BY_SPAN.find(([max]) => span < max)?.[1] ?? 100000;
  }

  private determineOrientation(e: SpatialBounds): ExhibitAPageOrientation {
    const [dx, dy] = spans(e);
    return dx > dy
      ? ExhibitAPageOrientation.Landscape
      : ExhibitAPageOrientation.Portrait;
  }

  private determinePageSize(e: SpatialBounds, scale: number): ExhibitAPageSize {
    const [dx, dy] = spans(e);
    const rule = PAGE_SIZE_RULES.find(([s, a]) => scale <= s && dx * dy < a);
    return rule?.[2] ?? ExhibitAPageSize.E;
  }

  private toOrientation(
    value: string | null,
  ): ExhibitAPageOrientation | undefined {
    if (!value) return undefined;
    const known: Record<string, ExhibitAPageOrientation> = {
      Landscape: ExhibitAPageOrientation.Landscape,
      Portrait: ExhibitAPageOrientation.Portrait,
    };
    return known[value] ?? toEnum(ExhibitAPageOrientation, value);
  }

  private toDbOrientation(value: ExhibitAPageOrientation): string {
    return value === ExhibitAPageOrientation.Landscape
      ? 'Landscape'
      : 'Portrait';
  }

  /* ------------------------------ map server ----------------------------- */

  private coerceConfigString(value: unknown): string | undefined {
    if (typeof value === 'string') return value.trim() || undefined;
    if (typeof value === 'number' || typeof value === 'boolean')
      return `${value}`;
    return undefined;
  }

  private formatMapServerUrl(scale: number): string {
    const template =
      this.coerceConfigString(this.appConfig.ftaArcGisServersTemplate) ??
      DEFAULT_FTA_ARCGIS_SERVER_TEMPLATE;

    return template.includes('%d')
      ? template.replace('%d', `${scale}`)
      : `${template.replace(/\/+$/, '')}/${scale}/MapServer`;
  }

  /** Tries the requested scale first, then the nearest known service scales. */
  private async resolveMapServer(scale: number): Promise<{
    mapServerUrl: string;
    visibleLayers: number[];
  }> {
    const candidates = [
      scale,
      ...KNOWN_FTA_SERVICE_SCALES.filter((c) => c !== scale).sort(
        (a, b) => Math.abs(a - scale) - Math.abs(b - scale),
      ),
    ];
    const errors: string[] = [];

    for (const candidate of candidates) {
      const mapServerUrl = this.formatMapServerUrl(candidate);
      try {
        return {
          mapServerUrl,
          visibleLayers: await this.fetchVisibleLayerIds(mapServerUrl),
        };
      } catch (error) {
        errors.push(
          `${candidate}: ${error instanceof Error ? error.message : 'unknown error'}`,
        );
      }
    }

    throw new BadGatewayException(
      `Unable to resolve a valid FTA MapServer with visible layers for requested scale ${scale}. Attempts: ${errors.join(' || ')}`,
    );
  }

  /** Layer ids rarely change, so they are cached per MapServer URL. */
  private async fetchVisibleLayerIds(mapServerUrl: string): Promise<number[]> {
    const cached = this.layerCache.get(mapServerUrl);
    if (cached && cached.expires > Date.now()) return cached.ids;

    let ids: number[] = [];
    for (const path of ['?f=pjson', '/layers?f=pjson']) {
      const payload = await this.fetchJson<LayersPayload>(
        `${mapServerUrl}${path}`,
      );
      ids = (Array.isArray(payload.layers) ? payload.layers : []).flatMap(
        (l) => (typeof l?.id === 'number' ? [l.id] : []),
      );
      if (ids.length > 0) break;
    }
    if (ids.length === 0) {
      throw new BadGatewayException(
        `MapServer metadata does not expose visible layer ids for ${mapServerUrl}`,
      );
    }

    this.layerCache.set(mapServerUrl, {
      ids,
      expires: Date.now() + LAYER_CACHE_TTL_MS,
    });
    return ids;
  }

  /* ------------------------------ ArcGIS I/O ----------------------------- */
  private async exportMapImage(webMapJson: Json): Promise<string> {
    const endpoint =
      this.coerceConfigString(this.appConfig.ftaMapService) ??
      DEFAULT_FTA_MAP_SERVICE;
    const webMapAsJson = JSON.stringify(webMapJson);

    const form = new URLSearchParams({
      Web_Map_as_JSON: webMapAsJson,
      Format: 'jpg',
      'env:outSR': '',
      'env:processSR': '',
      returnZ: 'true',
      returnM: 'true',
      f: 'json',
    });

    const response = await this.fetchJson<Json>(
      endpoint,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: form.toString(),
      },
      EXPORT_TIMEOUT_MS,
    );

    const url = findOutputUrl(response);
    if (!url) {
      const diagnostic = extractArcGisDiagnostic(response);
      throw new BadGatewayException(
        `ArcGIS export response did not include an output URL.${diagnostic ? ` ${diagnostic}` : ''}`,
      );
    }
    return url;
  }

  /** fetch with a timeout; non-2xx and network/timeout errors become BadGateway. */
  private async http(
    url: string,
    init?: RequestInit,
    timeoutMs = FETCH_TIMEOUT_MS,
  ): Promise<Response> {
    let response: Response;
    try {
      response = await fetch(url, {
        ...init,
        signal: AbortSignal.timeout(timeoutMs),
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'unknown error';
      throw new BadGatewayException(
        `Upstream request failed (${message}) for ${url}`,
      );
    }
    if (!response.ok) {
      throw new BadGatewayException(
        `Upstream request failed (${response.status}) for ${url}`,
      );
    }
    return response;
  }

  private async fetchJson<T>(
    url: string,
    init?: RequestInit,
    timeoutMs?: number,
  ): Promise<T> {
    return (await (await this.http(url, init, timeoutMs)).json()) as T;
  }

  private async downloadBinary(url: string): Promise<Buffer> {
    const response = await this.http(url, undefined, EXPORT_TIMEOUT_MS);
    return Buffer.from(await response.arrayBuffer());
  }

  /* --------------------------------- S3 ---------------------------------- */

  private async uploadPdfToS3(
    recResourceId: string,
    submissionId: string,
    pdfBuffer: Buffer,
  ): Promise<{ key: string; url: string }> {
    const safeSubmissionId = submissionId.replace(/[^a-zA-Z0-9_-]/g, '_');
    const filename = `exhibit-a-${safeSubmissionId}-${Date.now()}.pdf`;
    const key = await this.s3Service.uploadFile(
      recResourceId,
      pdfBuffer,
      filename,
    );
    return { key, url: await this.s3Service.getSignedUrl(key) };
  }
}
