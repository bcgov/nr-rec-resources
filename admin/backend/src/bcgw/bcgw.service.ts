import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { getBcgwRecreationResources } from '@prisma-generated-sql/getBcgwRecreationResources';
import { getBcgwClosuresShort } from '@prisma-generated-sql/getBcgwClosuresShort';
import { getBcgwRecreationLines } from '@prisma-generated-sql/getBcgwRecreationLines';
import { getBcgwRecreationPolygons } from '@prisma-generated-sql/getBcgwRecreationPolygons';
import {
  BcgwFeatureCollectionDto,
  BcgwFeatureDto,
  BcgwPaginationMetaDto,
  BcgwRecreationResourceDto,
} from './dto/bcgw-recreation-resource.dto';
import {
  BcgwClosuresShortDto,
  BcgwClosuresShortFeatureCollectionDto,
  BcgwClosuresShortFeatureDto,
} from './dto/bcgw-closures-short.dto';
import {
  BcgwRecreationLinesDto,
  BcgwRecreationLinesFeatureCollectionDto,
  BcgwRecreationLinesFeatureDto,
} from './dto/bcgw-recreation-lines.dto';
import {
  BcgwRecreationPolygonsDto,
  BcgwRecreationPolygonsFeatureCollectionDto,
  BcgwRecreationPolygonsFeatureDto,
} from './dto/bcgw-recreation-polygons.dto';

@Injectable()
export class BcgwService {
  static readonly PAGE_SIZE = 1000;

  constructor(private readonly prisma: PrismaService) {}

  async findAll(page: number = 1): Promise<BcgwFeatureCollectionDto> {
    const { currentPage, offset } = this.paginationParams(page);
    const rows = await this.prisma.$queryRawTyped(
      getBcgwRecreationResources(BcgwService.PAGE_SIZE, offset),
    );
    return this.buildCollection(rows, currentPage, (r) => this.toFeature(r));
  }

  async findAllShort(
    page: number = 1,
  ): Promise<BcgwClosuresShortFeatureCollectionDto> {
    const { currentPage, offset } = this.paginationParams(page);
    const rows = await this.prisma.$queryRawTyped(
      getBcgwClosuresShort(BcgwService.PAGE_SIZE, offset),
    );
    return this.buildCollection(rows, currentPage, (r) =>
      this.toClosuresShortFeature(r),
    );
  }

  async findAllLines(
    page: number = 1,
  ): Promise<BcgwRecreationLinesFeatureCollectionDto> {
    const { currentPage, offset } = this.paginationParams(page);
    const rows = await this.prisma.$queryRawTyped(
      getBcgwRecreationLines(BcgwService.PAGE_SIZE, offset),
    );
    return this.buildCollection(rows, currentPage, (r) =>
      this.toRecreationLinesFeature(r),
    );
  }

  async findAllPolygons(
    page: number = 1,
  ): Promise<BcgwRecreationPolygonsFeatureCollectionDto> {
    const { currentPage, offset } = this.paginationParams(page);
    const rows = await this.prisma.$queryRawTyped(
      getBcgwRecreationPolygons(BcgwService.PAGE_SIZE, offset),
    );
    return this.buildCollection(rows, currentPage, (r) =>
      this.toRecreationPolygonsFeature(r),
    );
  }

  private paginationParams(page: number): {
    currentPage: number;
    offset: number;
  } {
    const currentPage = Math.max(page, 1);
    return { currentPage, offset: (currentPage - 1) * BcgwService.PAGE_SIZE };
  }

  private buildCollection<
    TRow extends { total_count: number | null },
    TFeature,
  >(
    rows: TRow[],
    currentPage: number,
    mapper: (row: TRow) => TFeature,
  ): {
    type: 'FeatureCollection';
    features: TFeature[];
    meta: BcgwPaginationMetaDto;
  } {
    const total = rows.length > 0 ? (rows[0]!.total_count ?? 0) : 0;
    return {
      type: 'FeatureCollection',
      features: rows.map(mapper),
      meta: {
        total,
        page: currentPage,
        totalPages: Math.ceil(total / BcgwService.PAGE_SIZE),
        pageSize: BcgwService.PAGE_SIZE,
      },
    };
  }

  private toRecreationPolygonsFeature(
    row: getBcgwRecreationPolygons.Result,
  ): BcgwRecreationPolygonsFeatureDto {
    const properties: BcgwRecreationPolygonsDto = {
      rmf_skey: row.rmf_skey,
      forest_file_id: row.forest_file_id,
      section_id: row.section_id,
      recreation_map_feature_code: row.recreation_map_feature_code,
      project_type: row.project_type,
      retirement_date: row.retirement_date,
      amendment_id: row.amendment_id,
      map_label: row.map_label,
      project_name: row.project_name,
      recreation_feature_code: row.recreation_feature_code,
      resource_feature_ind: row.resource_feature_ind,
      arch_impact_assess_ind: row.arch_impact_assess_ind,
      site_location: row.site_location,
      project_established_date: row.project_established_date,
      recreation_view_ind: row.recreation_view_ind,
      recreation_district_code: row.recreation_district_code,
      defined_campsites: Number(row.defined_campsites),
      life_cycle_status_code: row.life_cycle_status_code,
      file_status_code: row.file_status_code,
      geographic_district_code: row.geographic_district_code,
      geographic_district_name: row.geographic_district_name,
      feature_area: row.feature_area != null ? Number(row.feature_area) : null,
      feature_perimeter:
        row.feature_perimeter != null ? Number(row.feature_perimeter) : null,
      feature_area_sqm: row.feature_area_sqm,
      feature_length_m:
        row.feature_length_m != null ? Number(row.feature_length_m) : null,
    };

    return {
      type: 'Feature',
      geometry: row.geometry ? JSON.parse(row.geometry) : null,
      properties,
    };
  }

  private toRecreationLinesFeature(
    row: getBcgwRecreationLines.Result,
  ): BcgwRecreationLinesFeatureDto {
    const properties: BcgwRecreationLinesDto = {
      rmf_skey: row.rmf_skey,
      forest_file_id: row.forest_file_id,
      section_id: row.section_id,
      recreation_map_feature_code: row.recreation_map_feature_code,
      project_type: row.project_type,
      retirement_date: row.retirement_date,
      amendment_id: row.amendment_id,
      map_label: row.map_label,
      project_name: row.project_name,
      recreation_feature_code: row.recreation_feature_code,
      resource_feature_ind: row.resource_feature_ind,
      right_of_way: row.right_of_way != null ? Number(row.right_of_way) : null,
      arch_impact_assess_ind: row.arch_impact_assess_ind,
      site_location: row.site_location,
      project_established_date: row.project_established_date,
      recreation_view_ind: row.recreation_view_ind,
      recreation_district_code: row.recreation_district_code,
      defined_campsites: Number(row.defined_campsites),
      life_cycle_status_code: row.life_cycle_status_code,
      file_status_code: row.file_status_code,
      district_code: row.district_code,
      district_name: row.district_name,
      feature_length:
        row.feature_length != null ? Number(row.feature_length) : null,
      feature_length_m:
        row.feature_length_m != null ? Number(row.feature_length_m) : null,
    };

    return {
      type: 'Feature',
      geometry: row.geometry ? JSON.parse(row.geometry) : null,
      properties,
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
