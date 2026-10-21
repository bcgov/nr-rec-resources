import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
} from '@nestjs/common';
import { Prisma } from '@generated/prisma';
import { PrismaService } from '@/prisma.service';
import { getRecreationResourceGeospatialData } from '@prisma-generated-sql/getRecreationResourceGeospatialData';
import { RecreationResourceGeospatialDto } from './dto/recreation-resource-geospatial.dto';
import { CreateRecreationMapFeaturesDto } from './dto/create-recreation-map-features.dto';
import {
  UpdateRecreationResourceGeospatialDto,
} from './dto/update-recreation-resource-geospatial.dto';

type FlatGeometryEntry = {
  geometry: Record<string, unknown>;
  geometryTypeCode: 'P' | 'L';
  sectionId: string;
  featureAreaHectares: number | null;
};

type MapFeatureGeometryInput = {
  geometry: Record<string, unknown>;
  section_id?: string | null;
  feature_area_hectares?: number | null;
};

type RmfData = {
  rmf_skey: number | null;
  amendment_id: number | null;
};

const normalizeGeometryEntry = (
  geometry: any,
  featureIndex: number,
  sectionIdBase?: string | null,
  featureAreaHectares?: number | null,
): FlatGeometryEntry | null => {
  const normalizedSectionIdBase = sectionIdBase?.trim() || null;
  const sectionId = normalizedSectionIdBase || `${featureIndex + 1}`;
  const normalizedFeatureAreaHectares =
    typeof featureAreaHectares === 'number' &&
    Number.isFinite(featureAreaHectares) &&
    featureAreaHectares >= 0
      ? featureAreaHectares
      : null;

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
      featureAreaHectares: normalizedFeatureAreaHectares,
    };
  }

  if (geometry.type === 'MultiPolygon') {
    return {
      geometry,
      geometryTypeCode: 'P',
      sectionId,
      featureAreaHectares: normalizedFeatureAreaHectares,
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
      featureAreaHectares: null,
    };
  }

  if (geometry.type === 'MultiLineString') {
    return {
      geometry,
      geometryTypeCode: 'L',
      sectionId,
      featureAreaHectares: null,
    };
  }

  throw new BadRequestException(
    `Unsupported geometry type: ${String(geometry.type)}`,
  );
};

@Injectable()
export class GeospatialService {
  private readonly logger = new Logger(GeospatialService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get geospatial data for a recreation resource
   * Fetches spatial feature geometries and calculated coordinate values
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
    featureAreaHectares: number | null,
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
        created_by,
        amend_status_code
      )
      VALUES (
        ${rmfSkey},
        ${rec_resource_id},
        ${sectionId},
        ${0},
        ${recreation_type_code || null},
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
            THEN COALESCE(
              ${featureAreaHectares},
              ROUND((public.ST_Area(normalized.geom_3005) / 10000)::numeric, 4)
            )
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
    featureAreaHectares: number | null,
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
                                  THEN COALESCE(
                                    ${featureAreaHectares},
                                    ROUND((public.ST_Area(normalized.geom_3005) / 10000)::numeric, 4)
                                  )
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
    features: Array<MapFeatureGeometryInput>,
  ): FlatGeometryEntry[] {
    return features
      .map((feature, index) =>
        normalizeGeometryEntry(
          feature.geometry,
          index,
          feature.section_id,
          feature.feature_area_hectares,
        ),
      )
      .filter((entry): entry is FlatGeometryEntry => entry !== null);
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
          entry.featureAreaHectares,
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
            entry.featureAreaHectares,
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
          entry.featureAreaHectares,
          entry.geometry,
          tx,
        );
      }
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
