import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
} from '@nestjs/common';
import { createHash, randomInt, randomUUID } from 'node:crypto';
import { Prisma } from '@generated/prisma';
import { PrismaService } from '@/prisma.service';
import { SncscStatusRequestService } from '@/sncsc/sncsc-status-request.service';
import { ExhibitAService } from '@/exhibit-a/exhibit-a.service';
import { getRecreationResourceGeospatialData } from '@prisma-generated-sql/getRecreationResourceGeospatialData';
import { RecreationResourceGeospatialDto } from './dto/recreation-resource-geospatial.dto';
import { CreateRecreationMapFeaturesDto } from './dto/create-recreation-map-features.dto';
import {
  UpdateRecreationMapFeatureGeometryDto,
  UpdateRecreationResourceGeospatialDto,
} from './dto/update-recreation-resource-geospatial.dto';

type FlatGeometryEntry = {
  geometry: Record<string, unknown>;
  geometryTypeCode: 'P' | 'L';
  sectionId: string;
  purposeCode?: SpatialSubmissionPurposeCode;
  sourceMetrics?: {
    areaHa?: number | null;
    lengthKm?: number | null;
    perimeterKm?: number | null;
    rightOfWayM?: number | null;
  };
};

type SubmissionMapFeaturePersistEntry = FlatGeometryEntry & {
  purposeCode: SpatialSubmissionPurposeCode;
  rmfSkey: number;
  amendmentId: number;
  mapFeatureGuid: string;
  featureRecordGuid: string;
};

type SpatialSubmissionTypeCode = 'RL' | 'RPO';
type SpatialSubmissionPurposeCode = 'N' | 'A' | 'R';

type CreatedSpatialSubmission = {
  application_guid: string;
  submission_id: string;
  tenure_id: string;
  org_unit_code: string;
  status_request_type_code: string;
  purpose_code: string;
};

type OrgUnitClientInfo = {
  client_number: string;
  client_name: string;
};

type ForestClientByAcronymDto = {
  acronym?: string;
  clientName?: string;
  clientNumber?: string;
};

type MapSheetMatch = {
  mapSheet: string | null;
  raw: Record<string, any>;
};

type QueryResult = {
  features: Array<{
    attributes: Record<string, any>;
  }>;
};

type FeatureRequestElement = {
  '@type': 'FeatureRequestResource';
  mapFeatureGuid: string;
  featureRecordGuid: string;
  featureGeometryTypeCode: 'polygon' | 'line';
  mapFeatureTypeCode: string;
  featureName?: string | null;
  featureBusinessIdentifier?: string | null;
  featurePurposeCode?: 'N' | 'A' | 'R' | null;
  sourceSectionId?: string;
  sourcePurposeCode?: SpatialSubmissionPurposeCode;
  sourceFeatureBusinessIdentifier?: string | null;
} & (
  | { featureGeometryTypeCode: 'polygon'; polygon: Record<string, unknown> }
  | { featureGeometryTypeCode: 'line'; line: Record<string, unknown> }
);

type SubmissionSnapshotFeatureRow = {
  section_id: string | null;
  purpose_code: SpatialSubmissionPurposeCode;
  map_feature_guid: string;
  feature_record_guid: string;
  feature_business_identifier: string | null;
  recreation_resource_type: string | null;
  recreation_resource_type_description: string | null;
  geometry_type_code: string | null;
  geometry_json: string | null;
};

const DETERMINISTIC_GUID_NAMESPACE = 'rst-sncsc';
const BCGS_MAP_SHEET_LAYER_URL =
  'https://maps.gov.bc.ca/arcgis/rest/services/whse/bcgw_pub_whse_basemapping/MapServer/82/query';
const BCGS_MAP_SHEET_CANDIDATE_KEYS = [
  'MAP_TILE_DISPLAY_NAME',
  'map_tile_display_name',
  'MAPSHEET',
  'mapsheet',
  'MAP_SHEET',
  'map_sheet',
  'GRID_NAME',
  'grid_name',
] as const;
const BC_ALBERS_CRS = {
  type: 'name',
  properties: {
    name: 'EPSG:1000003005',
  },
} as const;

const GENERATED_SECTION_SUFFIX_PATTERN = /^(.*)-(\d+)$/;
const INTERACTIVE_TRANSACTION_TIMEOUT_MS = 20000;
const INTERACTIVE_TRANSACTION_MAX_WAIT_MS = 10000;

const normalizeSectionIdsForComparison = (
  sectionIds: Array<string | null | undefined>,
): string[] => {
  const cleanedIds = sectionIds
    .map((sectionId) => sectionId?.trim())
    .filter((sectionId): sectionId is string => Boolean(sectionId));

  const generatedGroups = new Map<string, Set<number>>();
  for (const sectionId of cleanedIds) {
    const match = sectionId.match(GENERATED_SECTION_SUFFIX_PATTERN);
    if (!match) continue;

    const baseSectionId = match[1]?.trim();
    const suffix = Number(match[2]);
    if (!baseSectionId || !Number.isInteger(suffix) || suffix < 1) continue;

    const indexes = generatedGroups.get(baseSectionId) ?? new Set<number>();
    indexes.add(suffix);
    generatedGroups.set(baseSectionId, indexes);
  }

  // Collapse only backend-generated split IDs like Trail-A-1/Trail-A-2.
  const collapsibleBases = new Set<string>();
  for (const [baseSectionId, indexes] of generatedGroups.entries()) {
    if (!baseSectionId.includes('-')) continue;
    if (indexes.size < 2 || !indexes.has(1)) continue;

    const maxIndex = Math.max(...indexes);
    if (maxIndex === indexes.size) {
      collapsibleBases.add(baseSectionId);
    }
  }

  const result: string[] = [];
  const seen = new Set<string>();
  for (const sectionId of cleanedIds) {
    const match = sectionId.match(GENERATED_SECTION_SUFFIX_PATTERN);
    const normalizedSectionId =
      match && collapsibleBases.has(match[1] ?? '')
        ? (match[1] ?? sectionId)
        : sectionId;

    if (seen.has(normalizedSectionId)) continue;
    seen.add(normalizedSectionId);
    result.push(normalizedSectionId);
  }

  return result;
};

const toDeterministicUuid = (seed: string): string => {
  const hash = createHash('sha1')
    .update(`${DETERMINISTIC_GUID_NAMESPACE}:${seed}`)
    .digest('hex')
    .slice(0, 32)
    .split('');

  hash[12] = '5';
  hash[16] = ((parseInt(hash[16] || '0', 16) & 0x3) | 0x8).toString(16);

  const hex = hash.join('');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`;
};

const toFiniteNumber = (value: unknown): number | null => {
  if (value === null || value === undefined || value === '') {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const getNumericProperty = (
  properties: Record<string, unknown> | null | undefined,
  keys: string[],
): number | null => {
  if (!properties) return null;

  const normalized = new Map(
    Object.entries(properties).map(([key, value]) => [
      key.toUpperCase(),
      value,
    ]),
  );

  for (const key of keys) {
    const value = normalized.get(key.toUpperCase());
    const parsed = toFiniteNumber(value);
    if (parsed !== null) {
      return parsed;
    }
  }

  return null;
};

const deriveLinearLengthKm = (
  rawLength: number | null,
  rightOfWayM: number | null,
  areaHa: number | null,
): number | null => {
  if (rawLength === null) {
    return null;
  }

  const lengthKmCandidate = rawLength;
  const lengthMetersCandidate = rawLength / 1000;

  if (rightOfWayM !== null && rightOfWayM > 0 && areaHa !== null) {
    const areaFromKm = (lengthKmCandidate * rightOfWayM) / 10;
    const areaFromMeters = (lengthMetersCandidate * rightOfWayM) / 10;
    return Math.abs(areaFromMeters - areaHa) <= Math.abs(areaFromKm - areaHa)
      ? lengthMetersCandidate
      : lengthKmCandidate;
  }

  return rawLength > 1000 ? lengthMetersCandidate : lengthKmCandidate;
};

const deriveLinearRightOfWayM = (
  rawRightOfWayM: number | null,
  rawLength: number | null,
): number | null => {
  if (rawRightOfWayM === null) {
    return null;
  }

  // FEATURE__1 is not consistently a width column; discard values that look like length-in-metres.
  if (rawLength !== null && rawLength > 0) {
    const normalizedLengthMeters =
      rawLength > 1000 ? rawLength : rawLength * 1000;
    const relativeDiff =
      Math.abs(rawRightOfWayM - normalizedLengthMeters) /
      Math.max(1, Math.abs(normalizedLengthMeters));

    if (relativeDiff <= 0.02) {
      return null;
    }
  }

  return rawRightOfWayM;
};

const extractSourceMetrics = (
  geometryType: string,
  properties: Record<string, unknown> | null | undefined,
): FlatGeometryEntry['sourceMetrics'] => {
  const areaHa = getNumericProperty(properties, ['FEATURE_AR']);
  const perimeterKm = getNumericProperty(properties, ['FEATURE_PE']);
  const rawLength = getNumericProperty(properties, ['FEATURE_LE']);
  const rawRightOfWayM = getNumericProperty(properties, ['FEATURE__1']);
  const rightOfWayM = deriveLinearRightOfWayM(rawRightOfWayM, rawLength);

  if (geometryType === 'L' || geometryType === 'LineString') {
    return {
      areaHa,
      perimeterKm,
      rightOfWayM,
      lengthKm: deriveLinearLengthKm(rawLength, rightOfWayM, areaHa),
    };
  }

  return {
    areaHa,
    perimeterKm,
    rightOfWayM,
    lengthKm: rawLength,
  };
};

const normalizeGeometryEntry = (
  geometry: any,
  featureIndex: number,
  sectionIdBase?: string | null,
  properties?: Record<string, unknown> | null,
): FlatGeometryEntry[] => {
  const normalizedSectionIdBase = sectionIdBase?.trim() || null;
  const sectionId = normalizedSectionIdBase || `${featureIndex + 1}`;

  if (!geometry?.type) {
    return [];
  }

  if (geometry.type === 'Polygon') {
    const sourceMetrics = extractSourceMetrics(geometry.type, properties);
    return [
      {
        geometry: {
          type: 'MultiPolygon',
          coordinates: [geometry.coordinates],
        },
        geometryTypeCode: 'P',
        sectionId,
        sourceMetrics,
      },
    ];
  }

  if (geometry.type === 'MultiPolygon') {
    const sourceMetrics = extractSourceMetrics(geometry.type, properties);
    return [
      {
        geometry,
        geometryTypeCode: 'P',
        sectionId,
        sourceMetrics,
      },
    ];
  }

  if (geometry.type === 'LineString') {
    const sourceMetrics = extractSourceMetrics(geometry.type, properties);
    return [
      {
        geometry,
        geometryTypeCode: 'L',
        sectionId,
        sourceMetrics,
      },
    ];
  }

  if (geometry.type === 'MultiLineString') {
    const sourceMetrics = extractSourceMetrics(geometry.type, properties);
    const coordinates = Array.isArray(geometry.coordinates)
      ? geometry.coordinates
      : [];

    return coordinates.map((lineCoordinates, lineIndex) => ({
      geometry: {
        type: 'LineString',
        coordinates: lineCoordinates,
      },
      geometryTypeCode: 'L',
      // Preserve per-line section IDs so each split line can be amended/retired independently.
      sectionId:
        coordinates.length > 1 ? `${sectionId}-${lineIndex + 1}` : sectionId,
      sourceMetrics,
    }));
  }

  throw new BadRequestException(
    `Unsupported geometry type: ${String(geometry.type)}`,
  );
};

@Injectable()
export class GeospatialService {
  private readonly logger = new Logger(GeospatialService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly sncscStatusRequestService: SncscStatusRequestService,
    private readonly exhibitAService: ExhibitAService,
  ) {}

  private get forestClientBaseUrl(): string {
    const value = process.env.FOREST_CLIENT_API_URL?.trim();
    if (!value) {
      throw new BadRequestException('FOREST_CLIENT_API_URL is not configured.');
    }

    return value.replace(/\/+$/, '');
  }

  private get forestClientHeaders(): Record<string, string> {
    const apiKey = process.env.FOREST_CLIENT_API_KEY?.trim();
    if (!apiKey) {
      throw new BadRequestException('FOREST_CLIENT_API_KEY is not configured.');
    }

    return {
      'X-API-KEY': apiKey,
      Accept: 'application/json',
    };
  }

  private async queryBcgsMapSheets(
    geometryWkt: string,
    spatialReference = 3005,
  ): Promise<{
    matches: MapSheetMatch[];
    rawFeatures: QueryResult['features'];
  }> {
    const params = new URLSearchParams({
      where: '1=1',
      geometry: geometryWkt,
      geometryType: 'esriGeometryPolygon',
      inSR: String(spatialReference),
      spatialRel: 'esriSpatialRelIntersects',
      outFields: '*',
      returnGeometry: 'false',
      f: 'json',
    });

    const response = await fetch(
      `${BCGS_MAP_SHEET_LAYER_URL}?${params.toString()}`,
      {
        headers: {
          Accept: 'application/json',
        },
      },
    );

    const bodyText = await response.text();
    if (!response.ok) {
      throw new BadRequestException(
        `Unable to query BCGS map sheets (${response.status} ${response.statusText}).`,
      );
    }

    let data: QueryResult & { error?: { message?: string } };
    try {
      data = bodyText
        ? (JSON.parse(bodyText) as QueryResult & {
            error?: { message?: string };
          })
        : { features: [] };
    } catch {
      throw new BadRequestException(
        'BCGS map sheet service returned invalid JSON.',
      );
    }

    if (data.error?.message) {
      throw new BadRequestException(data.error.message);
    }

    const rawFeatures = data.features ?? [];
    const matches = rawFeatures.map((feature) => {
      const attrs = feature.attributes ?? {};
      const key = BCGS_MAP_SHEET_CANDIDATE_KEYS.find(
        (candidate) => candidate in attrs,
      );

      return {
        mapSheet: key ? String(attrs[key]) : null,
        raw: attrs,
      };
    });

    return { matches, rawFeatures };
  }

  private filterValidMapSheets(matches: MapSheetMatch[]): string[] {
    return matches
      .map((match) => match.mapSheet)
      .filter((value): value is string => !!value && value.trim().length > 0);
  }

  private chooseBestMapSheet(
    matches: MapSheetMatch[],
    rawFeatures?: Array<{ attributes: Record<string, any> }>,
  ): string | null {
    const valid = matches.filter(
      (match) => !!match.mapSheet && match.mapSheet.trim().length > 0,
    );

    if (!valid.length) return null;

    if (!rawFeatures?.length) {
      return valid.at(0)?.mapSheet ?? null;
    }

    // Preserve match/feature index alignment, then rank by overlap area when available.
    const ranked = matches
      .map((match, index) => ({
        mapSheet: match.mapSheet?.trim() ? match.mapSheet : null,
        area:
          Number(
            rawFeatures[index]?.attributes?.SHAPE_AREA ??
              rawFeatures[index]?.attributes?.AREA ??
              0,
          ) || 0,
      }))
      .filter((item): item is { mapSheet: string; area: number } =>
        Boolean(item.mapSheet),
      );

    if (!ranked.length) {
      return valid.at(0)?.mapSheet ?? null;
    }

    ranked.sort((a, b) => b.area - a.area);
    return ranked.at(0)?.mapSheet ?? null;
  }

  private async getResourceGeometryEnvelopeWkt(
    rec_resource_id: string,
  ): Promise<string | null> {
    const rows = await this.prisma.$queryRaw<{ geometry_wkt: string | null }[]>(
      Prisma.sql`
        SELECT public.ST_AsText(
                 public.ST_Envelope(
                   public.ST_Collect(
                     CASE
                       WHEN public.ST_SRID(rmfg.geometry) = 0
                         THEN public.ST_SetSRID(rmfg.geometry, 3005)
                       ELSE rmfg.geometry
                     END
                   )
                 )
               ) AS geometry_wkt
        FROM rst.recreation_map_feature rmf
        INNER JOIN rst.recreation_map_feature_geom rmfg
          ON rmfg.rmf_skey = rmf.rmf_skey
        WHERE rmf.rec_resource_id = ${rec_resource_id}
          AND rmf.current_ind = 'Y'
          AND rmf.retirement_date IS NULL
      `,
    );

    return rows[0]?.geometry_wkt ?? null;
  }

  async getMapSheetsForExhibitA(rec_resource_id: string): Promise<{
    allMapSheets: string[];
    bestMapSheet: string | null;
  }> {
    const geometryWkt =
      await this.getResourceGeometryEnvelopeWkt(rec_resource_id);
    if (!geometryWkt) {
      return {
        allMapSheets: [],
        bestMapSheet: null,
      };
    }

    const { matches, rawFeatures } = await this.queryBcgsMapSheets(
      geometryWkt,
      3005,
    );
    const allMapSheets = this.filterValidMapSheets(matches);
    const bestMapSheet = this.chooseBestMapSheet(matches, rawFeatures);

    return {
      allMapSheets,
      bestMapSheet,
    };
  }

  async findGeospatialDataById(
    rec_resource_id: string,
  ): Promise<RecreationResourceGeospatialDto | null> {
    this.logger.log(
      `Fetching geospatial data for rec_resource_id: ${rec_resource_id}`,
    );

    const result: getRecreationResourceGeospatialData.Result[] =
      await this.prisma.$queryRawTyped(
        getRecreationResourceGeospatialData(rec_resource_id),
      );

    if (!result || result.length === 0) {
      return null;
    }

    const sessions =
      (await this.prisma.$queryRaw<{ section_id: string | null }[]>(Prisma.sql`
        SELECT section_id
        FROM rst.recreation_map_feature
        WHERE rec_resource_id = ${rec_resource_id}
          AND current_ind = 'Y'
          AND retirement_date IS NULL
      `)) ?? [];

    const data = result[0];
    if (!data) return null;

    const toNum = (v: unknown): number | null => (v != null ? Number(v) : null);

    return {
      rec_resource_id,
      spatial_feature_geometry: data.spatial_feature_geometry ?? undefined,
      total_length_km: toNum(data.total_length_km),
      total_area_hectares: toNum(data.total_area_hectares),
      right_of_way_m: toNum(data.right_of_way_m),
      site_point_geometry: data.site_point_geometry ?? undefined,
      utm_zone: data.utm_zone,
      utm_easting: data.utm_easting,
      utm_northing: data.utm_northing,
      latitude: data.latitude ? Number(data.latitude) : null,
      longitude: data.longitude ? Number(data.longitude) : null,
      section_ids: normalizeSectionIdsForComparison(
        sessions.map((session) => session.section_id),
      ),
    };
  }

  async updateGeospatialData(
    rec_resource_id: string,
    updateDto: UpdateRecreationResourceGeospatialDto,
  ): Promise<void> {
    this.logger.log(
      `Updating geospatial data for rec_resource_id: ${rec_resource_id}`,
    );

    await this.updateMapFeaturesFromValidatedFile(rec_resource_id, updateDto);

    // Treat null UTM values as "not provided" so right-of-way-only edits are not blocked.
    const hasUtmZoneInput =
      updateDto.utm_zone !== undefined && updateDto.utm_zone !== null;
    const hasUtmEastingInput =
      updateDto.utm_easting !== undefined && updateDto.utm_easting !== null;
    const hasUtmNorthingInput =
      updateDto.utm_northing !== undefined && updateDto.utm_northing !== null;
    const hasAnyUtmInput =
      hasUtmZoneInput || hasUtmEastingInput || hasUtmNorthingInput;

    let hasCompleteUtm = false;
    if (hasAnyUtmInput) {
      const existingGeospatial =
        await this.findGeospatialDataById(rec_resource_id);

      // Allow partial UTM edits by backfilling unspecified fields from the current values.
      const utmZone = hasUtmZoneInput
        ? (updateDto.utm_zone ?? null)
        : (existingGeospatial?.utm_zone ?? null);
      const utmEasting = hasUtmEastingInput
        ? (updateDto.utm_easting ?? null)
        : (existingGeospatial?.utm_easting ?? null);
      const utmNorthing = hasUtmNorthingInput
        ? (updateDto.utm_northing ?? null)
        : (existingGeospatial?.utm_northing ?? null);

      hasCompleteUtm =
        utmZone !== null && utmEasting !== null && utmNorthing !== null;

      if (!hasCompleteUtm) {
        throw new BadRequestException(
          'utm_zone, utm_easting, and utm_northing must be provided together, or left unchanged.',
        );
      }

      // At this point all three values are guaranteed to be non-null.
      const finalUtmZone = utmZone as number;
      const finalUtmEasting = utmEasting as number;
      const finalUtmNorthing = utmNorthing as number;

      await this.validateUtmAgainstFeatureGeometry(
        rec_resource_id,
        finalUtmZone,
        finalUtmEasting,
        finalUtmNorthing,
      );

      await this.upsertSitePointFromUtm(
        rec_resource_id,
        finalUtmZone,
        finalUtmEasting,
        finalUtmNorthing,
      );
    }

    const hasRightOfWay = Object.prototype.hasOwnProperty.call(
      updateDto,
      'right_of_way_m',
    );

    if (hasRightOfWay) {
      await this.prisma.$executeRaw(Prisma.sql`
        UPDATE rst.recreation_resource
        SET right_of_way = ${updateDto.right_of_way_m}::numeric
        WHERE rec_resource_id = ${rec_resource_id}
      `);
    }

    if (!hasAnyUtmInput && !hasRightOfWay) {
      this.logger.warn(
        `No UTM or right_of_way payload provided for rec_resource_id: ${rec_resource_id} - nothing updated.`,
      );
    }
  }

  private async insertMapFeatureAndGeometry(
    rmfSkey: number,
    rec_resource_id: string,
    sectionId: string,
    recreation_type_code: string | null,
    submitted_by: string | null,
    geometryTypeCode: 'P' | 'L',
    geometryEntry: Record<string, unknown>,
    sourceMetrics: FlatGeometryEntry['sourceMetrics'] | undefined,
    tx: Prisma.TransactionClient,
    options?: {
      amendmentId?: number;
      currentInd?: 'Y' | 'N';
      retirementDate?: Date | null;
      mapFeatureGuid?: string;
      featureRecordGuid?: string;
      copyGeometryFromRmfSkey?: number;
    },
  ): Promise<{
    rmfSkey: number;
    amendmentId: number;
    mapFeatureGuid: string;
    featureRecordGuid: string;
  }> {
    const amendmentId = options?.amendmentId ?? 0;
    const mapFeatureGuid = options?.mapFeatureGuid ?? randomUUID();
    const featureRecordGuid = options?.featureRecordGuid ?? randomUUID();
    const geometry = Prisma.sql`
            public.ST_SetSRID(
              public.ST_GeomFromGeoJSON(${JSON.stringify(geometryEntry)}),
              3005
          )
        `;

    await tx.$executeRaw(Prisma.sql`
      INSERT INTO rst.recreation_map_feature (
        rmf_skey,
        rec_resource_id,
        section_id,
        amendment_id,
        current_ind,
        recreation_resource_type,
        recreation_map_feature_guid,
        retirement_date,
        created_by,
        updated_by,
        amend_status_code
      )
      VALUES (
        ${rmfSkey},
        ${rec_resource_id},
        ${geometryTypeCode === 'P' ? null : sectionId},
        ${amendmentId},
        ${options?.currentInd ?? 'N'},
        ${recreation_type_code || null},
        ${mapFeatureGuid},
        ${options?.retirementDate ?? null},
        ${submitted_by || null},
        ${submitted_by || null},
        ${'PND'}
      )
    `);

    if (options?.copyGeometryFromRmfSkey) {
      await this.copyExistingGeometryToNewMapFeature(
        tx,
        options.copyGeometryFromRmfSkey,
        rmfSkey,
      );
    } else {
      await tx.$executeRaw(Prisma.sql`
        INSERT INTO rst.recreation_map_feature_geom (
          rmf_skey,
          geometry_type_code,
          geometry,
          feature_area,
          feature_length,
          feature_perimeter
        )
        SELECT
          ${rmfSkey},
          normalized.geometry_type_code,
          normalized.geom_3005,
          ${this.buildFeatureMetricColumnsSql()}
        FROM (
          SELECT
            CAST(${geometryTypeCode} AS varchar(1)) AS geometry_type_code,
            ${geometry} AS geom_3005,
            CAST(${sourceMetrics?.areaHa ?? null} AS numeric) AS source_area_ha,
            CAST(${sourceMetrics?.lengthKm ?? null} AS numeric) AS length_km,
            CAST(${sourceMetrics?.perimeterKm ?? null} AS numeric) AS source_perimeter_km,
            CAST(${sourceMetrics?.rightOfWayM ?? null} AS numeric) AS source_right_of_way_m
        ) AS normalized
      `);
    }

    return {
      rmfSkey,
      amendmentId,
      mapFeatureGuid,
      featureRecordGuid,
    };
  }

  private buildFeatureMetricColumnsSql(): Prisma.Sql {
    return Prisma.sql`
      CASE
        WHEN normalized.geometry_type_code = 'P'
          THEN COALESCE(
            normalized.source_area_ha,
            ROUND((public.ST_Area(normalized.geom_3005) / 10000)::numeric, 4)
          )
        WHEN normalized.geometry_type_code = 'L'
          THEN CASE
                 WHEN normalized.source_right_of_way_m IS NOT NULL AND normalized.length_km IS NOT NULL
                   THEN ROUND((normalized.length_km * normalized.source_right_of_way_m / 10)::numeric, 4)
                 ELSE NULL
               END
        ELSE NULL
      END,
      COALESCE(
        normalized.length_km,
        CASE
          WHEN normalized.geometry_type_code = 'L'
            THEN ROUND((public.ST_Length(normalized.geom_3005) / 1000)::numeric, 4)
          ELSE NULL
        END
      ),
      CASE
        WHEN normalized.geometry_type_code = 'P'
          THEN COALESCE(
            normalized.source_perimeter_km,
            ROUND((public.ST_Perimeter(normalized.geom_3005) / 1000)::numeric, 4)
          )
        ELSE NULL
      END
    `;
  }

  private async persistSpatialSubmissionMapFeatures(
    tx: Prisma.TransactionClient,
    input: {
      applicationGuid: string;
      recResourceId: string;
      recreationTypeCode: string | null;
      submittedBy: string | null;
      entries: SubmissionMapFeaturePersistEntry[];
    },
  ): Promise<void> {
    if (!tx.$queryRaw || !tx.$executeRaw) {
      this.logger.warn(
        'Skipping submission map feature persistence because the transaction does not expose raw query methods.',
      );
      return;
    }

    for (const entry of input.entries) {
      const purposeCode = entry.purposeCode ?? 'A';
      const featureBusinessIdentifier = entry.sectionId?.trim()
        ? `${input.recResourceId} SEC ${entry.sectionId.trim()}`
        : null;
      await tx.$executeRaw(Prisma.sql`
        INSERT INTO rst.recreation_spatial_submission_map_feature (
          application_guid,
          rec_resource_id,
          section_id,
          purpose_code,
          amend_status_code,
          amendment_id,
          recreation_resource_type,
          retirement_date,
          map_feature_guid,
          feature_record_guid,
          feature_business_identifier,
          rmf_skey,
          created_by,
          updated_by
        )
        VALUES (
          ${input.applicationGuid}::uuid,
          ${input.recResourceId},
          ${entry.geometryTypeCode === 'P' ? null : entry.sectionId},
          ${purposeCode},
          ${'PND'},
          ${entry.amendmentId},
          ${input.recreationTypeCode},
          ${purposeCode === 'R' ? new Date() : null},
          ${entry.mapFeatureGuid},
          ${entry.featureRecordGuid},
          ${featureBusinessIdentifier},
          ${entry.rmfSkey},
          ${input.submittedBy},
          ${input.submittedBy}
        )
      `);
    }
  }

  private async getNextRmfSkey(tx: Prisma.TransactionClient): Promise<number> {
    const rows = await tx.$queryRaw<{ max_rmf_skey: number | bigint }[]>(
      Prisma.sql`
        SELECT COALESCE(MAX(rmf_skey), 0) AS max_rmf_skey
        FROM rst.recreation_map_feature
      `,
    );

    return Number((rows ?? [])[0]?.max_rmf_skey ?? 0) + 1;
  }

  private async resolveCurrentMapFeatureForEntry(
    tx: Prisma.TransactionClient,
    recResourceId: string,
    entry: FlatGeometryEntry,
  ): Promise<{ rmf_skey: number; amendment_id: number | null } | null> {
    if (entry.geometryTypeCode === 'P') {
      // TODO: confirm polygon matching rule with tenure team.
      const rows =
        (await tx.$queryRaw<
          { rmf_skey: number; amendment_id: number | null }[]
        >(Prisma.sql`
        SELECT rmf.rmf_skey, rmf.amendment_id
        FROM rst.recreation_map_feature rmf
        WHERE rmf.rec_resource_id = ${recResourceId}
          AND rmf.current_ind = 'Y'
          AND rmf.section_id IS NULL
          AND rmf.retirement_date IS NULL
      `)) ?? [];

      if (rows.length > 1) {
        throw new BadRequestException(
          `Multiple current polygon rows exist for rec_resource_id ${recResourceId}; unable to resolve a single row for amendment/retire.`,
        );
      }

      return rows[0] ?? null;
    }

    const rows =
      (await tx.$queryRaw<
        { rmf_skey: number; amendment_id: number | null }[]
      >(Prisma.sql`
      SELECT rmf.rmf_skey, rmf.amendment_id
      FROM rst.recreation_map_feature rmf
      WHERE rmf.rec_resource_id = ${recResourceId}
        AND rmf.section_id = ${entry.sectionId}
        AND rmf.current_ind = 'Y'
        AND rmf.retirement_date IS NULL
      LIMIT 1
    `)) ?? [];

    return rows[0] ?? null;
  }

  private async getNextSubmissionAmendmentId(
    tx: Prisma.TransactionClient,
    recResourceId: string,
  ): Promise<number> {
    const rows = await tx.$queryRaw<{ next: number | bigint | null }[]>(
      Prisma.sql`
        SELECT COALESCE(MAX(amendment_id), -1) + 1 AS next
        FROM rst.recreation_map_feature
        WHERE rec_resource_id = ${recResourceId}
      `,
    );

    return Number(rows?.[0]?.next ?? 0);
  }

  private async copyExistingGeometryToNewMapFeature(
    tx: Prisma.TransactionClient,
    sourceRmfSkey: number,
    targetRmfSkey: number,
  ): Promise<void> {
    await tx.$executeRaw(Prisma.sql`
      INSERT INTO rst.recreation_map_feature_geom (
        rmf_skey,
        geometry_type_code,
        geometry,
        feature_area,
        feature_length,
        feature_perimeter
      )
      SELECT
        ${targetRmfSkey},
        rmfg.geometry_type_code,
        rmfg.geometry,
        rmfg.feature_area,
        rmfg.feature_length,
        rmfg.feature_perimeter
      FROM rst.recreation_map_feature_geom rmfg
      WHERE rmfg.rmf_skey = ${sourceRmfSkey}
    `);
  }

  private flattenFeatures(
    features: Array<
      | UpdateRecreationMapFeatureGeometryDto
      | {
          geometry: Record<string, unknown>;
          section_id?: string | null;
          properties?: Record<string, unknown> | null;
        }
    >,
  ): FlatGeometryEntry[] {
    return features.flatMap((feature, index) =>
      normalizeGeometryEntry(
        feature.geometry,
        index,
        feature.section_id,
        feature.properties ?? null,
      ),
    );
  }

  private countGeometryVertices(coordinates: unknown): number {
    if (
      Array.isArray(coordinates) &&
      coordinates.length >= 2 &&
      typeof coordinates[0] === 'number' &&
      typeof coordinates[1] === 'number'
    ) {
      return 1;
    }

    if (!Array.isArray(coordinates)) {
      return 0;
    }

    return coordinates.reduce(
      (vertexCount, entry) => vertexCount + this.countGeometryVertices(entry),
      0,
    );
  }

  private logFlattenedFeatures(
    recResourceId: string,
    label: 'new' | 'amended',
    entries: FlatGeometryEntry[],
  ): void {
    for (const entry of entries) {
      const geometryType = entry.geometry?.['type'];
      const geometryCoordinates = entry.geometry?.['coordinates'];
      this.logger.log(
        `Flattened ${label} feature for rec_resource_id=${recResourceId}: section_id="${entry.sectionId}", geometry_type=${String(geometryType ?? 'UNKNOWN')}, vertex_count=${this.countGeometryVertices(geometryCoordinates)}`,
      );
    }
  }

  private ensureNewGeometriesDifferFromRetired(
    newEntries: FlatGeometryEntry[],
    retiredEntries: FlatGeometryEntry[],
  ): void {
    const retiredSectionIdsByGeometryHash = new Map<string, Set<string>>();

    for (const retiredEntry of retiredEntries) {
      const geometryHash = createHash('sha256')
        .update(JSON.stringify(retiredEntry.geometry))
        .digest('hex');
      const retiredSectionId = retiredEntry.sectionId.trim();
      const sectionIdsForGeometry =
        retiredSectionIdsByGeometryHash.get(geometryHash) ?? new Set<string>();
      sectionIdsForGeometry.add(retiredSectionId);
      retiredSectionIdsByGeometryHash.set(geometryHash, sectionIdsForGeometry);
    }

    for (const newEntry of newEntries) {
      const geometryHash = createHash('sha256')
        .update(JSON.stringify(newEntry.geometry))
        .digest('hex');
      const retiredSectionIds =
        retiredSectionIdsByGeometryHash.get(geometryHash);

      if (!retiredSectionIds || retiredSectionIds.size === 0) {
        continue;
      }

      // Allow explicit retire-and-reinsert for the same section_id.
      if (retiredSectionIds.has(newEntry.sectionId.trim())) {
        continue;
      }

      throw new BadRequestException(
        `New feature section_id "${newEntry.sectionId}" has geometry identical to retired feature section_id(s): ${Array.from(
          retiredSectionIds,
        ).join(', ')}.`,
      );
    }
  }

  private deriveStatusRequestTypeCode(
    entries: FlatGeometryEntry[],
  ): SpatialSubmissionTypeCode {
    return entries.some((entry) => entry.geometryTypeCode === 'L')
      ? 'RL'
      : 'RPO';
  }

  private derivePurposeCodeForUpdate(
    newCount: number,
    amendedCount: number,
    retiredCount: number,
  ): SpatialSubmissionPurposeCode | null {
    if (newCount === 0 && amendedCount === 0 && retiredCount === 0) {
      return null;
    }
    return 'A';
  }

  private async resolveOrgUnitCode(
    rec_resource_id: string,
    tx: Prisma.TransactionClient,
    fallbackOrgUnitCode?: string | null,
  ): Promise<string> {
    if (fallbackOrgUnitCode?.trim()) {
      return fallbackOrgUnitCode.trim();
    }

    const naturalUnit = await tx.natural_resource_org_unit.findUnique({
      where: { rec_resource_id },
      select: { org_unit_code: true },
    });

    if (naturalUnit?.org_unit_code?.trim()) {
      return naturalUnit.org_unit_code.trim();
    }

    const latestSubmission =
      await tx.recreation_spatial_submission?.findFirst?.({
        where: { tenure_id: rec_resource_id },
        orderBy: { created_at: 'desc' },
        select: { org_unit_code: true },
      });

    if (latestSubmission?.org_unit_code?.trim()) {
      return latestSubmission.org_unit_code.trim();
    }

    return '';
  }

  private async resolveOrgUnitClientInfo(
    orgUnitCode: string,
  ): Promise<OrgUnitClientInfo> {
    return this.fetchClientInfoByAcronym(orgUnitCode.trim());
  }

  private async fetchClientInfoByAcronym(
    acronym: string,
  ): Promise<OrgUnitClientInfo> {
    const query = new URLSearchParams({ acronym });
    const response = await fetch(
      `${this.forestClientBaseUrl}/api/clients/findByAcronym?${query.toString()}`,
      {
        headers: this.forestClientHeaders,
      },
    );

    const bodyText = await response.text();
    if (!response.ok) {
      throw new BadRequestException(
        `Unable to resolve client info from Forest Client API for org unit code: ${acronym}`,
      );
    }

    let records: ForestClientByAcronymDto[] = [];
    try {
      records = bodyText
        ? (JSON.parse(bodyText) as ForestClientByAcronymDto[])
        : [];
    } catch {
      throw new BadRequestException(
        `Forest Client API returned invalid JSON for org unit code: ${acronym}`,
      );
    }
    const normalizedAcronym = acronym.trim().toUpperCase();

    const match = records.find(
      (record) =>
        record.acronym?.toUpperCase() === normalizedAcronym &&
        record.clientNumber?.trim() &&
        record.clientName?.trim(),
    );

    if (!match?.clientNumber || !match.clientName) {
      throw new BadRequestException(
        `No client mapping was returned by Forest Client API for org unit code: ${acronym}`,
      );
    }

    return {
      client_number: match.clientNumber,
      client_name: match.clientName,
    };
  }

  private buildFeatureGeoJson(
    geometry: Record<string, unknown>,
  ): Record<string, unknown> {
    return {
      ...geometry,
      crs: BC_ALBERS_CRS,
    };
  }

  /** SNCSC expects linear geometries as LineString, not MultiLineString. */
  private toSncscLineStrings(
    geometry: Record<string, unknown>,
  ): Record<string, unknown>[] {
    const type = geometry.type;
    if (type === 'LineString') {
      return [geometry];
    }

    if (type === 'MultiLineString') {
      const coordinates = Array.isArray(geometry.coordinates)
        ? geometry.coordinates
        : [];

      if (coordinates.length === 0) {
        return [{ type: 'LineString', coordinates: [] }];
      }

      return coordinates.map((lineCoords) => ({
        type: 'LineString',
        coordinates: lineCoords,
      }));
    }

    return [geometry];
  }

  private async buildFeatureRequestElements(
    queryClient: Pick<Prisma.TransactionClient, '$queryRaw'>,
    applicationGuid: string,
  ): Promise<FeatureRequestElement[]> {
    const featureRows = await queryClient.$queryRaw<
      SubmissionSnapshotFeatureRow[]
    >(
      Prisma.sql`
      SELECT
        rssmf.section_id,
        rssmf.purpose_code,
        rssmf.map_feature_guid,
        rssmf.feature_record_guid,
        rssmf.feature_business_identifier,
        rssmf.recreation_resource_type,
        rrtc.description AS recreation_resource_type_description,
        rmfg.geometry_type_code,
        public.ST_AsGeoJSON(
          CASE
            WHEN public.ST_SRID(rmfg.geometry) = 0
              THEN public.ST_SetSRID(rmfg.geometry, 3005)
            ELSE rmfg.geometry
          END
        ) AS geometry_json
      FROM rst.recreation_spatial_submission_map_feature rssmf
      INNER JOIN rst.recreation_map_feature rmf
        ON rmf.rmf_skey = rssmf.rmf_skey
      INNER JOIN rst.recreation_map_feature_geom rmfg
        ON rmfg.rmf_skey = rmf.rmf_skey
      LEFT JOIN rst.recreation_resource_type_code rrtc
        ON rrtc.rec_resource_type_code = rssmf.recreation_resource_type
      WHERE rssmf.application_guid = ${applicationGuid}::uuid
      ORDER BY rssmf.rssmf_skey
    `,
    );

    if (!featureRows.length) {
      return [];
    }

    const elements: FeatureRequestElement[] = [];
    const usedMapFeatureGuids = new Set<string>();

    const reserveUniqueMapFeatureGuid = (preferredGuid: string): string => {
      if (!usedMapFeatureGuids.has(preferredGuid)) {
        usedMapFeatureGuids.add(preferredGuid);
        return preferredGuid;
      }

      let candidate = randomUUID();
      while (usedMapFeatureGuids.has(candidate)) {
        candidate = randomUUID();
      }

      usedMapFeatureGuids.add(candidate);
      return candidate;
    };

    for (const row of featureRows) {
      const mapFeatureGuid = row.map_feature_guid?.trim() || randomUUID();
      const featureRecordGuid = row.feature_record_guid?.trim() || randomUUID();

      const parsedGeometry = row.geometry_json
        ? (JSON.parse(row.geometry_json) as Record<string, unknown>)
        : null;
      if (!parsedGeometry) {
        continue;
      }
      const normalizedGeometryTypeCode = (
        row.geometry_type_code ||
        (typeof parsedGeometry.type === 'string'
          ? parsedGeometry.type.startsWith('MultiPolygon') ||
            parsedGeometry.type === 'Polygon'
            ? 'P'
            : parsedGeometry.type.startsWith('MultiLineString') ||
                parsedGeometry.type === 'LineString'
              ? 'L'
              : ''
          : '') ||
        ''
      ).toUpperCase();
      const isPolygon = normalizedGeometryTypeCode === 'P';
      const geometryPayload = this.buildFeatureGeoJson(parsedGeometry);

      if (isPolygon) {
        const uniqueMapFeatureGuid =
          reserveUniqueMapFeatureGuid(mapFeatureGuid);

        elements.push({
          '@type': 'FeatureRequestResource',
          mapFeatureGuid: uniqueMapFeatureGuid,
          featureRecordGuid,
          featureGeometryTypeCode: 'polygon',
          mapFeatureTypeCode: row.recreation_resource_type || '',
          featureName: row.recreation_resource_type_description?.trim() || null,
          sourceSectionId: row.section_id?.trim() || undefined,
          sourcePurposeCode: row.purpose_code,
          sourceFeatureBusinessIdentifier: row.feature_business_identifier,
          polygon: geometryPayload,
        });
      } else {
        const lineStrings = this.toSncscLineStrings(parsedGeometry);
        lineStrings.forEach((lineString, lineIndex) => {
          const preferredMapFeatureGuid =
            lineIndex === 0 ? mapFeatureGuid : randomUUID();
          const uniqueMapFeatureGuid = reserveUniqueMapFeatureGuid(
            preferredMapFeatureGuid,
          );

          elements.push({
            '@type': 'FeatureRequestResource',
            mapFeatureGuid: uniqueMapFeatureGuid,
            featureRecordGuid:
              lineIndex === 0 ? featureRecordGuid : randomUUID(),
            featureGeometryTypeCode: 'line',
            mapFeatureTypeCode: row.recreation_resource_type || '',
            featureName:
              row.recreation_resource_type_description?.trim() || null,
            sourceSectionId: row.section_id?.trim() || undefined,
            sourcePurposeCode: row.purpose_code,
            sourceFeatureBusinessIdentifier: row.feature_business_identifier,
            line: this.buildFeatureGeoJson(lineString),
          });
        });
      }
    }

    return elements;
  }

  private async dispatchSncscStatusRequest(
    tx: Prisma.TransactionClient,
    submission: CreatedSpatialSubmission,
  ): Promise<void> {
    this.logger.log(
      `Dispatching SNCSC status request for submission_id: ${submission.submission_id}, tenure_id: ${submission.tenure_id}, type: ${submission.status_request_type_code}`,
    );

    const client = await this.resolveOrgUnitClientInfo(
      submission.org_unit_code,
    );
    const featureRequests = await this.buildFeatureRequestElements(
      tx,
      submission.application_guid,
    );

    this.logger.log(
      `Prepared ${featureRequests.length} SNCSC feature request element(s) for submission_id: ${submission.submission_id}`,
    );

    // SNCSC amendment payloads only accept active purpose actions.
    const outboundPurposeCode: 'N' | 'A' =
      submission.purpose_code === 'N' ? 'N' : 'A';

    const featureRequestsPayload = featureRequests
      .map((featureRequest) => {
        const {
          sourceSectionId,
          sourcePurposeCode,
          sourceFeatureBusinessIdentifier,
          ...baseElement
        } = featureRequest;
        const trimmedSectionId = sourceSectionId?.trim();
        const normalizedSourcePurposeCode =
          sourcePurposeCode && ['N', 'A', 'R'].includes(sourcePurposeCode)
            ? sourcePurposeCode
            : null;

        if (normalizedSourcePurposeCode === 'R') {
          return null;
        }

        const featurePurposeCode =
          normalizedSourcePurposeCode ?? outboundPurposeCode;
        const featureBusinessIdentifier =
          baseElement.featureGeometryTypeCode === 'polygon'
            ? submission.tenure_id
            : sourceFeatureBusinessIdentifier?.trim() ||
              (trimmedSectionId
                ? `${submission.tenure_id} SEC ${trimmedSectionId}`
                : undefined);

        return {
          ...baseElement,
          ...(featureBusinessIdentifier ? { featureBusinessIdentifier } : {}),
          ...(featurePurposeCode ? { featurePurposeCode } : {}),
        };
      })
      .filter((featureRequest) => featureRequest !== null);

    const filteredRetiredCount =
      featureRequests.length - featureRequestsPayload.length;
    if (filteredRetiredCount > 0) {
      this.logger.log(
        `Filtered ${filteredRetiredCount} retired feature request(s) from SNCSC payload for submission_id: ${submission.submission_id}`,
      );
    }

    const payload: Record<string, unknown> = {
      '@type': 'StatusRequestResource',
      applicationGUID: submission.application_guid,
      tenureGuid: toDeterministicUuid(submission.tenure_id),
      tenureId: submission.tenure_id,
      clientNumber: client.client_number,
      clientName: client.client_name,
      adjudicationInd: 'Y',
      externalSubmissionID: submission.submission_id,
      businessArea: 'S',
      statusRequestTypeCode: submission.status_request_type_code,
      statusClearanceStatusCode: 'PENDING',
      orgUnitCode: submission.org_unit_code,
      purposeCode: outboundPurposeCode,
      bctsSubmissionInd: 'N',
      featureRequests: {
        '@type': 'FeatureRequestResources',
        elements: featureRequestsPayload,
      },
    };

    this.validateSncscPayloadTypes(payload);

    try {
      const statusRequestGuid =
        await this.sncscStatusRequestService.createStatusRequest(payload);

      if (statusRequestGuid) {
        await tx.recreation_spatial_submission.update({
          where: { application_guid: submission.application_guid },
          data: {
            status_request_guid: statusRequestGuid,
            updated_by: 'system',
          },
        });
      } else {
        this.logger.warn(
          `SNCSC status request response did not include a status request guid for submission_id: ${submission.submission_id}`,
        );
      }

      this.logger.log(
        `SNCSC status request dispatched successfully for submission_id: ${submission.submission_id}`,
      );
    } catch (error) {
      this.logger.error(
        `SNCSC status request dispatch failed for submission_id: ${submission.submission_id}, tenure_id: ${submission.tenure_id}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    }
  }

  private validateSncscPayloadTypes(payload: Record<string, unknown>): void {
    if (payload['@type'] !== 'StatusRequestResource') {
      throw new BadRequestException(
        "SNCSC payload is missing required '@type' = 'StatusRequestResource'.",
      );
    }

    const featureRequests = payload.featureRequests as
      | Record<string, unknown>
      | undefined;
    if (!featureRequests) {
      throw new BadRequestException(
        'SNCSC payload is missing featureRequests.',
      );
    }

    if (featureRequests['@type'] !== 'FeatureRequestResources') {
      throw new BadRequestException(
        "SNCSC payload featureRequests is missing required '@type' = 'FeatureRequestResources'.",
      );
    }

    const elements = featureRequests.elements;
    if (!Array.isArray(elements)) {
      throw new BadRequestException(
        'SNCSC payload featureRequests.elements must be an array.',
      );
    }

    elements.forEach((element, index) => {
      const typedElement = element as Record<string, unknown>;
      if (typedElement['@type'] !== 'FeatureRequestResource') {
        throw new BadRequestException(
          `SNCSC payload featureRequests.elements[${index}] is missing required '@type' = 'FeatureRequestResource'.`,
        );
      }
    });
  }

  private generateSevenDigitSubmissionId(): string {
    return randomInt(1000000, 10000000).toString();
  }

  private isSubmissionIdUniqueConflict(error: unknown): boolean {
    if (!(error instanceof Prisma.PrismaClientKnownRequestError)) {
      return false;
    }

    if (error.code !== 'P2002') {
      return false;
    }

    const target = error.meta?.target;
    if (Array.isArray(target)) {
      return target.includes('submission_id');
    }

    return typeof target === 'string' && target.includes('submission_id');
  }

  private async createSpatialSubmission(
    tx: Prisma.TransactionClient,
    data: {
      rec_resource_id: string;
      statusRequestTypeCode: SpatialSubmissionTypeCode;
      purposeCode: SpatialSubmissionPurposeCode;
      recreationTypeCode?: string | null;
      submittedBy?: string | null;
      orgUnitCode?: string | null;
    },
  ): Promise<CreatedSpatialSubmission | null> {
    const orgUnitCode = await this.resolveOrgUnitCode(
      data.rec_resource_id,
      tx,
      data.orgUnitCode,
    );

    if (!orgUnitCode.trim()) {
      return null;
    }

    const spatialSubmissionModel = tx.recreation_spatial_submission;
    if (!spatialSubmissionModel?.create) {
      this.logger.warn(
        `Skipping spatial submission for rec_resource_id: ${data.rec_resource_id} because the transaction does not expose recreation_spatial_submission.create.`,
      );
      return null;
    }

    const maxAttempts = 10;
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        return await spatialSubmissionModel.create({
          data: {
            submission_id: this.generateSevenDigitSubmissionId(),
            tenure_id: data.rec_resource_id,
            status_request_type_code: data.statusRequestTypeCode,
            purpose_code: data.purposeCode,
            recreation_resource_type: data.recreationTypeCode || null,
            submission_date: new Date(),
            org_unit_code: orgUnitCode,
            created_by: data.submittedBy || null,
            updated_by: data.submittedBy || null,
          },
          select: {
            application_guid: true,
            submission_id: true,
            tenure_id: true,
            org_unit_code: true,
            status_request_type_code: true,
            purpose_code: true,
          },
        });
      } catch (error) {
        if (this.isSubmissionIdUniqueConflict(error)) {
          if (attempt < maxAttempts - 1) {
            continue;
          }
          break;
        }
        throw error;
      }
    }

    throw new ConflictException(
      'Unable to generate a unique 7-digit submission ID.',
    );
  }

  /**
   * Update map feature rows and geometry rows from a validated shapefile payload.
   * Updates only recreation_map_feature and recreation_map_feature_geom records.
   */
  async updateMapFeaturesFromValidatedFile(
    rec_resource_id: string,
    payload: UpdateRecreationResourceGeospatialDto,
  ): Promise<void> {
    const newFeatures = payload.newFeatures ?? [];
    const amendedFeatures = payload.amendedFeatures ?? [];
    const retiredFeatures = payload.retiredFeatures ?? [];

    let autoGenerateApplicationGuid: string | null = null;

    await this.prisma.$transaction(
      async (tx) => {
        await tx.$executeRawUnsafe(
          "SELECT pg_advisory_xact_lock(hashtext('rst.recreation_map_feature'))",
        );

        let flattenedNewEntries: FlatGeometryEntry[] =
          this.flattenFeatures(newFeatures);
        let flattenedAmendedEntries: FlatGeometryEntry[] =
          this.flattenFeatures(amendedFeatures);
        const flattenedRetiredEntries: FlatGeometryEntry[] =
          this.flattenFeatures(retiredFeatures);
        this.logFlattenedFeatures(rec_resource_id, 'new', flattenedNewEntries);
        this.logFlattenedFeatures(
          rec_resource_id,
          'amended',
          flattenedAmendedEntries,
        );
        this.ensureNewGeometriesDifferFromRetired(
          flattenedNewEntries,
          flattenedRetiredEntries,
        );
        this.logger.log(
          `Creating ${newFeatures.length} map feature(s) for rec_resource_id: ${rec_resource_id}`,
        );

        const hasActiveMapFeatureRows =
          (await tx.$queryRaw<{ rmf_skey: number }[]>(Prisma.sql`
            SELECT rmf_skey
            FROM rst.recreation_map_feature
            WHERE rec_resource_id = ${rec_resource_id}
              AND retirement_date IS NULL
              AND current_ind = 'Y'
            LIMIT 1
          `)) ?? [];

        if (
          hasActiveMapFeatureRows.length === 0 &&
          flattenedNewEntries.length === 0 &&
          flattenedAmendedEntries.length > 0 &&
          flattenedRetiredEntries.length === 0
        ) {
          this.logger.warn(
            `No active map features found for rec_resource_id: ${rec_resource_id}; treating amended features as new inserts.`,
          );
          flattenedNewEntries = [...flattenedAmendedEntries];
          flattenedAmendedEntries = [];
        }

        let nextRmfSkey = await this.getNextRmfSkey(tx);
        const submissionAmendmentId = await this.getNextSubmissionAmendmentId(
          tx,
          rec_resource_id,
        );
        const nextSkey = () => {
          const value = nextRmfSkey;
          nextRmfSkey += 1;
          return value;
        };

        const persistedSubmissionEntries: SubmissionMapFeaturePersistEntry[] =
          [];

        const hasCurrentRows = hasActiveMapFeatureRows.length > 0;

        for (const entry of flattenedNewEntries) {
          await this.resolveCurrentMapFeatureForEntry(
            tx,
            rec_resource_id,
            entry,
          );

          const inserted = await this.insertMapFeatureAndGeometry(
            nextSkey(),
            rec_resource_id,
            entry.sectionId,
            payload.recreation_type_code || null,
            payload.submitted_by || null,
            entry.geometryTypeCode,
            entry.geometry,
            entry.sourceMetrics,
            tx,
            {
              amendmentId: hasCurrentRows ? submissionAmendmentId : 0,
              currentInd: 'N',
            },
          );

          persistedSubmissionEntries.push({
            ...entry,
            purposeCode: 'N',
            ...inserted,
          });
        }

        this.logger.log(
          `Updating ${amendedFeatures.length} map feature(s) for rec_resource_id: ${rec_resource_id}`,
        );
        for (const entry of flattenedAmendedEntries) {
          const currentRow = await this.resolveCurrentMapFeatureForEntry(
            tx,
            rec_resource_id,
            entry,
          );

          if (!currentRow?.rmf_skey) {
            throw new BadRequestException(
              `No current map feature found for amendment on rec_resource_id ${rec_resource_id}, section_id ${entry.sectionId}.`,
            );
          } else {
            const inserted = await this.insertMapFeatureAndGeometry(
              nextSkey(),
              rec_resource_id,
              entry.sectionId,
              payload.recreation_type_code || null,
              payload.submitted_by || null,
              entry.geometryTypeCode,
              entry.geometry,
              entry.sourceMetrics,
              tx,
              {
                amendmentId: submissionAmendmentId,
                currentInd: 'N',
              },
            );

            persistedSubmissionEntries.push({
              ...entry,
              purposeCode: 'A',
              ...inserted,
            });
          }
        }

        this.logger.log(
          `Retiring ${retiredFeatures.length} map feature(s) for rec_resource_id: ${rec_resource_id}`,
        );
        for (const entry of flattenedRetiredEntries) {
          const currentRow = await this.resolveCurrentMapFeatureForEntry(
            tx,
            rec_resource_id,
            entry,
          );

          if (!currentRow?.rmf_skey) {
            throw new BadRequestException(
              `No current map feature found for retirement on rec_resource_id ${rec_resource_id}, section_id ${entry.sectionId}.`,
            );
          } else {
            const retired = await this.insertMapFeatureAndGeometry(
              nextSkey(),
              rec_resource_id,
              entry.sectionId,
              payload.recreation_type_code || null,
              payload.submitted_by || null,
              entry.geometryTypeCode,
              entry.geometry,
              entry.sourceMetrics,
              tx,
              {
                amendmentId: submissionAmendmentId,
                currentInd: 'N',
                retirementDate: new Date(),
                copyGeometryFromRmfSkey: currentRow.rmf_skey,
              },
            );

            persistedSubmissionEntries.push({
              ...entry,
              purposeCode: 'R',
              ...retired,
            });
          }
        }

        const allSubmissionEntries = persistedSubmissionEntries;
        const purposeCode = this.derivePurposeCodeForUpdate(
          flattenedNewEntries.length,
          flattenedAmendedEntries.length,
          flattenedRetiredEntries.length,
        );

        if (allSubmissionEntries.length > 0 && purposeCode) {
          const createdSubmission = await this.createSpatialSubmission(tx, {
            rec_resource_id,
            statusRequestTypeCode:
              this.deriveStatusRequestTypeCode(allSubmissionEntries),
            purposeCode,
            recreationTypeCode: payload.recreation_type_code || null,
            submittedBy: payload.submitted_by || null,
          });

          if (createdSubmission) {
            autoGenerateApplicationGuid = createdSubmission.application_guid;
            await this.persistSpatialSubmissionMapFeatures(tx, {
              applicationGuid: createdSubmission.application_guid,
              recResourceId: rec_resource_id,
              recreationTypeCode: payload.recreation_type_code || null,
              submittedBy: payload.submitted_by || null,
              entries: allSubmissionEntries,
            });

            await this.dispatchSncscStatusRequest(tx, createdSubmission);
          }
        }
      },
      {
        timeout: INTERACTIVE_TRANSACTION_TIMEOUT_MS,
        maxWait: INTERACTIVE_TRANSACTION_MAX_WAIT_MS,
      },
    );

    if (autoGenerateApplicationGuid) {
      void this.exhibitAService
        .autoGenerateForApplicationGuid(
          autoGenerateApplicationGuid,
          payload.submitted_by?.trim() || 'system',
        )
        .catch((error) => {
          this.logger.warn(
            `Automatic Exhibit A generation failed for application_guid=${autoGenerateApplicationGuid}: ${error instanceof Error ? error.message : 'unknown error'}`,
          );
        });
    }
  }

  /**
   * Create map feature rows and geometry rows from a validated shapefile payload.
   * Inserts only recreation_map_feature and recreation_map_feature_geom records.
   */
  async createMapFeaturesFromValidatedFile(
    rec_resource_id: string,
    payload: CreateRecreationMapFeaturesDto,
  ): Promise<void> {
    if (!payload.features?.length) {
      throw new BadRequestException(
        'At least one validated feature is required.',
      );
    }

    this.logger.log(
      `Creating ${payload.features.length} map feature(s) for rec_resource_id: ${rec_resource_id}`,
    );

    let autoGenerateApplicationGuid: string | null = null;

    await this.prisma.$transaction(
      async (tx) => {
        await tx.$executeRawUnsafe(
          "SELECT pg_advisory_xact_lock(hashtext('rst.recreation_map_feature'))",
        );

        const existingResource = await tx.recreation_resource.findUnique({
          where: { rec_resource_id },
          select: {
            rec_resource_id: true,
            district_code: true,
            name: true,
          },
        });

        if (!existingResource) {
          await tx.recreation_resource.create({
            data: {
              rec_resource_id,
              name: payload.rec_resource_name || null,
              district_code: payload.recreation_district_code || null,
              rec_status_code: 'PE',
              created_by: payload.submitted_by || null,
            },
          });
        } else {
          const resourcePatch: {
            district_code?: string;
            name?: string;
          } = {};

          if (
            payload.recreation_district_code &&
            !existingResource.district_code
          ) {
            resourcePatch.district_code = payload.recreation_district_code;
          }

          if (payload.rec_resource_name?.trim()) {
            resourcePatch.name = payload.rec_resource_name.trim();
          }

          if (Object.keys(resourcePatch).length) {
            await tx.recreation_resource.update({
              where: { rec_resource_id },
              data: resourcePatch,
            });
          }
        }

        if (payload.natural_resource_district_code) {
          const existingNaturalUnit =
            await tx.natural_resource_org_unit.findUnique({
              where: { rec_resource_id },
              select: { rec_resource_id: true },
            });

          if (!existingNaturalUnit) {
            const naturalUnitTemplate =
              await tx.natural_resource_org_unit.findFirst({
                where: {
                  org_unit_code: payload.natural_resource_district_code,
                },
                orderBy: {
                  effective_date: 'desc',
                },
              });

            if (naturalUnitTemplate) {
              await tx.natural_resource_org_unit.create({
                data: {
                  rec_resource_id,
                  org_unit_no: naturalUnitTemplate.org_unit_no,
                  org_unit_code: naturalUnitTemplate.org_unit_code,
                  org_unit_name: naturalUnitTemplate.org_unit_name,
                  location_code: naturalUnitTemplate.location_code,
                  org_level_code: naturalUnitTemplate.org_level_code,
                  office_name_code: naturalUnitTemplate.office_name_code,
                  region_no: naturalUnitTemplate.region_no,
                  region_code: naturalUnitTemplate.region_code,
                  district_no: naturalUnitTemplate.district_no,
                  district_code: naturalUnitTemplate.district_code,
                  effective_date: naturalUnitTemplate.effective_date,
                  expiry_date: naturalUnitTemplate.expiry_date,
                  updated_at: new Date(),
                },
              });
            } else {
              this.logger.warn(
                `No natural_resource_org_unit template found for code ${payload.natural_resource_district_code}; skipping natural district seed for rec_resource_id: ${rec_resource_id}`,
              );
            }
          }
        }

        const existingMapFeature = await tx.recreation_map_feature.findFirst({
          where: { rec_resource_id },
          select: { rmf_skey: true },
        });

        if (existingMapFeature) {
          throw new ConflictException(
            'Map features already exist for this recreation resource.',
          );
        }

        const flattenedEntries: FlatGeometryEntry[] = this.flattenFeatures(
          payload.features,
        );

        if (!flattenedEntries.length) {
          throw new BadRequestException('No supported geometries were found.');
        }

        let nextRmfSkey = await this.getNextRmfSkey(tx);

        const persistedSubmissionEntries: SubmissionMapFeaturePersistEntry[] =
          [];

        for (const entry of flattenedEntries) {
          const rmfSkey = nextRmfSkey;
          nextRmfSkey += 1;

          const inserted = await this.insertMapFeatureAndGeometry(
            rmfSkey,
            rec_resource_id,
            entry.sectionId,
            payload.recreation_type_code || null,
            payload.submitted_by || null,
            entry.geometryTypeCode,
            entry.geometry,
            entry.sourceMetrics,
            tx,
            {
              amendmentId: 0,
              currentInd: 'Y',
            },
          );

          persistedSubmissionEntries.push({
            ...entry,
            purposeCode: 'N',
            ...inserted,
          });
        }

        const createdSubmission = await this.createSpatialSubmission(tx, {
          rec_resource_id,
          statusRequestTypeCode:
            this.deriveStatusRequestTypeCode(flattenedEntries),
          purposeCode: 'N',
          recreationTypeCode: payload.recreation_type_code || null,
          submittedBy: payload.submitted_by || null,
          orgUnitCode: payload.natural_resource_district_code || null,
        });

        if (createdSubmission) {
          autoGenerateApplicationGuid = createdSubmission.application_guid;
          await this.persistSpatialSubmissionMapFeatures(tx, {
            applicationGuid: createdSubmission.application_guid,
            recResourceId: rec_resource_id,
            recreationTypeCode: payload.recreation_type_code || null,
            submittedBy: payload.submitted_by || null,
            entries: persistedSubmissionEntries,
          });

          await this.dispatchSncscStatusRequest(tx, createdSubmission);
        }
      },
      {
        timeout: INTERACTIVE_TRANSACTION_TIMEOUT_MS,
        maxWait: INTERACTIVE_TRANSACTION_MAX_WAIT_MS,
      },
    );

    if (autoGenerateApplicationGuid) {
      void this.exhibitAService
        .autoGenerateForApplicationGuid(
          autoGenerateApplicationGuid,
          payload.submitted_by?.trim() || 'system',
        )
        .catch((error) => {
          this.logger.warn(
            `Automatic Exhibit A generation failed for application_guid=${autoGenerateApplicationGuid}: ${error instanceof Error ? error.message : 'unknown error'}`,
          );
        });
    }
  }

  /**
   * Validates that the UTM point is within 10 m of a linear spatial feature
   * (trail) or inside a polygon spatial feature for the given resource.
   * If the resource has no spatial features the check is skipped.
   * Throws BadRequestException when the point falls outside the feature.
   */
  private async validateUtmAgainstFeatureGeometry(
    rec_resource_id: string,
    utmZone: number,
    easting: number,
    northing: number,
  ): Promise<void> {
    const epsg = 32600 + Math.trunc(utmZone);

    const rows = await this.prisma.$queryRaw<
      { feature_count: bigint; passes_check: boolean | null }[]
    >(Prisma.sql`
      SELECT
        count(*) AS feature_count,
        bool_or(
          CASE
            WHEN public.ST_GeometryType(geom_3005) IN ('ST_LineString', 'ST_MultiLineString')
              THEN public.ST_DWithin(utm_pt, geom_3005, 10)
            WHEN public.ST_GeometryType(geom_3005) IN ('ST_Polygon', 'ST_MultiPolygon')
              THEN public.ST_Within(utm_pt, geom_3005)
            ELSE false
          END
        ) AS passes_check
      FROM rst.recreation_map_feature rmf
      INNER JOIN rst.recreation_map_feature_geom rmfg USING (rmf_skey)
      CROSS JOIN LATERAL (
        SELECT
          -- Normalise stored geometry: treat SRID=0 as 3005 (BC Albers)
          CASE WHEN public.ST_SRID(rmfg.geometry) = 0
            THEN public.ST_SetSRID(rmfg.geometry, 3005)
            ELSE rmfg.geometry
          END AS geom_3005,
          public.ST_Transform(
            public.ST_SetSRID(public.ST_MakePoint(${easting}::float8, ${northing}::float8), ${epsg}::integer),
            3005
          ) AS utm_pt
      ) coords
      WHERE rmf.rec_resource_id = ${rec_resource_id}
        AND rmf.current_ind = 'Y'
        AND rmf.retirement_date IS NULL
    `);

    const row = rows[0];
    const featureCount = row ? Number(row.feature_count) : 0;

    if (featureCount === 0) {
      // No spatial features to validate against – skip check
      return;
    }

    if (!row?.passes_check) {
      throw new BadRequestException(
        'The UTM coordinates must be within 10 m of the linear trail or inside the polygon for this recreation resource. Please verify the UTM values and try again.',
      );
    }
  }

  /**
   * Upsert a site point row using UTM coordinates.
   */
  async upsertSitePointFromUtm(
    rec_resource_id: string,
    utmZone: number,
    easting: number,
    northing: number,
  ): Promise<void> {
    const epsg = 32600 + Math.trunc(utmZone);

    const geom = Prisma.sql`
      public.ST_SetSRID(
        public.ST_Transform(
          public.ST_SetSRID(public.ST_MakePoint(${easting}, ${northing}), ${epsg}::integer),
        3005),
      0)
    `;

    await this.prisma.$executeRaw(Prisma.sql`
      INSERT INTO rst.recreation_site_point
        (rec_resource_id, geometry, created_at, updated_at)
      VALUES (${rec_resource_id}, ${geom}, now(), now())
      ON CONFLICT (rec_resource_id) DO UPDATE
      SET
        geometry = ${geom},
        updated_at = now()
    `);
  }
}
