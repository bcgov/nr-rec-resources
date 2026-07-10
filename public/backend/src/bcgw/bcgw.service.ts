import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { getBcgwRecreationResources } from '@prisma-generated-sql/getBcgwRecreationResources';
import { getBcgwClosuresShort } from '@prisma-generated-sql/getBcgwClosuresShort';
import {
  BcgwFeatureCollectionDto,
  BcgwFeatureDto,
  BcgwRecreationResourceDto,
} from './dto/bcgw-recreation-resource.dto';
import {
  BcgwClosuresShortDto,
  BcgwClosuresShortFeatureCollectionDto,
  BcgwClosuresShortFeatureDto,
} from './dto/bcgw-closures-short.dto';

@Injectable()
export class BcgwService {
  static readonly PAGE_SIZE = 1000;

  constructor(private readonly prisma: PrismaService) {}

  async findAll(page: number = 1): Promise<BcgwFeatureCollectionDto> {
    const currentPage = Math.max(page, 1);
    const offset = (currentPage - 1) * BcgwService.PAGE_SIZE;

    const rows: getBcgwRecreationResources.Result[] =
      await this.prisma.$queryRawTyped(
        getBcgwRecreationResources(BcgwService.PAGE_SIZE, offset),
      );

    const total = rows.length > 0 ? (rows[0].total_count ?? 0) : 0;
    const totalPages = Math.ceil(total / BcgwService.PAGE_SIZE);

    return {
      type: 'FeatureCollection',
      features: rows.map((r) => this.toFeature(r)),
      meta: {
        total,
        page: currentPage,
        totalPages,
        pageSize: BcgwService.PAGE_SIZE,
      },
    };
  }

  async findAllShort(
    page: number = 1,
  ): Promise<BcgwClosuresShortFeatureCollectionDto> {
    const currentPage = Math.max(page, 1);
    const offset = (currentPage - 1) * BcgwService.PAGE_SIZE;

    const rows: getBcgwClosuresShort.Result[] =
      await this.prisma.$queryRawTyped(
        getBcgwClosuresShort(BcgwService.PAGE_SIZE, offset),
      );

    const total = rows.length > 0 ? (rows[0].total_count ?? 0) : 0;
    const totalPages = Math.ceil(total / BcgwService.PAGE_SIZE);

    return {
      type: 'FeatureCollection',
      features: rows.map((r) => this.toClosuresShortFeature(r)),
      meta: {
        total,
        page: currentPage,
        totalPages,
        pageSize: BcgwService.PAGE_SIZE,
      },
    };
  }

  private toClosuresShortFeature(
    row: getBcgwClosuresShort.Result,
  ): BcgwClosuresShortFeatureDto {
    const properties: BcgwClosuresShortDto = {
      forest_file_id: row.forest_file_id,
      project_name: row.project_name,
      project_type: row.project_type,
      closure_ind: row.closure_ind,
      closure_date: row.closure_date,
      closure_type: row.closure_type,
      site_location: row.site_location,
      defined_campsites: Number(row.defined_campsites),
      recreation_district_code: row.recreation_district_code,
      recreation_district_name: row.recreation_district_name,
      org_unit_name: row.org_unit_name,
      closure_comment: row.closure_comment,
      site_description: row.site_description,
      driving_directions: row.driving_directions,
      latitude: row.latitude,
      longitude: row.longitude,
      shape: row.shape,
    };

    return {
      type: 'Feature',
      geometry: row.shape ? JSON.parse(row.shape) : null,
      properties,
    };
  }

  private toFeature(row: getBcgwRecreationResources.Result): BcgwFeatureDto {
    const properties: BcgwRecreationResourceDto = {
      forest_file_id: row.forest_file_id,
      project_name: row.project_name,
      project_type_code: row.project_type_code,
      project_type: row.project_type,
      project_established_date: row.project_established_date,
      closure_ind: row.closure_ind,
      closure_date: row.closure_date,
      closure_type: row.closure_type,
      closure_comment: row.closure_comment,
      recreation_view_ind: row.recreation_view_ind,
      file_status_st: row.file_status_st,
      status_description: row.status_description,
      site_location: row.site_location,
      defined_campsites: Number(row.defined_campsites),
      site_description_brief: row.site_description_brief,
      arch_impact_assess_ind: row.arch_impact_assess_ind,
      tenure_app_total_area:
        row.tenure_app_total_area != null
          ? Number(row.tenure_app_total_area)
          : null,
      tenure_app_total_length:
        row.tenure_app_total_length != null
          ? Number(row.tenure_app_total_length)
          : null,
      site_description: row.site_description,
      site_description_date: row.site_description_date,
      driving_directions: row.driving_directions,
      driving_directions_date: row.driving_directions_date,
      rec_feature_code: row.rec_feature_code,
      rec_feature_description: row.rec_feature_description,
      recreation_district_code: row.recreation_district_code,
      recreation_district_name: row.recreation_district_name,
      org_unit_code: row.org_unit_code,
      org_unit_name: row.org_unit_name,
      utm_zone: row.utm_zone,
      utm_easting: row.utm_easting,
      utm_northing: row.utm_northing,
      latitude: row.latitude,
      longitude: row.longitude,
      shape: row.shape,
    };

    return {
      type: 'Feature',
      geometry: row.shape ? JSON.parse(row.shape) : null,
      properties,
    };
  }
}
