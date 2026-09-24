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
import { UpdateRecreationResourceGeospatialDto } from './dto/update-recreation-resource-geospatial.dto';

type FlatGeometryEntry = {
  geometry: Record<string, unknown>;
  geometryTypeCode: 'P' | 'L';
  sectionId: string;
};

const flattenGeometryEntries = (
  geometry: any,
  featureIndex: number,
  sectionIdBase?: string | null,
): FlatGeometryEntry[] => {
  const normalizedSectionIdBase = sectionIdBase?.trim() || null;
  const getSectionId = (partIndex: number) =>
    normalizedSectionIdBase
      ? `${normalizedSectionIdBase}${partIndex > 1 ? `-${partIndex}` : ''}`
      : `${featureIndex + 1}-${partIndex}`;

  if (!geometry?.type) {
    return [];
  }

  if (geometry.type === 'Polygon') {
    return [
      {
        geometry,
        geometryTypeCode: 'P',
        sectionId: getSectionId(1),
      },
    ];
  }

  if (geometry.type === 'MultiPolygon') {
    return (geometry.coordinates ?? []).map(
      (polygonCoordinates: unknown, index: number) => ({
        geometry: {
          type: 'Polygon',
          coordinates: polygonCoordinates,
        },
        geometryTypeCode: 'P',
        sectionId: getSectionId(index + 1),
      }),
    );
  }

  if (geometry.type === 'LineString') {
    return [
      {
        geometry,
        geometryTypeCode: 'L',
        sectionId: getSectionId(1),
      },
    ];
  }

  if (geometry.type === 'MultiLineString') {
    return (geometry.coordinates ?? []).map(
      (lineCoordinates: unknown, index: number) => ({
        geometry: {
          type: 'LineString',
          coordinates: lineCoordinates,
        },
        geometryTypeCode: 'L',
        sectionId: getSectionId(index + 1),
      }),
    );
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

    if (updateDto.utm_zone && updateDto.utm_easting && updateDto.utm_northing) {
      await this.validateUtmAgainstFeatureGeometry(
        rec_resource_id,
        updateDto.utm_zone,
        updateDto.utm_easting,
        updateDto.utm_northing,
      );
      return await this.upsertSitePointFromUtm(
        rec_resource_id,
        updateDto.utm_zone,
        updateDto.utm_easting,
        updateDto.utm_northing,
      );
    }

    this.logger.warn(
      `No UTM payload provided for rec_resource_id: ${rec_resource_id} - nothing updated.`,
    );
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
        select: { rec_resource_id: true, district_code: true },
      });

      if (!existingResource) {
        await tx.recreation_resource.create({
          data: {
            rec_resource_id,
            district_code: payload.recreation_district_code || null,
            created_by: payload.submitted_by || null,
          },
        });
      } else if (
        payload.recreation_district_code &&
        !existingResource.district_code
      ) {
        await tx.recreation_resource.update({
          where: { rec_resource_id },
          data: {
            district_code: payload.recreation_district_code,
          },
        });
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

      const flattenedEntries: FlatGeometryEntry[] = payload.features.flatMap(
        (feature, index) =>
          flattenGeometryEntries(feature.geometry, index, feature.section_id),
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

        const geometry = Prisma.sql`
          public.ST_SetSRID(
            public.ST_GeomFromGeoJSON(${JSON.stringify(entry.geometry)}),
            3005
          )
        `;

        await tx.$executeRaw(Prisma.sql`
          INSERT INTO rst.recreation_map_feature (
            rmf_skey,
            rec_resource_id,
            section_id,
            recreation_resource_type,
            created_by,
            amend_status_code
          )
          VALUES (
            ${rmfSkey},
            ${rec_resource_id},
            ${entry.sectionId},
            ${payload.recreation_type_code || null},
            ${payload.submitted_by || null},
            ${'PND'}
          )
        `);

        await tx.$executeRaw(Prisma.sql`
          INSERT INTO rst.recreation_map_feature_geom (
            rmf_skey,
            geometry_type_code,
            geometry
          )
          VALUES (
            ${rmfSkey},
            ${entry.geometryTypeCode},
            ${geometry}
          )
        `);
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
