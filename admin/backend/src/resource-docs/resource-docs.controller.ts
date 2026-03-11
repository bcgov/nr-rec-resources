import {
  AUTH_STRATEGY,
  AuthRoles,
  AuthRolesGuard,
  RecreationResourceAuthRole,
  ROLE_MODE,
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
  getSchemaPath,
} from '@nestjs/swagger';
import {
  FinalizeDocUploadRequestDto,
  PresignDocUploadResponseDto,
  RecreationResourceDocDto,
} from './dto/recreation-resource-doc.dto';
import { ResourceDocsService } from './service/resource-docs.service';

@Controller({ path: 'recreation-resources', version: '1' })
@ApiTags('recreation-resources')
@ApiBearerAuth(AUTH_STRATEGY.KEYCLOAK)
@UseGuards(AuthGuard(AUTH_STRATEGY.KEYCLOAK), AuthRolesGuard)
@AuthRoles([RecreationResourceAuthRole.RST_ADMIN], ROLE_MODE.ALL)
export class ResourceDocsController {
  constructor(private readonly resourceDocsService: ResourceDocsService) {}

  @AuthRoles(
    [
      RecreationResourceAuthRole.RST_VIEWER,
      RecreationResourceAuthRole.RST_ADMIN,
    ],
    ROLE_MODE.ANY,
  )
  @Get(':rec_resource_id/docs')
  @ApiOperation({
    summary: 'Get all documents related to the resource',
    operationId: 'getDocumentsByRecResourceId',
  })
  @ApiParam({
    name: 'rec_resource_id',
    required: true,
    description: 'Resource identifier',
    type: 'string',
    example: 'REC204117',
  })
  @ApiResponse({
    status: 200,
    description: 'Documents Found',
    schema: {
      type: 'array',
      items: { $ref: getSchemaPath(RecreationResourceDocDto) },
    },
  })
  async getAll(
    @Param('rec_resource_id') rec_resource_id: string,
  ): Promise<RecreationResourceDocDto[] | null> {
    return this.resourceDocsService.getAll(rec_resource_id);
  }

  @Post(':rec_resource_id/docs/presign')
  @ApiOperation({
    summary: 'Request presigned URL for direct S3 document upload',
    operationId: 'presignDocUpload',
    description:
      'Allocates a document ID and returns a presigned PUT URL for uploading the PDF directly to S3.',
  })
  @ApiParam({
    name: 'rec_resource_id',
    required: true,
    description: 'Resource identifier',
    type: 'string',
    example: 'REC204117',
  })
  @ApiQuery({
    name: 'fileName',
    required: true,
    description: 'Document file name with extension (e.g., map.pdf)',
    type: 'string',
    example: 'campbell-river-site-map.pdf',
  })
  @ApiResponse({
    status: 200,
    description: 'Presigned URL generated',
    type: PresignDocUploadResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Recreation Resource not found',
  })
  @ApiResponse({ status: 500, description: 'Error generating presigned URL' })
  async presignDocUpload(
    @Param('rec_resource_id') rec_resource_id: string,
    @Query('fileName') fileName: string,
  ): Promise<PresignDocUploadResponseDto> {
    return this.resourceDocsService.presignUpload(rec_resource_id, fileName);
  }

  @Post(':rec_resource_id/docs/finalize')
  @ApiOperation({
    summary: 'Finalize document upload and create database record',
    operationId: 'finalizeDocUpload',
    description:
      'Creates database record for uploaded document. Should be called after S3 upload completes successfully. No S3 verification is performed.',
  })
  @ApiParam({
    name: 'rec_resource_id',
    required: true,
    description: 'Resource identifier',
    type: 'string',
    example: 'REC204117',
  })
  @ApiBody({
    required: true,
    type: FinalizeDocUploadRequestDto,
  })
  @ApiResponse({
    status: 200,
    description: 'Document record created',
    type: RecreationResourceDocDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Recreation Resource not found',
  })
  @ApiResponse({ status: 500, description: 'Error finalizing upload' })
  async finalizeDocUpload(
    @Param('rec_resource_id') rec_resource_id: string,
    @Body() body: FinalizeDocUploadRequestDto,
  ): Promise<RecreationResourceDocDto> {
    return this.resourceDocsService.finalizeUpload(rec_resource_id, body);
  }

  @Delete(':rec_resource_id/docs/:document_id')
  @ApiOperation({
    summary: 'Delete a Document Resource',
    operationId: 'deleteDocumentResource',
  })
  @ApiParam({
    name: 'rec_resource_id',
    required: true,
    description: 'Resource identifier',
    type: 'string',
    example: 'REC204117',
  })
  @ApiParam({
    name: 'document_id',
    required: true,
    description: 'Document identifier',
    type: 'string',
    example: '11714',
  })
  @ApiResponse({
    status: 200,
    description: 'Document Deleted',
    type: RecreationResourceDocDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Recreation Resource document not found',
  })
  @ApiResponse({ status: 500, description: 'Error deleting document' })
  @ApiResponse({ status: 420, description: 'Error deleting resource' })
  async delete(
    @Param('rec_resource_id') rec_resource_id: string,
    @Param('document_id') document_id: string,
  ): Promise<RecreationResourceDocDto> {
    return this.resourceDocsService.delete(rec_resource_id, document_id, true);
  }
}
