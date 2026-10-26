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
};

type RmfData = {
  rmf_skey: number | null;
  amendment_id: number | null;
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

type FeatureRequestElement = {
  '@type': 'FeatureRequestResource';
  mapFeatureGuid: string;
  featureRecordGuid: string;
  featureGeometryTypeCode: 'polygon' | 'linear';
  mapFeatureTypeCode: string;
} & (
  | { featureGeometryTypeCode: 'polygon'; polygon: Record<string, unknown> }
  | { featureGeometryTypeCode: 'linear'; linear: Record<string, unknown> }
);

const DETERMINISTIC_GUID_NAMESPACE = 'rst-sncsc';
const BC_ALBERS_CRS = {
  type: 'name',
  properties: {
    name: 'EPSG:1000003005',
  },
} as const;

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

const normalizeGeometryEntry = (
  geometry: any,
  featureIndex: number,
  sectionIdBase?: string | null,
): FlatGeometryEntry | null => {
  const normalizedSectionIdBase = sectionIdBase?.trim() || null;
  const sectionId = normalizedSectionIdBase || `${featureIndex + 1}`;

  if (!geometry?.type) {
    return null;
  }

  if (geometry.type === 'Polygon') {
    return {
      geometry: {
        type: 'MultiPolygon',
        coordinates: [geometry.coordinates],
      },
      geometryTypeCode: 'P',
      sectionId,
    };
  }

  if (geometry.type === 'MultiPolygon') {
    return {
      geometry,
      geometryTypeCode: 'P',
      sectionId,
    };
  }

  if (geometry.type === 'LineString') {
    return {
      geometry: {
        type: 'MultiLineString',
        coordinates: [geometry.coordinates],
      },
      geometryTypeCode: 'L',
      sectionId,
    };
  }

  if (geometry.type === 'MultiLineString') {
    return {
      geometry,
      geometryTypeCode: 'L',
      sectionId,
    };
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

  /**
   * Get geospatial data for a recreation resource.
   * Fetches spatial feature geometries and calculated coordinate values.
   */
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

    const sessions = await this.prisma.recreation_map_feature.findMany({
      where: {
        rec_resource_id,
      },
      select: { section_id: true },
    });

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
      section_ids: sessions
        .map((s) => s.section_id)
        .filter((id): id is string => id != null),
    };
  }

  /**
   * Update or insert site point geometry for the given recreation resource.
   */
  async updateGeospatialData(
    rec_resource_id: string,
    updateDto: UpdateRecreationResourceGeospatialDto,
  ): Promise<void> {
    this.logger.log(
      `Updating geospatial data for rec_resource_id: ${rec_resource_id}`,
    );

    await this.updateMapFeaturesFromValidatedFile(rec_resource_id, updateDto);

    this.logger.warn(
      `No UTM payload provided for rec_resource_id: ${rec_resource_id} - nothing updated.`,
    );
  }

  private async insertMapFeatureAndGeometry(
    rmfSkey: number,
    rec_resource_id: string,
    sectionId: string,
    recreation_type_code: string | null,
    submitted_by: string | null,
    geometryTypeCode: 'P' | 'L',
    geometryEntry: Record<string, unknown>,
    tx: Prisma.TransactionClient,
  ): Promise<void> {
    const geometry = Prisma.sql`
          public.ST_Multi(
            public.ST_SetSRID(
              public.ST_GeomFromGeoJSON(${JSON.stringify(geometryEntry)}),
              3005
            )
          )
        `;

    await tx.$executeRaw(Prisma.sql`
      INSERT INTO rst.recreation_map_feature (
        rmf_skey,
        rec_resource_id,
        section_id,
        amendment_id,
        recreation_resource_type,
        recreation_map_feature_guid,
        created_by,
        amend_status_code
      )
      VALUES (
        ${rmfSkey},
        ${rec_resource_id},
        ${sectionId},
        ${0},
        ${recreation_type_code || null},
        ${toDeterministicUuid(`${rec_resource_id}:${sectionId}:map-feature`)},
        ${submitted_by || null},
        ${'PND'}
      )
    `);

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
        CASE
          WHEN normalized.geometry_type_code = 'P'
            THEN ROUND((public.ST_Area(normalized.geom_3005) / 10000)::numeric, 4)
          ELSE NULL
        END,
        CASE
          WHEN normalized.geometry_type_code = 'L'
            THEN ROUND((public.ST_Length(normalized.geom_3005) / 1000)::numeric, 4)
          ELSE NULL
        END,
        CASE
          WHEN normalized.geometry_type_code = 'P'
            THEN ROUND((public.ST_Perimeter(normalized.geom_3005) / 1000)::numeric, 4)
          ELSE NULL
        END
      FROM (
        SELECT
          CAST(${geometryTypeCode} AS varchar(1)) AS geometry_type_code,
          ${geometry} AS geom_3005
      ) AS normalized
    `);
  }

  private async updateMapFeatureAndGeometry(
    rmfSkey: number,
    amendment_id: number | null,
    recreation_type_code: string | null,
    submitted_by: string | null,
    geometryTypeCode: 'P' | 'L',
    geometryEntry: Record<string, unknown>,
    tx: Prisma.TransactionClient,
  ): Promise<void> {
    await tx.$executeRaw(Prisma.sql`
      UPDATE rst.recreation_map_feature
      SET
        amendment_id =  ${(amendment_id ?? 0) + 1},
        amend_status_date = now(),
        recreation_resource_type = ${recreation_type_code || null},
        retirement_date = null,
        updated_by = ${submitted_by || null},
        amend_status_code = ${'PND'}
      WHERE rmf_skey = ${rmfSkey}
    `);

    const geometry = Prisma.sql`
      public.ST_Multi(
        public.ST_SetSRID(
          public.ST_GeomFromGeoJSON(${JSON.stringify(geometryEntry)}),
          3005
        )
      )
    `;

    await tx.$executeRaw(Prisma.sql`
        UPDATE rst.recreation_map_feature_geom
        SET
          geometry_type_code = normalized.geometry_type_code,
          geometry           = normalized.geom_3005,
          feature_area       = CASE
                                WHEN normalized.geometry_type_code = 'P'
                                  THEN ROUND((public.ST_Area(normalized.geom_3005) / 10000)::numeric, 4)
                                ELSE NULL
                              END,
          feature_length     = CASE
                                WHEN normalized.geometry_type_code = 'L'
                                  THEN ROUND((public.ST_Length(normalized.geom_3005) / 1000)::numeric, 4)
                                ELSE NULL
                              END,
          feature_perimeter  = CASE
                                WHEN normalized.geometry_type_code = 'P'
                                  THEN ROUND((public.ST_Perimeter(normalized.geom_3005) / 1000)::numeric, 4)
                                ELSE NULL
                              END
        FROM (
          SELECT
            CAST(${geometryTypeCode} AS varchar(1)) AS geometry_type_code,
            ${geometry} AS geom_3005
        ) AS normalized
        WHERE rmf_skey = ${rmfSkey}
      `);
  }

  private async retireFeature(
    rmfSkey: number,
    submitted_by: string | null,
    tx: Prisma.TransactionClient,
  ): Promise<void> {
    await tx.$executeRaw(Prisma.sql`
      UPDATE rst.recreation_map_feature
      SET
        retirement_date = now(),
        updated_by = ${submitted_by || null},
        amend_status_code = ${'PND'}
      WHERE rmf_skey = ${rmfSkey}
    `);
  }

  private flattenFeatures(
    features: Array<UpdateRecreationMapFeatureGeometryDto>,
  ): FlatGeometryEntry[] {
    return features
      .map((feature, index) =>
        normalizeGeometryEntry(feature.geometry, index, feature.section_id),
      )
      .filter((entry): entry is FlatGeometryEntry => entry !== null);
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
    // Geospatial-page submissions are always sent as amendment requests.
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

    throw new BadRequestException(
      'Natural resource district code is required to create a spatial submission.',
    );
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

  private async buildFeatureRequestElements(
    tx: Prisma.TransactionClient,
    recResourceId: string,
    entries: FlatGeometryEntry[],
  ): Promise<FeatureRequestElement[]> {
    const sectionIds = Array.from(
      new Set(entries.map((entry) => entry.sectionId)),
    );

    if (!sectionIds.length) {
      return [];
    }

    const featureRows = await tx.$queryRaw<
      {
        section_id: string | null;
        recreation_map_feature_guid: string | null;
        recreation_resource_type: string | null;
        geometry_type_code: string | null;
        geometry_json: string | null;
      }[]
    >(Prisma.sql`
      SELECT
        rmf.section_id,
        rmf.recreation_map_feature_guid,
        rmf.recreation_resource_type,
        rmfg.geometry_type_code,
        public.ST_AsGeoJSON(
          CASE
            WHEN public.ST_SRID(rmfg.geometry) = 0
              THEN public.ST_SetSRID(rmfg.geometry, 3005)
            ELSE rmfg.geometry
          END
        ) AS geometry_json
      FROM rst.recreation_map_feature rmf
      INNER JOIN rst.recreation_map_feature_geom rmfg
        ON rmfg.rmf_skey = rmf.rmf_skey
      WHERE rmf.rec_resource_id = ${recResourceId}
        AND rmf.section_id IN (${Prisma.join(sectionIds)})
    `);

    const featureBySectionId = new Map(
      featureRows
        .filter((row) => row.section_id)
        .map((row) => [row.section_id!, row]),
    );

    const elements: FeatureRequestElement[] = [];

    for (const entry of entries) {
      const row = featureBySectionId.get(entry.sectionId);
      const mapFeatureGuid =
        row?.recreation_map_feature_guid ||
        toDeterministicUuid(`${recResourceId}:${entry.sectionId}:map-feature`);
      const featureRecordGuid = randomUUID();

      const parsedGeometry = row?.geometry_json
        ? (JSON.parse(row.geometry_json) as Record<string, unknown>)
        : entry.geometry;
      const normalizedGeometryTypeCode = (
        row?.geometry_type_code ||
        entry.geometryTypeCode ||
        ''
      ).toUpperCase();
      const isPolygon = normalizedGeometryTypeCode === 'P';
      const geometryPayload = this.buildFeatureGeoJson(parsedGeometry);

      if (isPolygon) {
        elements.push({
          '@type': 'FeatureRequestResource',
          mapFeatureGuid,
          featureRecordGuid,
          featureGeometryTypeCode: 'polygon',
          mapFeatureTypeCode: row?.recreation_resource_type || '',
          polygon: geometryPayload,
        });
      } else {
        elements.push({
          '@type': 'FeatureRequestResource',
          mapFeatureGuid,
          featureRecordGuid,
          featureGeometryTypeCode: 'linear',
          mapFeatureTypeCode: row?.recreation_resource_type || '',
          linear: geometryPayload,
        });
      }
    }

    return elements;
  }

  private async dispatchSncscStatusRequest(
    tx: Prisma.TransactionClient,
    submission: CreatedSpatialSubmission,
    entries: FlatGeometryEntry[],
  ): Promise<void> {
    const client = await this.resolveOrgUnitClientInfo(
      submission.org_unit_code,
    );
    const featureRequests = await this.buildFeatureRequestElements(
      tx,
      submission.tenure_id,
      entries,
    );

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
      purposeCode: submission.purpose_code,
      bctsSubmissionInd: 'N',
      featureRequests: {
        '@type': 'FeatureRequestResources',
        elements: featureRequests,
      },
    };

    console.log('SNCSC status request payload:', JSON.stringify(payload));

    const statusRequestGuid =
      await this.sncscStatusRequestService.createStatusRequest(payload);

    await tx.recreation_spatial_submission.update({
      where: { application_guid: submission.application_guid },
      data: {
        status_request_guid: statusRequestGuid,
        updated_by: 'system',
      },
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
  ): Promise<CreatedSpatialSubmission> {
    const orgUnitCode = await this.resolveOrgUnitCode(
      data.rec_resource_id,
      tx,
      data.orgUnitCode,
    );

    const maxAttempts = 10;
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        return await tx.recreation_spatial_submission.create({
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
        if (
          this.isSubmissionIdUniqueConflict(error) &&
          attempt < maxAttempts - 1
        ) {
          continue;
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

    await this.prisma.$transaction(async (tx) => {
      await tx.$executeRawUnsafe(
        "SELECT pg_advisory_xact_lock(hashtext('rst.recreation_map_feature'))",
      );

      const flattenedNewEntries: FlatGeometryEntry[] =
        this.flattenFeatures(newFeatures);
      this.logger.log(
        `Creating ${newFeatures.length} map feature(s) for rec_resource_id: ${rec_resource_id}`,
      );
      let nextRmfSkey = 0;
      // Only generate a new rmf_skey if there are new features
      if (newFeatures.length > 0) {
        const maxRmfSkeyQuery = [
          'SELECT COALESCE(MAX(rmf_skey), 0) AS max_rmf_skey',
          'FROM rst.recreation_map_feature',
        ].join(' ');

        const [{ max_rmf_skey } = { max_rmf_skey: 0 }]: Array<{
          max_rmf_skey: number | bigint;
        }> = await tx.$queryRawUnsafe(maxRmfSkeyQuery);

        nextRmfSkey = Number(max_rmf_skey) + 1;
      }
      for (const entry of flattenedNewEntries) {
        await this.insertMapFeatureAndGeometry(
          nextRmfSkey,
          rec_resource_id,
          entry.sectionId,
          payload.recreation_type_code || null,
          payload.submitted_by || null,
          entry.geometryTypeCode,
          entry.geometry,
          tx,
        );
        nextRmfSkey++;
      }

      const flattenedAmendedEntries: FlatGeometryEntry[] =
        this.flattenFeatures(amendedFeatures);
      this.logger.log(
        `Updating ${amendedFeatures.length} map feature(s) for rec_resource_id: ${rec_resource_id}`,
      );
      for (const entry of flattenedAmendedEntries) {
        const rmfDataQuery = [
          'SELECT rmf_skey, amendment_id',
          'FROM rst.recreation_map_feature',
          `WHERE rec_resource_id = '${rec_resource_id}' AND section_id = '${entry.sectionId}'`,
        ].join(' ');

        const [
          { rmf_skey = null, amendment_id = null } = {
            rmf_skey: null,
            amendment_id: null,
          } as RmfData,
        ]: Array<{
          rmf_skey: number | null;
          amendment_id: number | null;
        }> = await tx.$queryRawUnsafe(rmfDataQuery);

        if (rmf_skey === null) {
          this.logger.error(
            `No existing map feature found for rec_resource_id: ${rec_resource_id}, section_id: ${entry.sectionId}`,
          );
        } else {
          await this.updateMapFeatureAndGeometry(
            rmf_skey,
            amendment_id,
            payload.recreation_type_code || null,
            payload.submitted_by || null,
            entry.geometryTypeCode,
            entry.geometry,
            tx,
          );
        }
      }

      const flattenedRetiredEntries: FlatGeometryEntry[] =
        this.flattenFeatures(retiredFeatures);
      this.logger.log(
        `Retiring ${retiredFeatures.length} map feature(s) for rec_resource_id: ${rec_resource_id}`,
      );
      for (const entry of flattenedRetiredEntries) {
        const rmfDataQuery = [
          'SELECT rmf_skey, amendment_id',
          'FROM rst.recreation_map_feature',
          `WHERE rec_resource_id = '${rec_resource_id}' AND section_id = '${entry.sectionId}'`,
        ].join(' ');

        const [
          { rmf_skey = null } = {
            rmf_skey: null,
            amendment_id: null,
          } as RmfData,
        ]: Array<{
          rmf_skey: number | null;
          amendment_id: number | null;
        }> = await tx.$queryRawUnsafe(rmfDataQuery);

        if (rmf_skey === null) {
          this.logger.error(
            `No existing map feature found for rec_resource_id: ${rec_resource_id}, section_id: ${entry.sectionId}`,
          );
        } else {
          await this.retireFeature(rmf_skey, payload.submitted_by || null, tx);
        }
      }

      const allSubmissionEntries = [
        ...flattenedNewEntries,
        ...flattenedAmendedEntries,
        ...flattenedRetiredEntries,
      ];
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

        await this.dispatchSncscStatusRequest(
          tx,
          createdSubmission,
          allSubmissionEntries,
        );
      }
    });
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

    await this.prisma.$transaction(async (tx) => {
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

      const maxRmfSkeyQuery = [
        'SELECT COALESCE(MAX(rmf_skey), 0) AS max_rmf_skey',
        'FROM rst.recreation_map_feature',
      ].join(' ');

      const [{ max_rmf_skey } = { max_rmf_skey: 0 }]: Array<{
        max_rmf_skey: number | bigint;
      }> = await tx.$queryRawUnsafe(maxRmfSkeyQuery);

      let nextRmfSkey = Number(max_rmf_skey) + 1;

      for (const entry of flattenedEntries) {
        const rmfSkey = nextRmfSkey;
        nextRmfSkey += 1;

        await this.insertMapFeatureAndGeometry(
          rmfSkey,
          rec_resource_id,
          entry.sectionId,
          payload.recreation_type_code || null,
          payload.submitted_by || null,
          entry.geometryTypeCode,
          entry.geometry,
          tx,
        );
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

      await this.dispatchSncscStatusRequest(
        tx,
        createdSubmission,
        flattenedEntries,
      );
    });
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
