import { AppConfigModule } from "@/app-config/app-config.module";
import { DamApiService } from "@/dam-api/dam-api.service";
import { ResourceDocsController } from "@/resource-docs/resource-docs.controller";
import { ResourceDocsService } from "@/resource-docs/service/resource-docs.service";
import { HttpException, INestApplication } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { PrismaService } from "src/prisma.service";
import { Readable } from "stream";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

describe("ResourceDocsController", () => {
  let controller: ResourceDocsController;
  let resourceDocsService: ResourceDocsService;
  let app: INestApplication;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppConfigModule],
      controllers: [ResourceDocsController],
      providers: [
        ResourceDocsService,
        {
          provide: PrismaService,
          useValue: {},
        },
        {
          provide: DamApiService,
          useValue: {
            createAndUploadDocument: vi.fn(),
            uploadFile: vi.fn(),
            deleteResource: vi.fn(),
          },
        },
      ],
    }).compile();

    resourceDocsService = module.get<ResourceDocsService>(ResourceDocsService);
    controller = module.get<ResourceDocsController>(ResourceDocsController);
    app = module.createNestApplication();
    await app.init();
  });

  // Close the app after each test
  afterEach(async () => {
    if (app) {
      await app.close();
    }
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  describe("getById", () => {
    it("should return a Recreation Resource document", async () => {
      const result = {
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
      };
      vi.spyOn(
        resourceDocsService,
        "getDocumentByResourceId",
      ).mockResolvedValue(result as any);
      expect(await controller.getDocumentByResourceId("REC0001", "11535")).toBe(
        result,
      );
    });

    it("should throw error if recreation resource not found", async () => {
      vi.spyOn(
        resourceDocsService,
        "getDocumentByResourceId",
      ).mockRejectedValue(
        new HttpException("Recreation Resource document not found", 404),
      );
      try {
        await controller.getDocumentByResourceId("REC0001", "11535");
      } catch (e) {
        expect(e).toBeInstanceOf(HttpException);
        expect(e.message).toBe("Recreation Resource document not found");
        expect(e.getStatus()).toBe(404);
      }
    });
  });

  describe("getAll", () => {
    it("should return a list of Recreation Resource document", async () => {
      const result = [
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
          url: "/filestore/5/2/7/1/1_d013539987403c7/11725_e98a7f0c65e33e2.pdf",
          title: "new resource",
          ref_id: "11725",
          extension: "pdf",
          recreation_resource_doc_code: {
            description: "Recreation Map",
          },
          doc_code_description: "Recreation Map",
        },
      ];
      vi.spyOn(resourceDocsService, "getAll").mockResolvedValue(result as any);
      expect(await controller.getAll("REC0001")).toBe(result);
    });

    it("should throw error if recreation resource not found", async () => {
      vi.spyOn(resourceDocsService, "getAll").mockRejectedValue(
        new HttpException("Recreation Resource document not found", 404),
      );
      try {
        await controller.getAll("REC0001");
      } catch (e) {
        expect(e).toBeInstanceOf(HttpException);
        expect(e.message).toBe("Recreation Resource document not found");
        expect(e.getStatus()).toBe(404);
      }
    });
  });

  describe("create", () => {
    it("should create and return a Recreation Resource document", async () => {
      const result = {
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
      };
      vi.spyOn(resourceDocsService, "create").mockResolvedValue(result as any);
      expect(
        await controller.createRecreationResourceDocument(
          "REC0001",
          { title: "title" },
          {
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
          },
        ),
      ).toBe(result);
    });

    it("should throw error if recreation resource not found", async () => {
      vi.spyOn(resourceDocsService, "create").mockRejectedValue(
        new HttpException("Recreation Resource not found", 404),
      );
      try {
        await controller.createRecreationResourceDocument(
          "REC0001",
          { title: "title" },
          {
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
          },
        );
      } catch (e) {
        expect(e).toBeInstanceOf(HttpException);
        expect(e.message).toBe("Recreation Resource not found");
        expect(e.getStatus()).toBe(404);
      }
    });

    it("should throw error if file type not allowed", async () => {
      vi.spyOn(resourceDocsService, "create").mockRejectedValue(
        new HttpException("File Type not allowed", 415),
      );
      try {
        await controller.createRecreationResourceDocument(
          "REC0001",
          { title: "title" },
          {
            originalname: "sample.name",
            mimetype: "application/zip",
            path: "sample.url",
            buffer: Buffer.from("file"),
            fieldname: "",
            encoding: "",
            size: 0,
            stream: Readable.from(["test content"]),
            destination: "",
            filename: "",
          },
        );
      } catch (e) {
        expect(e).toBeInstanceOf(HttpException);
        expect(e.message).toBe("File Type not allowed");
        expect(e.getStatus()).toBe(415);
      }
    });
  });

  describe("update", () => {
    it("should update and return the Recreation Resource document", async () => {
      const result = {
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
      };
      vi.spyOn(resourceDocsService, "update").mockResolvedValue(result as any);
      expect(
        await controller.update(
          "REC0001",
          "11535",
          { title: "title" },
          {
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
          },
        ),
      ).toBe(result);
    });

    it("should throw error if recreation resource not found", async () => {
      vi.spyOn(resourceDocsService, "update").mockRejectedValue(
        new HttpException("Recreation Resource not found", 404),
      );
      try {
        await controller.update(
          "REC0001",
          "11535",
          { title: "title" },
          {
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
          },
        );
      } catch (e) {
        expect(e).toBeInstanceOf(HttpException);
        expect(e.message).toBe("Recreation Resource not found");
        expect(e.getStatus()).toBe(404);
      }
    });

    it("should throw error if file type not allowed", async () => {
      vi.spyOn(resourceDocsService, "update").mockRejectedValue(
        new HttpException("File Type not allowed", 415),
      );
      try {
        await controller.update(
          "REC0001",
          "11535",
          { title: "title" },
          {
            originalname: "sample.name",
            mimetype: "application/zip",
            path: "sample.url",
            buffer: Buffer.from("file"),
            fieldname: "",
            encoding: "",
            size: 0,
            stream: Readable.from(["test content"]),
            destination: "",
            filename: "",
          },
        );
      } catch (e) {
        expect(e).toBeInstanceOf(HttpException);
        expect(e.message).toBe("File Type not allowed");
        expect(e.getStatus()).toBe(415);
      }
    });
  });

  describe("delete", () => {
    it("should delete and return the deleted Recreation Resource document", async () => {
      const result = {
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
      };
      vi.spyOn(resourceDocsService, "delete").mockResolvedValue(result as any);
      expect(await controller.delete("REC0001", "11535")).toBe(result);
    });

    it("should throw error if recreation resource not found", async () => {
      vi.spyOn(resourceDocsService, "delete").mockRejectedValue(
        new HttpException("Recreation Resource not found", 404),
      );
      try {
        await controller.delete("REC0001", "11535");
      } catch (e) {
        expect(e).toBeInstanceOf(HttpException);
        expect(e.message).toBe("Recreation Resource not found");
        expect(e.getStatus()).toBe(404);
      }
    });
  });
});
