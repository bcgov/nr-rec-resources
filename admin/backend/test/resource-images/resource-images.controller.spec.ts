import { AppConfigModule } from "@/app-config/app-config.module";
import { DamApiService } from "@/dam-api/dam-api.service";
import { PrismaService } from "@/prisma.service";
import { ResourceImagesController } from "@/resource-images/resource-images.controller";
import { ResourceImagesService } from "@/resource-images/service/resource-images.service";
import { HttpException, INestApplication } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { Readable } from "stream";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

describe("ResourceImagesController", () => {
  let controller: ResourceImagesController;
  let resourceImagesService: ResourceImagesService;
  let app: INestApplication;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppConfigModule],
      controllers: [ResourceImagesController],
      providers: [
        ResourceImagesService,
        {
          provide: PrismaService,
          useValue: {},
        },
        {
          provide: DamApiService,
          useValue: {},
        },
      ],
    }).compile();

    resourceImagesService = module.get<ResourceImagesService>(
      ResourceImagesService,
    );
    controller = module.get<ResourceImagesController>(ResourceImagesController);
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

  describe("getImageByResourceId", () => {
    it("should return a Recreation Resource image", async () => {
      const result = {
        rec_resource_id: "REC1735",
        caption: "caption change 321",
        ref_id: "11829",
        created_at: "2025-07-08T20:26:01.793Z",
        recreation_resource_image_variants: [
          {
            url: "/filestore/9/2/8/1/1_b082d7e1136f066/11829col_044f8f9a9294732.jpg?v=1752006360",
            extension: "jpg",
            width: 100,
            height: 57,
            size_code: "col",
            created_at: "2025-07-08T20:26:01.793Z",
          },
          {
            url: "/filestore/9/2/8/1/1_b082d7e1136f066/11829_ea64bbf1713aa29.png?v=1752006359",
            extension: "png",
            width: 1673,
            height: 961,
            size_code: "original",
            created_at: "2025-07-08T20:26:01.793Z",
          },
        ],
      };
      vi.spyOn(resourceImagesService, "getImageByResourceId").mockResolvedValue(
        result as any,
      );
      expect(await controller.getImageByResourceId("REC0001", "11535")).toBe(
        result,
      );
    });

    it("should throw error if recreation resource not found", async () => {
      vi.spyOn(resourceImagesService, "getImageByResourceId").mockRejectedValue(
        new HttpException("Recreation Resource document not found", 404),
      );
      try {
        await controller.getImageByResourceId("REC0001", "11535");
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
          rec_resource_id: "REC1735",
          caption: "caption change 321",
          ref_id: "11829",
          created_at: "2025-07-08T20:26:01.793Z",
          recreation_resource_image_variants: [
            {
              url: "/filestore/9/2/8/1/1_b082d7e1136f066/11829col_044f8f9a9294732.jpg?v=1752006360",
              extension: "jpg",
              width: 100,
              height: 57,
              size_code: "col",
              created_at: "2025-07-08T20:26:01.793Z",
            },
            {
              url: "/filestore/9/2/8/1/1_b082d7e1136f066/11829_ea64bbf1713aa29.png?v=1752006359",
              extension: "png",
              width: 1673,
              height: 961,
              size_code: "original",
              created_at: "2025-07-08T20:26:01.793Z",
            },
          ],
        },
      ];
      vi.spyOn(resourceImagesService, "getAll").mockResolvedValue(
        result as any,
      );
      expect(await controller.getAll("REC0001")).toBe(result);
    });

    it("should throw error if recreation resource not found", async () => {
      vi.spyOn(resourceImagesService, "getAll").mockRejectedValue(
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
    it("should create and return a Recreation Resource image", async () => {
      const result = {
        rec_resource_id: "REC1735",
        ref_id: "11829",
        caption: "new resource image",
        updated_at: "2025-07-08T20:26:01.793Z",
        updated_by: null,
        created_at: "2025-07-08T20:26:01.793Z",
        created_by: null,
      };
      vi.spyOn(resourceImagesService, "create").mockResolvedValue(
        result as any,
      );
      expect(
        await controller.createRecreationResourceImage(
          "REC0001",
          { caption: "caption" },
          {
            originalname: "sample.name",
            mimetype: "application/jpg",
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
      vi.spyOn(resourceImagesService, "create").mockRejectedValue(
        new HttpException("Recreation Resource not found", 404),
      );
      try {
        await controller.createRecreationResourceImage(
          "REC0001",
          { caption: "caption" },
          {
            originalname: "sample.name",
            mimetype: "application/jpg",
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
      vi.spyOn(resourceImagesService, "create").mockRejectedValue(
        new HttpException("File Type not allowed", 415),
      );
      try {
        await controller.createRecreationResourceImage(
          "REC0001",
          { caption: "caption" },
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
        rec_resource_id: "REC1735",
        ref_id: "11829",
        caption: "caption change 321",
        updated_at: "2025-07-08T20:26:01.793Z",
        updated_by: null,
        created_at: "2025-07-08T20:26:01.793Z",
        created_by: null,
      };
      vi.spyOn(resourceImagesService, "update").mockResolvedValue(
        result as any,
      );
      expect(
        await controller.update(
          "REC0001",
          "11535",
          { caption: "caption" },
          {
            originalname: "sample.name",
            mimetype: "application/jpg",
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
      vi.spyOn(resourceImagesService, "update").mockRejectedValue(
        new HttpException("Recreation Resource not found", 404),
      );
      try {
        await controller.update(
          "REC0001",
          "11535",
          { caption: "caption" },
          {
            originalname: "sample.name",
            mimetype: "application/jpg",
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
      vi.spyOn(resourceImagesService, "update").mockRejectedValue(
        new HttpException("File Type not allowed", 415),
      );
      try {
        await controller.update(
          "REC0001",
          "11535",
          { caption: "caption" },
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
        rec_resource_id: "REC1735",
        ref_id: "11829",
        caption: "caption change 321",
        updated_at: "2025-07-08T20:26:01.793Z",
        updated_by: null,
        created_at: "2025-07-08T20:26:01.793Z",
        created_by: null,
      };
      vi.spyOn(resourceImagesService, "delete").mockResolvedValue(
        result as any,
      );
      expect(await controller.delete("REC0001", "11535")).toBe(result);
    });

    it("should throw error if recreation resource not found", async () => {
      vi.spyOn(resourceImagesService, "delete").mockRejectedValue(
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
