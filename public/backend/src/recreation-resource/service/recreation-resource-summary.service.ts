import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { RecreationResourceSummaryDto } from 'src/recreation-resource/dto/recreation-resource-summary.dto';
import { PaginatedRecreationResourceSummaryDto } from 'src/recreation-resource/dto/paginated-recreation-resource-summary.dto';
import { getRecreationResourceSummary } from '@prisma-generated-sql/getRecreationResourceSummary';

@Injectable()
export class RecreationResourceSummaryService {
  private static readonly PAGE_SIZE = 1000;

  constructor(private readonly prisma: PrismaService) {}

  async findAll(
    page: number = 1,
  ): Promise<PaginatedRecreationResourceSummaryDto> {
    const currentPage = Math.max(page, 1);
    const offset =
      (currentPage - 1) * RecreationResourceSummaryService.PAGE_SIZE;

    const rows: getRecreationResourceSummary.Result[] =
      await this.prisma.$queryRawTyped(
        getRecreationResourceSummary(
          RecreationResourceSummaryService.PAGE_SIZE,
          offset,
        ),
      );

    const total = rows.length > 0 ? rows[0].total_count : 0;

    return {
      data: rows.map((r) => this.formatDto(r)),
      total,
      page: currentPage,
      totalPages: Math.ceil(total / RecreationResourceSummaryService.PAGE_SIZE),
    };
  }

  private formatDto(
    row: getRecreationResourceSummary.Result,
  ): RecreationResourceSummaryDto {
    return {
      rec_resource_id: row.rec_resource_id,
      name: row.name ?? '',
      district_code: row.district_code ?? '',
      district: row.district_description ?? '',
      rec_resource_type_code: row.rec_resource_type_code ?? '',
      rec_resource_type: row.rec_resource_type_description ?? '',
      display_on_public_site: row.display_on_public_site ?? false,
      status_code: row.status_code ?? null,
      status: row.status_description ?? null,
      closure_comment: row.closure_comment ?? null,
      site_point_geometry: row.site_point_geometry ?? null,
    };
  }
}
