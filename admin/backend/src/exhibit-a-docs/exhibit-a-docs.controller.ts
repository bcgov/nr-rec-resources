import {
  AUTH_STRATEGY,
  AuthRoles,
  AuthRolesGuard,
  RecreationResourceAuthRole,
  ROLE_MODE,
  SuperAdminGuard,
} from '@/auth';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import {
  ExhibitADocDto,
  FinalizeExhibitAUploadRequestDto,
  PresignExhibitAUploadResponseDto,
} from './dto/exhibit-a-doc.dto';
import { ExhibitADocsService } from './exhibit-a-docs.service';

@ApiTags('recreation-resources')
@Controller({
  path: 'recreation-resources/:rec_resource_id/exhibit-a-docs',
  version: '1',
})
@ApiBearerAuth(AUTH_STRATEGY.KEYCLOAK)
@UseGuards(AuthGuard(AUTH_STRATEGY.KEYCLOAK), AuthRolesGuard)
@AuthRoles([RecreationResourceAuthRole.RST_ADMIN], ROLE_MODE.ALL)
export class ExhibitADocsController {
  constructor(private readonly exhibitADocsService: ExhibitADocsService) {}

  @AuthRoles(
    [
      RecreationResourceAuthRole.RST_VIEWER,
      RecreationResourceAuthRole.RST_ADMIN,
    ],
    ROLE_MODE.ANY,
  )
  @Get()
  @ApiOperation({
    operationId: 'getAllExhibitADocs',
    summary: 'Get all Exhibit A documents for a recreation resource',
  })
  @ApiParam({
    name: 'rec_resource_id',
    description: 'Recreation Resource ID',
    example: 'REC0001',
  })
  @ApiResponse({
    status: 200,
    description: 'List of Exhibit A documents',
    type: [ExhibitADocDto],
  })
  @ApiResponse({ status: 404, description: 'Recreation resource not found' })
  async getAll(
    @Param('rec_resource_id') rec_resource_id: string,
  ): Promise<ExhibitADocDto[]> {
    return this.exhibitADocsService.getAll(rec_resource_id);
  }

  @UseGuards(SuperAdminGuard)
  @Post('presign')
  @ApiOperation({
    operationId: 'presignExhibitAUpload',
    summary: 'Request presigned URL for direct S3 Exhibit A document upload',
  })
  @ApiParam({
    name: 'rec_resource_id',
    description: 'Recreation Resource ID',
    example: 'REC0001',
  })
  @ApiQuery({
    name: 'fileName',
    required: true,
    description: 'File name with extension',
    example: 'exhibit-a.pdf',
  })
  @ApiResponse({
    status: 200,
    description: 'Presigned URL generated',
    type: PresignExhibitAUploadResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Recreation Resource not found' })
  async presignUpload(
    @Param('rec_resource_id') rec_resource_id: string,
    @Query('fileName') fileName: string,
  ): Promise<PresignExhibitAUploadResponseDto> {
    return this.exhibitADocsService.presignUpload(rec_resource_id, fileName);
  }

  @UseGuards(SuperAdminGuard)
  @Post('finalize')
  @ApiOperation({
    operationId: 'finalizeExhibitAUpload',
    summary: 'Finalize Exhibit A document upload and create database record',
  })
  @ApiParam({
    name: 'rec_resource_id',
    description: 'Recreation Resource ID',
    example: 'REC0001',
  })
  @ApiBody({ required: true, type: FinalizeExhibitAUploadRequestDto })
  @ApiResponse({
    status: 200,
    description: 'Document record created',
    type: ExhibitADocDto,
  })
  @ApiResponse({ status: 404, description: 'Recreation Resource not found' })
  async finalizeUpload(
    @Param('rec_resource_id') rec_resource_id: string,
    @Body() body: FinalizeExhibitAUploadRequestDto,
  ): Promise<ExhibitADocDto> {
    return this.exhibitADocsService.finalizeUpload(rec_resource_id, body);
  }

  @UseGuards(SuperAdminGuard)
  @Delete(':document_id')
  @ApiOperation({
    operationId: 'deleteExhibitADoc',
    summary: 'Delete an Exhibit A document',
  })
  @ApiParam({
    name: 'rec_resource_id',
    description: 'Recreation Resource ID',
    example: 'REC0001',
  })
  @ApiParam({
    name: 'document_id',
    description: 'Document UUID',
    example: 'a7c1e5f3-8d2b-4c9a-b1e6-f3d8c7a2e5b9',
  })
  @ApiResponse({
    status: 200,
    description: 'Document deleted',
    type: ExhibitADocDto,
  })
  @ApiResponse({ status: 404, description: 'Document not found' })
  async delete(
    @Param('rec_resource_id') rec_resource_id: string,
    @Param('document_id') document_id: string,
  ): Promise<ExhibitADocDto> {
    return this.exhibitADocsService.delete(rec_resource_id, document_id);
  }
}
