import {
  AUTH_STRATEGY,
  AuthRoles,
  AuthRolesGuard,
  RecreationResourceAuthRole,
  ROLE_MODE,
} from '@/auth';
import { createFileValidationPipe } from '@/common/pipes/file-validation.pipe';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
  getSchemaPath,
} from '@nestjs/swagger';
import {
  CreateRecreationResourceDocBodyDto,
  CreateRecreationResourceDocFormDto,
  RecreationResourceDocDto,
} from './dto/recreation-resource-doc.dto';
import { ResourceDocsService } from './service/resource-docs.service';

@ApiTags('recreation-resources')
@ApiBearerAuth(AUTH_STRATEGY.KEYCLOAK)
@UseGuards(AuthGuard(AUTH_STRATEGY.KEYCLOAK), AuthRolesGuard)
@AuthRoles([RecreationResourceAuthRole.RST_VIEWER], ROLE_MODE.ALL)
@Controller({ path: 'recreation-resources', version: '1' })
export class ResourceDocsController {
  constructor(private readonly resourceDocsService: ResourceDocsService) {}

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

  @Get(':rec_resource_id/docs/:document_id')
  @ApiOperation({
    summary: 'Get one document resource by document ID',
    operationId: 'getDocumentResourceById',
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
    description: 'Document Found',
    type: RecreationResourceDocDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Recreation Resource not found',
  })
  async getDocumentByResourceId(
    @Param('rec_resource_id') rec_resource_id: string,
    @Param('document_id') document_id: string,
  ): Promise<RecreationResourceDocDto | null> {
    return this.resourceDocsService.getDocumentByResourceId(
      rec_resource_id,
      document_id,
    );
  }

  @Post(':rec_resource_id/docs')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Create a new Document Resource with an uploaded file',
    operationId: 'createRecreationresourceDocument',
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
    description: 'Document Resource properties',
    type: CreateRecreationResourceDocFormDto,
  })
  @ApiResponse({
    status: 200,
    description: 'Document Created',
    type: RecreationResourceDocDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Recreation Resource document not found',
  })
  @ApiResponse({ status: 413, description: 'File too large' })
  @ApiResponse({ status: 500, description: 'Error creating document' })
  @ApiResponse({ status: 415, description: 'File Type not allowed' })
  @ApiResponse({ status: 416, description: 'Error creating resource' })
  @ApiResponse({ status: 417, description: 'Error getting resource images' })
  @ApiResponse({
    status: 418,
    description: 'Error adding resource to collection',
  })
  @ApiResponse({ status: 419, description: 'Error uploading file' })
  async createRecreationResourceDocument(
    @Param('rec_resource_id') rec_resource_id: string,
    @Body() body: CreateRecreationResourceDocBodyDto,
    @UploadedFile(
      createFileValidationPipe({ allowedTypes: ['application/pdf'] }),
    )
    file: Express.Multer.File,
  ): Promise<RecreationResourceDocDto | null> {
    return this.resourceDocsService.create(
      rec_resource_id,
      body.file_name,
      file,
    );
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
    return this.resourceDocsService.delete(rec_resource_id, document_id);
  }
}
