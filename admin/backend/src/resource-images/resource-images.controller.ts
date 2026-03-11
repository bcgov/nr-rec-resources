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
  Patch,
  Param,
  Post,
  Query,
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
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import {
  ConsentFormDownloadResponseDto,
  FinalizeImageUploadRequestDto,
  PresignImageUploadResponseDto,
  RecreationResourceImageDto,
} from './dto/recreation-resource-image.dto';
import {
  UpdateImageConsentDto,
  UpdateImageConsentPatchDto,
} from './dto/update-image-consent.dto';
import { ResourceImagesService } from './service/resource-images.service';

@Controller({ path: 'recreation-resources', version: '1' })
@ApiTags('recreation-resources')
@ApiBearerAuth(AUTH_STRATEGY.KEYCLOAK)
@UseGuards(AuthGuard(AUTH_STRATEGY.KEYCLOAK), AuthRolesGuard)
@AuthRoles([RecreationResourceAuthRole.RST_ADMIN], ROLE_MODE.ALL)
export class ResourceImagesController {
  constructor(private readonly resourceImagesService: ResourceImagesService) {}

  @AuthRoles(
    [
      RecreationResourceAuthRole.RST_VIEWER,
      RecreationResourceAuthRole.RST_ADMIN,
    ],
    ROLE_MODE.ANY,
  )
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
    type: [RecreationResourceImageDto],
  })
  async getAll(
    @Param('rec_resource_id') rec_resource_id: string,
  ): Promise<RecreationResourceImageDto[] | null> {
    return this.resourceImagesService.getAll(rec_resource_id);
  }

  @Post(':rec_resource_id/images/presign')
  @ApiOperation({
    summary: 'Request presigned URLs for direct S3 image variant upload',
    operationId: 'presignImageUpload',
    description:
      'Allocates an image ID and returns 4 presigned PUT URLs for uploading WebP variants directly to S3. Variants should be generated client-side.',
  })
  @ApiParam({
    name: 'rec_resource_id',
    required: true,
    description: 'Resource identifier',
    type: 'string',
    example: 'REC204118',
  })
  @ApiQuery({
    name: 'fileName',
    required: true,
    description:
      'User-edited filename (without extension) to tag on original.webp',
    type: 'string',
    example: 'my-image',
  })
  @ApiResponse({
    status: 200,
    description: 'Presigned URLs generated',
    type: PresignImageUploadResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Recreation Resource not found',
  })
  @ApiResponse({ status: 500, description: 'Error generating presigned URLs' })
  async presignImageUpload(
    @Param('rec_resource_id') rec_resource_id: string,
    @Query('fileName') fileName: string,
  ): Promise<PresignImageUploadResponseDto> {
    return this.resourceImagesService.presignUpload(rec_resource_id, fileName);
  }

  @Post(':rec_resource_id/images/finalize')
  @UseInterceptors(FileInterceptor('consent_form'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Finalize image upload and create database record',
    operationId: 'finalizeImageUpload',
    description:
      'Creates database record for uploaded image variants and optional consent form. Should be called after all S3 uploads complete successfully.',
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
    type: FinalizeImageUploadRequestDto,
    description: 'Image metadata and optional consent form fields',
  })
  @ApiResponse({
    status: 200,
    description: 'Image record created',
    type: RecreationResourceImageDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Recreation Resource not found',
  })
  @ApiResponse({ status: 500, description: 'Error finalizing upload' })
  async finalizeImageUpload(
    @Param('rec_resource_id') rec_resource_id: string,
    @Body() body: FinalizeImageUploadRequestDto,
    @UploadedFile() consentForm?: Express.Multer.File,
  ): Promise<RecreationResourceImageDto> {
    return this.resourceImagesService.finalizeUpload(
      rec_resource_id,
      body,
      consentForm,
    );
  }

  @Post(':rec_resource_id/images/:image_id/consent')
  @UseInterceptors(FileInterceptor('consent_form'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Create consent metadata for an existing image',
    operationId: 'createImageConsent',
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
  @ApiBody({
    required: true,
    type: UpdateImageConsentDto,
    description: 'Consent metadata and optional consent form PDF',
  })
  @ApiResponse({
    status: 201,
    description: 'Consent metadata created',
    type: RecreationResourceImageDto,
  })
  async createImageConsent(
    @Param('rec_resource_id') rec_resource_id: string,
    @Param('image_id') image_id: string,
    @Body() body: UpdateImageConsentDto,
    @UploadedFile() consentForm?: Express.Multer.File,
  ): Promise<RecreationResourceImageDto> {
    return this.resourceImagesService.createImageConsent(
      rec_resource_id,
      image_id,
      body,
      consentForm,
    );
  }

  @Patch(':rec_resource_id/images/:image_id/consent')
  @ApiOperation({
    summary: 'Update consent metadata for an existing image',
    operationId: 'updateImageConsent',
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
  @ApiBody({
    required: true,
    type: UpdateImageConsentPatchDto,
    description: 'Consent metadata updates (name/date only)',
  })
  @ApiResponse({
    status: 200,
    description: 'Consent metadata updated',
    type: RecreationResourceImageDto,
  })
  async updateImageConsent(
    @Param('rec_resource_id') rec_resource_id: string,
    @Param('image_id') image_id: string,
    @Body() body: UpdateImageConsentPatchDto,
  ): Promise<RecreationResourceImageDto> {
    return this.resourceImagesService.updateImageConsent(
      rec_resource_id,
      image_id,
      body,
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
    return this.resourceImagesService.delete(rec_resource_id, image_id, true);
  }

  @AuthRoles(
    [
      RecreationResourceAuthRole.RST_VIEWER,
      RecreationResourceAuthRole.RST_ADMIN,
    ],
    ROLE_MODE.ANY,
  )
  @Get(':rec_resource_id/images/:image_id/consent-download')
  @ApiOperation({
    summary: 'Get presigned URL for consent form download',
    operationId: 'getConsentFormDownloadUrl',
    description:
      'Returns a time-limited presigned URL for downloading the consent form PDF associated with an image.',
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
    description: 'Presigned download URL generated',
    type: ConsentFormDownloadResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Image or consent form not found',
  })
  async getConsentDownloadUrl(
    @Param('rec_resource_id') rec_resource_id: string,
    @Param('image_id') image_id: string,
  ): Promise<{ url: string }> {
    const url = await this.resourceImagesService.getConsentDownloadUrl(
      rec_resource_id,
      image_id,
    );
    return { url };
  }
}
