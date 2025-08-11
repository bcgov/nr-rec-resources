import { AppConfigModule } from "@/app-config/app-config.module";
import { DamApiService } from "@/dam-api/dam-api.service";
import { ResourceDocsService } from "@/resource-docs/service/resource-docs.service";
import { Test, TestingModule } from "@nestjs/testing";
import { PrismaService } from "src/prisma.service";
import { PresignedUploadService } from "src/upload/services/presigned-upload.service";
import { Readable } from "stream";
import { beforeEach, describe, expect, it, Mocked, vi } from "vitest";

const mockedResources = [
  {
    doc_code: "RM",
    rec_resource_id: "REC136003",
    url: "/filestore/5/3/5/1/1_2c1da4c27a1e0e1/11535_e5606d60c4e2e44.pdf",
    title: "Tenquille Lake - Hawint Map",
    ref_id: "11535",
    extension: "pdf",
    recreation_resource_doc_code: {
      description: "Recreation Map",
    },
    doc_code_description: "Recreation Map",
  },
  {
    doc_code: "RM",
    rec_resource_id: "REC136003",
    url: "/filestore/1/4/5/1/1_234efdbc05f408b/11541_731668cf8d75c56.pdf",
    title: "Tenquille Lake - Hawint Map",
    ref_id: "11541",
    extension: "pdf",
    recreation_resource_doc_code: {
      description: "Recreation Map",
    },
    doc_code_description: "Recreation Map",
  },
  {
    doc_code: "RM",
    rec_resource_id: "REC136003",
    url: "/filestore/5/2/7/1/1_d013539987403c7/11725_e98a7f0c65e33e2.pdf",
    title: "new resource",
    ref_id: "11725",
    extension: "pdf",
    recreation_resource_doc_code: {
      description: "Recreation Map",
    },
    doc_code_description: "Recreation Map",
  },
  {
    doc_code: "RM",
    rec_resource_id: "REC136003",
    url: "/filestore/1/3/7/1/1_bcd7fc4a17d0abf/11731_ab40148e90babc2.pdf",
    title: "new resource",
    ref_id: "11731",
    extension: "pdf",
    recreation_resource_doc_code: {
      description: "Recreation Map",
    },
    doc_code_description: "Recreation Map",
  },
  {
    doc_code: "RM",
    rec_resource_id: "REC136003",
    url: "/filestore/9/3/7/1/1_c2eb7a8bcf6e716/11739_44b107fc764e60a.pdf",
    title: "new resource",
    ref_id: "11739",
    extension: "pdf",
    recreation_resource_doc_code: {
      description: "Recreation Map",
    },
    doc_code_description: "Recreation Map",
  },
];

vi.mock("fs");

describe("ResourceDocsService", () => {
  let prismaService: Mocked<PrismaService>;
  let service: ResourceDocsService;
  let damApiService: Mocked<DamApiService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppConfigModule],
      providers: [
        ResourceDocsService,
        {
          provide: PrismaService,
          useValue: {
            $transaction: vi.fn(),
            recreation_resource_docs: {
              findUnique: vi.fn(),
              findMany: vi.fn(),
              create: vi.fn(),
              delete: vi.fn(),
              update: vi.fn(),
            },
            recreation_resource: {
              findUnique: vi.fn(),
            },
          },
        },
        {
          provide: DamApiService,
          useValue: {
            createResource: vi.fn(),
            uploadFile: vi.fn(),
            addResourceToCollection: vi.fn(),
            getResourcePath: vi.fn(),
            deleteResource: vi.fn(),
            createAndUploadDocument: vi.fn(),
          },
        },
        {
          provide: PresignedUploadService,
          useValue: {
            generatePresignedUploadUrl: vi.fn(),
            completeDirectUpload: vi.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ResourceDocsService>(ResourceDocsService);
    prismaService = module.get(PrismaService);
    damApiService = module.get(DamApiService);
  });

  describe("getById", () => {
    it("should return one resource", async () => {
      vi.mocked(
        prismaService.recreation_resource_docs.findUnique,
      ).mockResolvedValue(mockedResources[0] as any);

      const result = await service.getDocumentByResourceId("REC0001", "11535");
      expect(result).toMatchObject(mockedResources[0] as any);
    });

    it("should return status 404 if resource not found", async () => {
      vi.mocked(
        prismaService.recreation_resource_docs.findUnique,
      ).mockResolvedValueOnce(null);
      try {
        await service.getDocumentByResourceId("REC0001", "11535");
      } catch (err) {
        expect(err.status).toBe(404);
      }
    });
  });

  describe("getAll", () => {
    it("should return all doc resources related to the resource", async () => {
      vi.mocked(
        prismaService.recreation_resource_docs.findMany,
      ).mockResolvedValue(mockedResources as any);

      const result = await service.getAll("REC0001");
      expect(result).toMatchObject(mockedResources);
    });

    it("should return empty array if resource not found", async () => {
      vi.mocked(
        prismaService.recreation_resource_docs.findMany,
      ).mockResolvedValueOnce([]);
      const result = await service.getAll("NONEXISTENT");
      expect(result?.length).toBe(0);
    });
  });

  describe("create", () => {
    const baseFile = {
      originalname: "sample.name",
      mimetype: "application/pdf",
      path: "sample.url",
      buffer: Buffer.from("file"),
      fieldname: "",
      encoding: "",
      size: 0,
      stream: Readable.from(["test content"]),
      destination: "",
      filename: "",
    };
    beforeEach(() => {
      vi.clearAllMocks();
    });
    it("should return the created resource", async () => {
      const file = { ...baseFile };
      vi.mocked(damApiService.createAndUploadDocument).mockResolvedValueOnce({
        ref_id: "ref123",
        files: [
          {
            size_code: "original",
            url: "https://dam-url.com/path/file.pdf?v=123",
            path: "file.pdf",
          },
        ],
      });
      vi.mocked(prismaService.recreation_resource.findUnique).mockResolvedValue(
        mockedResources[0] as any,
      );
      vi.mocked(
        prismaService.recreation_resource_docs.create,
      ).mockResolvedValue(mockedResources[0] as any);

      const result = await service.create("REC0001", "Title", file);
      expect(result).toMatchObject(mockedResources[0] as any);
    });

    it("should return the created resource with no params on original path", async () => {
      const file = { ...baseFile };
      vi.mocked(damApiService.createAndUploadDocument).mockResolvedValueOnce({
        ref_id: "ref123",
        files: [
          {
            size_code: "original",
            url: "https://dam-url.com/path/file.pdf",
            path: "file.pdf",
          },
        ],
      });
      vi.mocked(prismaService.recreation_resource.findUnique).mockResolvedValue(
        mockedResources[0] as any,
      );
      vi.mocked(
        prismaService.recreation_resource_docs.create,
      ).mockResolvedValue(mockedResources[0] as any);

      const result = await service.create("REC0001", "Title", file);
      expect(result).toMatchObject(mockedResources[0] as any);
    });

    it("should return status 404 if resource not found", async () => {
      const file = { ...baseFile };
      vi.mocked(damApiService.createAndUploadDocument).mockResolvedValueOnce({
        ref_id: "ref123",
        files: [
          {
            size_code: "original",
            url: "https://dam-url.com/path/file.pdf?v=123",
            path: "file.pdf",
          },
        ],
      });
      vi.mocked(prismaService.recreation_resource.findUnique).mockResolvedValue(
        null,
      );
      vi.mocked(
        prismaService.recreation_resource_docs.create,
      ).mockResolvedValueOnce(null as any);
      try {
        await service.create("REC0001", "Title", file);
      } catch (err) {
        expect(err.status).toBe(404);
      }
    });

    it("should return status 415 if the file type is invalid", async () => {
      const file = { ...baseFile, mimetype: "image/jpeg" };
      vi.mocked(damApiService.createAndUploadDocument).mockResolvedValueOnce({
        ref_id: "ref123",
        files: [
          {
            size_code: "original",
            url: "https://dam-url.com/path/file.pdf?v=123",
            path: "file.pdf",
          },
        ],
      });
      vi.mocked(prismaService.recreation_resource.findUnique).mockResolvedValue(
        null,
      );
      vi.mocked(
        prismaService.recreation_resource_docs.create,
      ).mockResolvedValueOnce(null as any);
      try {
        await service.create("REC0001", "Title", file);
      } catch (err) {
        expect(err.status).toBe(415);
      }
    });
  });

  describe("update", () => {
    const baseFile = {
      originalname: "sample.name",
      mimetype: "application/pdf",
      path: "sample.url",
      buffer: Buffer.from("file"),
      fieldname: "",
      encoding: "",
      size: 0,
      stream: Readable.from(["test content"]),
      destination: "",
      filename: "",
    };
    beforeEach(() => {
      vi.clearAllMocks();
    });
    it("should update and return the resource", async () => {
      const file = { ...baseFile };
      vi.mocked(damApiService.uploadFile).mockResolvedValueOnce(undefined);
      vi.mocked(
        prismaService.recreation_resource_docs.findUnique,
      ).mockResolvedValue(mockedResources[0] as any);
      vi.mocked(
        prismaService.recreation_resource_docs.update,
      ).mockResolvedValue(mockedResources[0] as any);

      const result = await service.update("REC0001", "11535", "Title", file);
      expect(result).not.toBeNull();
    });

    it("should return status 404 if resource not found", async () => {
      const file = { ...baseFile };
      vi.mocked(
        prismaService.recreation_resource_docs.findUnique,
      ).mockResolvedValueOnce(null);
      try {
        await service.update("REC0001", "11535", "Title", file);
      } catch (err) {
        expect(err.status).toBe(404);
      }
    });

    it("should return status 415 if the file type is invalid", async () => {
      const file = { ...baseFile, mimetype: "image/jpeg" };
      vi.mocked(
        prismaService.recreation_resource_docs.findUnique,
      ).mockResolvedValueOnce(mockedResources[0] as any);
      try {
        await service.update("REC0001", "11535", "Title", file);
      } catch (err) {
        expect(err.status).toBe(415);
      }
    });
  });

  describe("delete", () => {
    it("should return the deleted resource", async () => {
      vi.mocked(damApiService.deleteResource).mockResolvedValueOnce(undefined);
      vi.mocked(
        prismaService.recreation_resource_docs.delete,
      ).mockResolvedValue(mockedResources[0] as any);

      const result = await service.delete("REC0001", "11535");
      expect(result).toMatchObject(mockedResources[0] as any);
    });

    it("should return null if resource not found", async () => {
      vi.mocked(
        prismaService.recreation_resource_docs.delete,
      ).mockResolvedValueOnce(null as any);
      try {
        await service.delete("REC0001", "11535");
      } catch (err) {
        expect(err.status).toBe(404);
      }
    });
  });
});
