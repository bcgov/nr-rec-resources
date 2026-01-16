import {
  AUTH_STRATEGY,
  AuthRoles,
  AuthRolesGuard,
  RecreationResourceAuthRole,
  ROLE_MODE,
} from '@/auth';
import { createFileFieldsValidationPipe } from '@/common/pipes/file-fields-validation.pipe';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
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
  CreateRecreationResourceImageVariantsDto,
  RecreationResourceImageDto,
} from './dto/recreation-resource-image.dto';
import { ResourceImagesService } from './service/resource-images.service';

@ApiTags('recreation-resources')
@ApiBearerAuth(AUTH_STRATEGY.KEYCLOAK)
@UseGuards(AuthGuard(AUTH_STRATEGY.KEYCLOAK), AuthRolesGuard)
@AuthRoles([RecreationResourceAuthRole.RST_VIEWER], ROLE_MODE.ALL)
@Controller({ path: 'recreation-resources', version: '1' })
export class ResourceImagesController {
  constructor(private readonly resourceImagesService: ResourceImagesService) {}

  @Get(':rec_resource_id/images')
  @ApiOperation({
    summary: 'Get all images related to the resource',
    operationId: 'getImagesByRecResourceId',
  })
  @ApiParam({
    name: 'rec_resource_id',
    required: true,
    description: 'Resource identifier',
    type: 'string',
    example: 'REC204118',
  })
  @ApiResponse({
    status: 200,
    description: 'Images Found',
    schema: {
      type: 'array',
      items: { $ref: getSchemaPath(RecreationResourceImageDto) },
    },
  })
  async getAll(
    @Param('rec_resource_id') rec_resource_id: string,
  ): Promise<RecreationResourceImageDto[] | null> {
    return this.resourceImagesService.getAll(rec_resource_id);
  }

  @Get(':rec_resource_id/images/:image_id')
  @ApiOperation({
    summary: 'Get one image resource by image ID',
    operationId: 'getImageResourceById',
  })
  @ApiParam({
    name: 'rec_resource_id',
    required: true,
    description: 'Resource identifier',
    type: 'string',
    example: 'REC204118',
  })
  @ApiParam({
    name: 'image_id',
    required: true,
    description: 'Image identifier (UUID)',
    type: 'string',
    example: 'a7c1e5f3-8d2b-4c9a-b1e6-f3d8c7a2e5b9',
  })
  @ApiResponse({
    status: 200,
    description: 'Image Found',
    type: RecreationResourceImageDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Recreation Resource not found',
  })
  async getImageByResourceId(
    @Param('rec_resource_id') rec_resource_id: string,
    @Param('image_id') image_id: string,
  ): Promise<RecreationResourceImageDto | null> {
    return this.resourceImagesService.getImageByResourceId(
      rec_resource_id,
      image_id,
    );
  }

  @Post(':rec_resource_id/images')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'original', maxCount: 1 },
      { name: 'scr', maxCount: 1 },
      { name: 'pre', maxCount: 1 },
      { name: 'thm', maxCount: 1 },
    ]),
  )
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Create a new Image Resource with 4 pre-processed WebP variants',
    operationId: 'createRecreationresourceImage',
    description:
      'Accepts 4 WebP image variants (original, scr, pre, thm) that have been processed client-side.',
  })
  @ApiParam({
    name: 'rec_resource_id',
    required: true,
    description: 'Resource identifier',
    type: 'string',
    example: 'REC204118',
  })
  @ApiBody({
    required: true,
    description: 'Image variants',
    schema: {
      type: 'object',
      properties: {
        file_name: { type: 'string', example: 'beautiful-mountain-view.webp' },
        original: { type: 'string', format: 'binary' },
        scr: { type: 'string', format: 'binary' },
        pre: { type: 'string', format: 'binary' },
        thm: { type: 'string', format: 'binary' },
      },
      required: ['file_name', 'original', 'scr', 'pre', 'thm'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Image Created',
    type: RecreationResourceImageDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Missing required variants or metadata',
  })
  @ApiResponse({
    status: 404,
    description: 'Recreation Resource not found',
  })
  @ApiResponse({ status: 415, description: 'Only WebP images are allowed' })
  @ApiResponse({ status: 500, description: 'Error creating image' })
  async createRecreationResourceImage(
    @Param('rec_resource_id') rec_resource_id: string,
    @Body() body: CreateRecreationResourceImageVariantsDto,
    @UploadedFiles(
      createFileFieldsValidationPipe({
        fields: [
          {
            fieldName: 'original',
            allowedTypes: ['image/webp'],
            maxSize: 2 * 1024 * 1024,
          },
          {
            fieldName: 'scr',
            allowedTypes: ['image/webp'],
            maxSize: 2 * 1024 * 1024,
          },
          {
            fieldName: 'pre',
            allowedTypes: ['image/webp'],
            maxSize: 2 * 1024 * 1024,
          },
          {
            fieldName: 'thm',
            allowedTypes: ['image/webp'],
            maxSize: 2 * 1024 * 1024,
          },
        ],
      }),
    )
    files: {
      original: Express.Multer.File[];
      scr: Express.Multer.File[];
      pre: Express.Multer.File[];
      thm: Express.Multer.File[];
    },
  ): Promise<RecreationResourceImageDto | null> {
    const variantFiles = {
      original: files.original[0]!,
      scr: files.scr[0]!,
      pre: files.pre[0]!,
      thm: files.thm[0]!,
    };

    return this.resourceImagesService.create(
      rec_resource_id,
      body.file_name,
      variantFiles,
    );
  }

  @Delete(':rec_resource_id/images/:image_id')
  @ApiOperation({
    summary: 'Delete an image Resource',
    operationId: 'deleteImageResource',
  })
  @ApiParam({
    name: 'rec_resource_id',
    required: true,
    description: 'Resource identifier',
    type: 'string',
    example: 'REC204118',
  })
  @ApiParam({
    name: 'image_id',
    required: true,
    description: 'Image identifier (UUID)',
    type: 'string',
    example: 'a7c1e5f3-8d2b-4c9a-b1e6-f3d8c7a2e5b9',
  })
  @ApiResponse({ status: 500, description: 'Error deleting image' })
  @ApiResponse({ status: 420, description: 'Error deleting resource' })
  @ApiResponse({
    status: 404,
    description: 'Recreation Resource image not found',
  })
  @ApiResponse({
    status: 200,
    description: 'Image Deleted',
    type: RecreationResourceImageDto,
  })
  async delete(
    @Param('rec_resource_id') rec_resource_id: string,
    @Param('image_id') image_id: string,
  ): Promise<RecreationResourceImageDto | null> {
    return this.resourceImagesService.delete(rec_resource_id, image_id);
  }
}
