import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  StreamableFile,
  UploadedFile,
  UseInterceptors,
} from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { ResourceDocsService } from "./service/resource-docs.service";
import { RecreationResourceDocDto } from "./dto/recreation-resource-doc.dto";
import { FileInterceptor } from "@nestjs/platform-express";
import { createReadStream } from "fs";
import { join } from "path";

@ApiTags("resource-docs")
@Controller({ path: "resource-docs", version: "1" })
export class ResourceDocsController {
  constructor(private readonly resourceDocsService: ResourceDocsService) {}

  @Post("/upload/:ref_id")
  @UseInterceptors(FileInterceptor("file"))
  async upload(
    @Param("ref_id") ref_id: string,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<any> {
    return this.resourceDocsService.uploadFile(ref_id, file.path);
  }

  @Post("/createResource")
  async createResource(): Promise<any> {
    return this.resourceDocsService.createResource();
  }

  @Get("/file")
  getFile(): StreamableFile {
    const file = createReadStream(
      join(process.cwd(), "uploads//1748972544025-test_doc.pdf"),
    );
    console.log(file);
    return new StreamableFile(file, {
      type: "application/pdf",
      disposition: 'attachment; filename="doc.pdf"',
    });
  }

  @Get(":rec_resource_id")
  async getAll(
    @Param("rec_resource_id") rec_resource_id: string,
  ): Promise<RecreationResourceDocDto[]> {
    return this.resourceDocsService.getAll(rec_resource_id);
  }

  @Get(":rec_resource_id/:ref_id")
  async getById(
    @Param("rec_resource_id") rec_resource_id: string,
    @Param("ref_id") ref_id: string,
  ): Promise<RecreationResourceDocDto | null> {
    return this.resourceDocsService.getById(rec_resource_id, ref_id);
  }

  @Post(":rec_resource_id")
  async create(
    @Param("rec_resource_id") rec_resource_id: string,
    @Body() body: RecreationResourceDocDto,
  ): Promise<RecreationResourceDocDto | null> {
    return this.resourceDocsService.create(rec_resource_id, body);
  }

  @Put(":rec_resource_id/:ref_id")
  async update(
    @Param("rec_resource_id") rec_resource_id: string,
    @Param("ref_id") ref_id: string,
    @Body() body: RecreationResourceDocDto,
  ): Promise<RecreationResourceDocDto | null> {
    return this.resourceDocsService.update(rec_resource_id, ref_id, body);
  }

  @Delete(":rec_resource_id/:ref_id")
  async delete(
    @Param("rec_resource_id") rec_resource_id: string,
    @Param("ref_id") ref_id: string,
  ): Promise<RecreationResourceDocDto | null> {
    return this.resourceDocsService.delete(rec_resource_id, ref_id);
  }
}
