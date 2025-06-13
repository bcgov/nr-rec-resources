import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UploadedFile,
  UseInterceptors,
} from "@nestjs/common";
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
  getSchemaPath,
} from "@nestjs/swagger";
import { ResourceDocsService } from "./service/resource-docs.service";
import {
  FileUploadDto,
  RecreationResourceDocBody,
  RecreationResourceDocDto,
} from "./dto/recreation-resource-doc.dto";
import { FileInterceptor } from "@nestjs/platform-express";

@ApiTags("resource-docs")
@Controller({ path: "resource-docs", version: "1" })
export class ResourceDocsController {
  constructor(private readonly resourceDocsService: ResourceDocsService) {}

  @Get(":rec_resource_id")
  @ApiOperation({
    summary: "Get all the PDF documents related to the resource",
    operationId: "getDocumentsByResourceId",
  })
  @ApiParam({
    name: "rec_resource_id",
    required: true,
    description: "Resource identifier",
    type: "string",
    example: "REC204117",
  })
  @ApiResponse({
    status: 200,
    description: "Documents Found",
    schema: {
      type: "array",
      items: { $ref: getSchemaPath(RecreationResourceDocDto) },
    },
  })
  @ApiResponse({ status: 404, description: "Resource not found" })
  async getAll(
    @Param("rec_resource_id") rec_resource_id: string,
  ): Promise<RecreationResourceDocDto[]> {
    return this.resourceDocsService.getAll(rec_resource_id);
  }

  @Get(":rec_resource_id/:ref_id")
  @ApiOperation({
    summary: "Get all the PDF documents related to the resource",
    operationId: "getDocumentResourceById",
  })
  @ApiParam({
    name: "rec_resource_id",
    required: true,
    description: "Resource identifier",
    type: "string",
    example: "REC204117",
  })
  @ApiParam({
    name: "ref_id",
    required: true,
    description: "Document Resource identifier",
    type: "string",
    example: "11714",
  })
  @ApiResponse({
    status: 200,
    description: "Document Found",
    type: RecreationResourceDocDto,
  })
  @ApiResponse({ status: 404, description: "Document Resource not found" })
  async getById(
    @Param("rec_resource_id") rec_resource_id: string,
    @Param("ref_id") ref_id: string,
  ): Promise<RecreationResourceDocDto | null> {
    return this.resourceDocsService.getById(rec_resource_id, ref_id);
  }

  @Post(":rec_resource_id")
  @UseInterceptors(FileInterceptor("file"))
  @ApiOperation({
    summary: "Create a new Document Resource with a uploaded file",
    operationId: "createDocumentResource",
  })
  @ApiParam({
    name: "rec_resource_id",
    required: true,
    description: "Resource identifier",
    type: "string",
    example: "REC204117",
  })
  @ApiBody({
    required: true,
    description: "Document Resource properties",
    type: RecreationResourceDocBody,
  })
  @ApiBody({
    required: true,
    description: "PDF File",
    type: FileUploadDto,
  })
  @ApiResponse({
    status: 200,
    description: "Document Created",
    type: RecreationResourceDocDto,
  })
  @ApiResponse({ status: 500, description: "Error creating document" })
  async create(
    @Param("rec_resource_id") rec_resource_id: string,
    @Body() body: RecreationResourceDocBody,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<RecreationResourceDocDto | null> {
    return this.resourceDocsService.create(
      rec_resource_id,
      body.title,
      file.path,
    );
  }

  @Put(":rec_resource_id/:ref_id")
  @UseInterceptors(FileInterceptor("file"))
  @ApiOperation({
    summary: "Update a Document Resource",
    operationId: "updateDocumentResource",
  })
  @ApiParam({
    name: "rec_resource_id",
    required: true,
    description: "Resource identifier",
    type: "string",
    example: "REC204117",
  })
  @ApiParam({
    name: "ref_id",
    required: true,
    description: "Document Resource identifier",
    type: "string",
    example: "11714",
  })
  @ApiBody({
    required: true,
    description: "Document Resource properties",
    type: RecreationResourceDocBody,
  })
  @ApiBody({
    required: false,
    description: "PDF File",
    type: FileUploadDto,
  })
  @ApiResponse({
    status: 200,
    description: "Document Updated",
    type: RecreationResourceDocDto,
  })
  @ApiResponse({ status: 500, description: "Error updating document" })
  async update(
    @Param("rec_resource_id") rec_resource_id: string,
    @Param("ref_id") ref_id: string,
    @Body() body: RecreationResourceDocBody,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<RecreationResourceDocDto | null> {
    return this.resourceDocsService.update(
      rec_resource_id,
      ref_id,
      body.title,
      file,
    );
  }

  @Delete(":rec_resource_id/:ref_id")
  @ApiOperation({
    summary: "Delete a Document Resource",
    operationId: "deleteDocumentResource",
  })
  @ApiParam({
    name: "rec_resource_id",
    required: true,
    description: "Resource identifier",
    type: "string",
    example: "REC204117",
  })
  @ApiParam({
    name: "ref_id",
    required: true,
    description: "Document Resource identifier",
    type: "string",
    example: "11714",
  })
  @ApiResponse({
    status: 200,
    description: "Document Deleted",
    type: RecreationResourceDocDto,
  })
  @ApiResponse({ status: 500, description: "Error deleting document" })
  async delete(
    @Param("rec_resource_id") rec_resource_id: string,
    @Param("ref_id") ref_id: string,
  ): Promise<RecreationResourceDocDto | null> {
    return this.resourceDocsService.delete(rec_resource_id, ref_id);
  }
}
