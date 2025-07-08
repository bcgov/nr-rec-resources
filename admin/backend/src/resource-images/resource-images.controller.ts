import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
  getSchemaPath,
} from "@nestjs/swagger";
import { ResourceImagesService } from "./service/resource-images.service";
import {
  CreateRecreationResourceImageBodyDto,
  CreateRecreationResourceImageFormDto,
  RecreationResourceImageDto,
} from "./dto/recreation-resource-image.dto";
import { FileInterceptor } from "@nestjs/platform-express";
import {
  AUTH_STRATEGY,
  AuthRoles,
  AuthRolesGuard,
  RecreationResourceAuthRole,
  ROLE_MODE,
} from "@/auth";
import { AuthGuard } from "@nestjs/passport";

@ApiTags("recreation-resource")
@ApiBearerAuth(AUTH_STRATEGY.KEYCLOAK)
@UseGuards(AuthGuard(AUTH_STRATEGY.KEYCLOAK), AuthRolesGuard)
@AuthRoles([RecreationResourceAuthRole.RST_VIEWER], ROLE_MODE.ALL)
@Controller({ path: "recreation-resource", version: "1" })
export class ResourceImagesController {
  constructor(private readonly resourceImagesService: ResourceImagesService) {}

  @Get(":rec_resource_id/images")
  @ApiOperation({
    summary: "Get all images related to the resource",
    operationId: "getImagesByRecResourceId",
  })
  @ApiParam({
    name: "rec_resource_id",
    required: true,
    description: "Resource identifier",
    type: "string",
    example: "REC204118",
  })
  @ApiResponse({
    status: 200,
    description: "Images Found",
    schema: {
      type: "array",
      items: { $ref: getSchemaPath(RecreationResourceImageDto) },
    },
  })
  async getAll(
    @Param("rec_resource_id") rec_resource_id: string,
  ): Promise<RecreationResourceImageDto[] | null> {
    return this.resourceImagesService.getAll(rec_resource_id);
  }

  @Get(":rec_resource_id/images/:ref_id")
  @ApiOperation({
    summary: "Get one image resource by reference ID",
    operationId: "getImageResourceById",
  })
  @ApiParam({
    name: "rec_resource_id",
    required: true,
    description: "Resource identifier",
    type: "string",
    example: "REC204118",
  })
  @ApiParam({
    name: "ref_id",
    required: true,
    description: "Image Resource identifier",
    type: "string",
    example: "11719",
  })
  @ApiResponse({
    status: 200,
    description: "Image Found",
    type: RecreationResourceImageDto,
  })
  @ApiResponse({
    status: 404,
    description: "Recreation Resource not found",
  })
  async getImageByResourceId(
    @Param("rec_resource_id") rec_resource_id: string,
    @Param("ref_id") ref_id: string,
  ): Promise<RecreationResourceImageDto | null> {
    return this.resourceImagesService.getImageByResourceId(
      rec_resource_id,
      ref_id,
    );
  }

  @Post(":rec_resource_id/images")
  @UseInterceptors(FileInterceptor("file"))
  @ApiConsumes("multipart/form-data")
  @ApiOperation({
    summary: "Create a new Image Resource with an uploaded file",
    operationId: "createRecreationresourceImage",
  })
  @ApiParam({
    name: "rec_resource_id",
    required: true,
    description: "Resource identifier",
    type: "string",
    example: "REC204118",
  })
  @ApiBody({
    required: true,
    description: "Image Resource properties",
    type: CreateRecreationResourceImageFormDto,
  })
  @ApiResponse({
    status: 200,
    description: "Image Created",
    type: RecreationResourceImageDto,
  })
  @ApiResponse({
    status: 404,
    description: "Recreation Resource Image not found",
  })
  @ApiResponse({ status: 500, description: "Error creating image" })
  @ApiResponse({ status: 415, description: "File Type not allowed" })
  @ApiResponse({ status: 416, description: "Error creating resource" })
  @ApiResponse({ status: 417, description: "Error getting resource images" })
  @ApiResponse({
    status: 418,
    description: "Error adding resource to collection",
  })
  @ApiResponse({ status: 419, description: "Error uploading file" })
  async createRecreationResourceImage(
    @Param("rec_resource_id") rec_resource_id: string,
    @Body() body: CreateRecreationResourceImageBodyDto,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<RecreationResourceImageDto | null> {
    return this.resourceImagesService.create(
      rec_resource_id,
      body.caption,
      file,
    );
  }

  @Put(":rec_resource_id/images/:ref_id")
  @UseInterceptors(FileInterceptor("file"))
  @ApiOperation({
    summary: "Update an Image Resource",
    operationId: "updateImageResource",
  })
  @ApiParam({
    name: "rec_resource_id",
    required: true,
    description: "Resource identifier",
    type: "string",
    example: "REC204118",
  })
  @ApiParam({
    name: "ref_id",
    required: true,
    description: "Image Resource identifier",
    type: "string",
    example: "11719",
  })
  @ApiResponse({
    status: 200,
    description: "Image Updated",
    type: RecreationResourceImageDto,
  })
  @ApiResponse({
    status: 404,
    description: "Recreation Resource Image not found",
  })
  @ApiResponse({ status: 500, description: "Error updating Image" })
  @ApiResponse({ status: 415, description: "File Type not allowed" })
  @ApiResponse({ status: 419, description: "Error uploading file" })
  async update(
    @Param("rec_resource_id") rec_resource_id: string,
    @Param("ref_id") ref_id: string,
    @Body() body: CreateRecreationResourceImageBodyDto,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<RecreationResourceImageDto | null> {
    return this.resourceImagesService.update(
      rec_resource_id,
      ref_id,
      body.caption,
      file,
    );
  }

  @Delete(":rec_resource_id/images/:ref_id")
  @ApiOperation({
    summary: "Delete an image Resource",
    operationId: "deleteImageResource",
  })
  @ApiParam({
    name: "rec_resource_id",
    required: true,
    description: "Resource identifier",
    type: "string",
    example: "REC204118",
  })
  @ApiParam({
    name: "ref_id",
    required: true,
    description: "Image Resource identifier",
    type: "string",
    example: "11719",
  })
  @ApiResponse({
    status: 200,
    description: "Image Deleted",
    type: RecreationResourceImageDto,
  })
  @ApiResponse({
    status: 404,
    description: "Recreation Resource image not found",
  })
  @ApiResponse({ status: 500, description: "Error deleting image" })
  @ApiResponse({ status: 420, description: "Error deleting resource" })
  async delete(
    @Param("rec_resource_id") rec_resource_id: string,
    @Param("ref_id") ref_id: string,
  ): Promise<RecreationResourceImageDto | null> {
    return this.resourceImagesService.delete(rec_resource_id, ref_id);
  }
}
