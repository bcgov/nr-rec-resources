import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { Prisma } from '@generated/prisma';
import { PrismaService } from '@/prisma.service';
import { getRecreationResourceGeospatialData } from '@prisma-generated-sql/getRecreationResourceGeospatialData';
import { RecreationResourceGeospatialDto } from './dto/recreation-resource-geospatial.dto';
import { UpdateRecreationResourceGeospatialDto } from './dto/update-recreation-resource-geospatial.dto';

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
