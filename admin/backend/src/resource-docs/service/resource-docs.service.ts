import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma.service";
import {
  RecreationResourceDocCode,
  RecreationResourceDocDto,
} from "../dto/recreation-resource-doc.dto";
import {
  uploadFile,
  createResource,
  getResourcePath,
  deleteResource,
  addResourceToCollection,
} from "./dam-api/dam-api";
import { unlink } from "fs";

@Injectable()
export class ResourceDocsService {
  constructor(private readonly prisma: PrismaService) {}

  async getAll(rec_resource_id: string): Promise<RecreationResourceDocDto[]> {
    const result = await this.prisma.recreation_resource_docs.findMany({
      where: {
        rec_resource_id,
      },
      select: {
        doc_code: true,
        rec_resource_id: true,
        url: true,
        title: true,
        ref_id: true,
        extension: true,
        recreation_resource_doc_code: {
          select: {
            description: true,
          },
        },
      },
    });
    return result.map((i) => this.mapResponse(i));
  }

  async getById(
    rec_resource_id: string,
    ref_id: string,
  ): Promise<RecreationResourceDocDto | null> {
    const result = await this.prisma.recreation_resource_docs.findUnique({
      where: {
        rec_resource_id,
        ref_id,
      },
      select: {
        doc_code: true,
        rec_resource_id: true,
        url: true,
        title: true,
        ref_id: true,
        extension: true,
        recreation_resource_doc_code: {
          select: {
            description: true,
          },
        },
      },
    });

    if (result === null) {
      return null;
    }

    return this.mapResponse(result);
  }

  async create(
    rec_resource_id: string,
    title: string,
    filePath: string,
  ): Promise<RecreationResourceDocDto> {
    const ref_id = await createResource();
    await uploadFile(ref_id, filePath);
    await addResourceToCollection(ref_id);
    const files = await getResourcePath(ref_id);
    const url = files
      .find((f: any) => f.size_code === "original")
      .url.replace(process.env.DAM_URL, "")
      .replace(/\?.*$/, "");
    const result = await this.prisma.recreation_resource_docs.create({
      data: {
        ref_id: ref_id.toString(),
        doc_code: RecreationResourceDocCode.RM,
        rec_resource_id,
        url,
        title,
        extension: "pdf",
      },
    });
    this.deleteFile(filePath);
    return this.mapResponse(result);
  }

  async update(
    rec_resource_id: string,
    ref_id: string,
    title: string,
    file: Express.Multer.File | undefined,
  ): Promise<RecreationResourceDocDto> {
    const docToUpdate = {
      title,
    };
    let url = null;
    if (file) {
      await uploadFile(ref_id, file.path);
      const files = await getResourcePath(ref_id);
      url = files
        .find((f: any) => f.size_code === "original")
        .url.replace(process.env.DAM_URL, "")
        .replace(/\?.*$/, "");
      docToUpdate["url"] = url;
      this.deleteFile(file.path);
    }
    const result = await this.prisma.recreation_resource_docs.update({
      where: {
        rec_resource_id,
        ref_id: ref_id,
      },
      data: docToUpdate,
    });

    return this.mapResponse(result);
  }

  async delete(
    rec_resource_id: string,
    ref_id: string,
  ): Promise<RecreationResourceDocDto | null> {
    await deleteResource(ref_id);
    const result = await this.prisma.recreation_resource_docs.delete({
      where: {
        rec_resource_id,
        ref_id,
      },
    });

    if (result === null) {
      return null;
    }

    return this.mapResponse(result);
  }

  private mapResponse(payload: any) {
    return {
      ...payload,
      doc_code: payload?.doc_code as RecreationResourceDocCode,
      doc_code_description: payload?.recreation_resource_doc_code?.description,
    };
  }

  private deleteFile(path: string) {
    unlink(path, (err) => {
      if (err) {
        throw err;
      }
    });
  }
}
