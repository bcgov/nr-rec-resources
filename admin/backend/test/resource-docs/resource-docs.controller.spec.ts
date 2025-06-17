import { Test, TestingModule } from "@nestjs/testing";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ResourceDocsController } from "../../src/resource-docs/resource-docs.controller";
import { ResourceDocsService } from "../../src/resource-docs/service/resource-docs.service";
import { PrismaService } from "src/prisma.service";
import { HttpException, INestApplication } from "@nestjs/common";
import { Readable } from "stream";

describe("ResourceDocsController", () => {
  let controller: ResourceDocsController;
  let resourceDocsService: ResourceDocsService;
  let app: INestApplication;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ResourceDocsController],
      providers: [
        ResourceDocsService,
        {
          provide: PrismaService,
          useValue: {},
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
    await app.close();
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
      vi.spyOn(resourceDocsService, "getById").mockResolvedValue(result as any);
      expect(await controller.getById("REC0001", "11535")).toBe(result);
    });

    it("should throw error if recreation resource not found", async () => {
      vi.spyOn(resourceDocsService, "getById").mockResolvedValue(null);
      try {
        await controller.getById("REC0001", "11535");
      } catch (e) {
        expect(e).toBeInstanceOf(HttpException);
        expect(e.message).toBe("Recreation Resource not found.");
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
      vi.spyOn(resourceDocsService, "getAll").mockResolvedValue(null);
      try {
        await controller.getAll("REC0001");
      } catch (e) {
        expect(e).toBeInstanceOf(HttpException);
        expect(e.message).toBe("Recreation Resource not found.");
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
        await controller.create(
          "REC0001",
          { title: "title" },
          {
            originalname: "sample.name",
            mimetype: "sample.type",
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
        new HttpException("Recreation Resource not found.", 500),
      );
      try {
        await controller.create(
          "REC0001",
          { title: "title" },
          {
            originalname: "sample.name",
            mimetype: "sample.type",
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
        expect(e.message).toBe("Recreation Resource not found.");
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
            mimetype: "sample.type",
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
        new HttpException("Recreation Resource not found.", 500),
      );
      try {
        await controller.update(
          "REC0001",
          "11535",
          { title: "title" },
          {
            originalname: "sample.name",
            mimetype: "sample.type",
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
        expect(e.message).toBe("Recreation Resource not found.");
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
      vi.spyOn(resourceDocsService, "delete").mockResolvedValue(null);
      try {
        await controller.delete("REC0001", "11535");
      } catch (e) {
        expect(e).toBeInstanceOf(HttpException);
        expect(e.message).toBe("Recreation Resource not found.");
      }
    });
  });
});
