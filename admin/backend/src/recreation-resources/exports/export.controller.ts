import {
  AUTH_STRATEGY,
  AuthRoles,
  AuthRolesGuard,
  RecreationResourceAuthRole,
  ROLE_MODE,
} from '@/auth';
import { Controller, Get, Query, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiProduces,
  ApiTags,
} from '@nestjs/swagger';
import { BadRequestResponseDto } from '@/common/dtos/bad-request-response.dto';
import type { Response } from 'express';
import { ExportDownloadQueryDto } from './dtos/export-download-query.dto';
import { ExportPreviewQueryDto } from './dtos/export-preview-query.dto';
import { ExportPreviewResponseDto } from './dtos/export-preview-response.dto';
import { ListExportDatasetsResponseDto } from './dtos/list-export-datasets-response.dto';
import { ExportService } from './export.service';

@ApiTags('recreation-resources')
@Controller({
  path: 'recreation-resources/exports',
  version: '1',
})
@ApiBearerAuth(AUTH_STRATEGY.KEYCLOAK)
@UseGuards(AuthGuard(AUTH_STRATEGY.KEYCLOAK), AuthRolesGuard)
@AuthRoles([RecreationResourceAuthRole.RST_ADMIN], ROLE_MODE.ALL)
export class ExportController {
  constructor(private readonly exportService: ExportService) {}

  @Get('datasets')
  @ApiOperation({
    operationId: 'getExportDatasets',
    summary: 'List CSV export datasets',
    description:
      'Returns the datasets currently available for the admin CSV export workflow',
  })
  @ApiOkResponse({
    description: 'Datasets available for export',
    type: ListExportDatasetsResponseDto,
  })
  getDatasets(): ListExportDatasetsResponseDto {
    return this.exportService.listDatasets();
  }

  @Get('preview')
  @ApiOperation({
    operationId: 'getExportPreview',
    summary: 'Preview a CSV export dataset',
    description:
      'Returns a limited row preview for the requested export dataset',
  })
  @ApiOkResponse({
    description: 'Preview rows for the requested dataset',
    type: ExportPreviewResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Bad Request - validation errors',
    type: BadRequestResponseDto,
  })
  async getPreview(
    @Query() query: ExportPreviewQueryDto,
  ): Promise<ExportPreviewResponseDto> {
    return this.exportService.getPreview(query);
  }

  @Get('download')
  @ApiOperation({
    operationId: 'downloadExportCsv',
    summary: 'Download a CSV export dataset',
    description:
      'Returns the full CSV payload for the requested export dataset',
  })
  @ApiProduces('text/csv')
  @ApiOkResponse({
    description: 'CSV export file',
    schema: {
      type: 'string',
      format: 'binary',
    },
  })
  @ApiBadRequestResponse({
    description: 'Bad Request - validation errors',
    type: BadRequestResponseDto,
  })
  async download(
    @Query() query: ExportDownloadQueryDto,
    @Res() response: Response,
  ): Promise<void> {
    const { csv, fileName } = await this.exportService.getDownload(query);

    response.setHeader('Content-Type', 'text/csv; charset=utf-8');
    response.setHeader('Access-Control-Expose-Headers', 'Content-Disposition');
    response.setHeader(
      'Content-Disposition',
      `attachment; filename="${fileName}"`,
    );
    response.send(csv);
  }
}
