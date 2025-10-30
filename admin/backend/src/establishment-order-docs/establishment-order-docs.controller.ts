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
} from '@nestjs/swagger';
import {
  CreateEstablishmentOrderDocBodyDto,
  CreateEstablishmentOrderDocFormDto,
} from './dto/create-establishment-order-doc.dto';
import { EstablishmentOrderDocDto } from './dto/establishment-order-doc.dto';
import { EstablishmentOrderDocsService } from './establishment-order-docs.service';

@ApiTags('recreation-resources')
@Controller({
  path: 'recreation-resources/:rec_resource_id/establishment-order-docs',
  version: '1',
})
@ApiBearerAuth(AUTH_STRATEGY.KEYCLOAK)
@UseGuards(AuthGuard(AUTH_STRATEGY.KEYCLOAK), AuthRolesGuard)
@AuthRoles([RecreationResourceAuthRole.RST_VIEWER], ROLE_MODE.ALL)
export class EstablishmentOrderDocsController {
  constructor(
    private readonly establishmentOrderDocsService: EstablishmentOrderDocsService,
  ) {}

  @Get()
  @ApiOperation({
    operationId: 'getAllEstablishmentOrderDocs',
    summary: 'Get all establishment order documents for a recreation resource',
    description:
      'Returns a list of establishment order documents with presigned URLs for download',
  })
  @ApiParam({
    name: 'rec_resource_id',
    description: 'Recreation Resource ID',
    example: 'REC0001',
  })
  @ApiResponse({
    status: 200,
    description: 'List of establishment order documents',
    type: [EstablishmentOrderDocDto],
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 404,
    description: 'Recreation resource not found',
  })
  async getAll(
    @Param('rec_resource_id') rec_resource_id: string,
  ): Promise<EstablishmentOrderDocDto[]> {
    return this.establishmentOrderDocsService.getAll(rec_resource_id);
  }

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    operationId: 'createEstablishmentOrderDoc',
    summary: 'Create a new establishment order document',
    description: 'Uploads a PDF document to S3 and creates a database record',
  })
  @ApiParam({
    name: 'rec_resource_id',
    description: 'Recreation Resource ID',
    example: 'REC0001',
  })
  @ApiBody({
    description: 'Document upload form data',
    type: CreateEstablishmentOrderDocFormDto,
  })
  @ApiResponse({
    status: 201,
    description: 'Establishment order document created successfully',
    type: EstablishmentOrderDocDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 404,
    description: 'Recreation resource not found',
  })
  @ApiResponse({
    status: 415,
    description: 'File type not allowed',
  })
  async create(
    @Param('rec_resource_id') rec_resource_id: string,
    @Body() body: CreateEstablishmentOrderDocBodyDto,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<EstablishmentOrderDocDto> {
    return this.establishmentOrderDocsService.create(
      rec_resource_id,
      body.title,
      file,
    );
  }

  @Delete(':s3_key')
  @ApiOperation({
    operationId: 'deleteEstablishmentOrderDoc',
    summary: 'Delete an establishment order document',
    description:
      'Deletes the document from S3 and removes the database record. The s3_key should be URL-encoded.',
  })
  @ApiParam({
    name: 'rec_resource_id',
    description: 'Recreation Resource ID',
    example: 'REC0001',
  })
  @ApiParam({
    name: 's3_key',
    description: 'S3 key (URL-encoded, e.g., REC0001%2Ffilename.pdf)',
    example: 'REC0001%2Festablishment-order.pdf',
  })
  @ApiResponse({
    status: 200,
    description: 'Establishment order document deleted successfully',
    type: EstablishmentOrderDocDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 404,
    description: 'Document not found',
  })
  async delete(
    @Param('rec_resource_id') rec_resource_id: string,
    @Param('s3_key') s3_key: string,
  ): Promise<EstablishmentOrderDocDto> {
    const decodedS3Key = decodeURIComponent(s3_key);
    return this.establishmentOrderDocsService.delete(
      rec_resource_id,
      decodedS3Key,
    );
  }
}
