import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma.service";
import {
  RecreationResourceDocCode,
  RecreationResourceDocDto,
} from "../dto/recreation-resource-doc.dto";
import { uploadFile, createResource } from "./dam-api/dam-api";

@Injectable()
export class ResourceDocsService {
  constructor(private readonly prisma: PrismaService) {}

  async uploadFile(ref_id: string, filePath: string): Promise<any> {
    console.log(filePath);
    return await uploadFile(ref_id, "./uploads/1749246971273-test_doc.pdf");
  }

  async createResource(): Promise<any> {
    return await createResource();
  }

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
    document: RecreationResourceDocDto,
  ): Promise<RecreationResourceDocDto> {
    const result = await this.prisma.recreation_resource_docs.create({
      data: {
        ref_id: document.ref_id,
        doc_code: document.doc_code,
        rec_resource_id,
        url: document.url,
        title: document.title,
        extension: document.extension,
      },
    });

    return this.mapResponse(result);
  }

  async update(
    rec_resource_id: string,
    ref_id: string,
    document: RecreationResourceDocDto,
  ): Promise<RecreationResourceDocDto> {
    const result = await this.prisma.recreation_resource_docs.update({
      where: {
        rec_resource_id,
        ref_id: ref_id,
      },
      data: {
        doc_code: document.doc_code,
        url: document.url,
        title: document.title,
        extension: document.extension,
      },
    });

    return this.mapResponse(result);
  }

  async delete(
    rec_resource_id: string,
    ref_id: string,
  ): Promise<RecreationResourceDocDto | null> {
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
}
