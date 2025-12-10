import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@/prisma.service';
import { getRecreationResourceGeospatialData } from '@/prisma-generated-sql';
import { RecreationResourceGeospatialDto } from './dto/recreation-resource-geospatial.dto';
import { UpdateRecreationResourceGeospatialDto } from './dto/update-recreation-resource-geospatial.dto';

@Injectable()
export class GeospatialService {
  private readonly logger = new Logger(GeospatialService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get geospatial data for a recreation resource
   * Fetches spatial feature geometries and calculated coordinate values
   * Uses a typed raw SQL query via Prisma
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

    return {
      rec_resource_id: data.rec_resource_id,
      spatial_feature_geometry: data.spatial_feature_geometry ?? undefined,
      site_point_geometry: data.site_point_geometry ?? undefined,
      utm_zone: data.utm_zone,
      utm_easting: data.utm_easting,
      utm_northing: data.utm_northing,
      latitude: data.latitude,
      longitude: data.longitude,
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
   * Upsert a site point row using UTM coordinates.
   * - Constructs a point in the appropriate UTM EPSG (326## for northern hemisphere),
   *   transforms it to BC Albers (3005), then sets SRID to 0 for storage to match legacy rows.
   */

  async upsertSitePointFromUtm(
    rec_resource_id: string,
    utmZone: number,
    easting: number,
    northing: number,
  ): Promise<void> {
    const epsg = 32600 + Math.trunc(utmZone);

    const geom = `
    public.ST_SetSRID(
      public.ST_Transform(
        public.ST_SetSRID(public.ST_MakePoint($2, $3), $4::integer),
      3005),
    0)
  `;

    const sql = `
    INSERT INTO rst.recreation_site_point
      (rec_resource_id, geometry, created_at, updated_at)
    VALUES ($1, ${geom}, now(), now())
    ON CONFLICT (rec_resource_id) DO UPDATE
    SET
      geometry = ${geom},
      updated_at = now();
  `;

    await this.prisma.$executeRawUnsafe(
      sql,
      rec_resource_id,
      easting,
      northing,
      epsg,
    );
  }
}
