import { AppConfigModule } from "@/app-config/app-config.module";
import { DamApiService } from "@/dam-api/dam-api.service";
import { ResourceImagesService } from "@/resource-images/service/resource-images.service";
import { HttpException } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { PrismaService } from "src/prisma.service";
import { Readable } from "stream";
import { beforeEach, describe, expect, it, Mocked, vi } from "vitest";

const mockedResources = [
  {
    rec_resource_id: "REC1735",
    caption: "Abbott Lake - REC1735",
    ref_id: "33272",
    created_at: "2025-03-26T23:33:06.175Z",
    recreation_resource_image_variants: [
      {
        url: "/filestore/2/7/2/3/3_ce2c0d2d1f7b567/33272_53af5f9880e0b58.webp?v=1742978093",
        extension: "webp",
        width: 1440,
        height: 1080,
        size_code: "original",
        created_at: "2025-03-26T23:33:06.175Z",
      },
      {
        url: "/filestore/2/7/2/3/3_ce2c0d2d1f7b567/33272hpr_50d64095d1b545b.jpg?v=1742978094",
        extension: "jpg",
        width: 1440,
        height: 1080,
        size_code: "hpr",
        created_at: "2025-03-26T23:33:06.175Z",
      },
      {
        url: "/filestore/2/7/2/3/3_ce2c0d2d1f7b567/33272scr_a6b28a4a883e705.jpg?v=1742978095",
        extension: "jpg",
        width: 1067,
        height: 800,
        size_code: "scr",
        created_at: "2025-03-26T23:33:06.175Z",
      },
      {
        url: "/filestore/2/7/2/3/3_ce2c0d2d1f7b567/33272con_b59229a84e96074.jpg?v=1742978095",
        extension: "jpg",
        width: 987,
        height: 740,
        size_code: "con",
        created_at: "2025-03-26T23:33:06.175Z",
      },
      {
        url: "/filestore/2/7/2/3/3_ce2c0d2d1f7b567/33272lpr_00c2c4e2c44f8be.jpg?v=1742978095",
        extension: "jpg",
        width: 1000,
        height: 750,
        size_code: "lpr",
        created_at: "2025-03-26T23:33:06.175Z",
      },
      {
        url: "/filestore/2/7/2/3/3_ce2c0d2d1f7b567/33272pre_4ca8f79b70e3ae4.jpg?v=1742978095",
        extension: "jpg",
        width: 640,
        height: 480,
        size_code: "pre",
        created_at: "2025-03-26T23:33:06.175Z",
      },
      {
        url: "/filestore/2/7/2/3/3_ce2c0d2d1f7b567/33272ili_d11b6a9f0e2ea72.jpg?v=1742978096",
        extension: "jpg",
        width: 700,
        height: 525,
        size_code: "ili",
        created_at: "2025-03-26T23:33:06.175Z",
      },
      {
        url: "/filestore/2/7/2/3/3_ce2c0d2d1f7b567/33272lan_2117477c188cbcf.jpg?v=1742978096",
        extension: "jpg",
        width: 720,
        height: 540,
        size_code: "lan",
        created_at: "2025-03-26T23:33:06.175Z",
      },
      {
        url: "/filestore/2/7/2/3/3_ce2c0d2d1f7b567/33272llc_cf3569d8facb75b.jpg?v=1742978096",
        extension: "jpg",
        width: 507,
        height: 380,
        size_code: "llc",
        created_at: "2025-03-26T23:33:06.175Z",
      },
      {
        url: "/filestore/2/7/2/3/3_ce2c0d2d1f7b567/33272rsr_bf8333d75f22eb0.jpg?v=1742978096",
        extension: "jpg",
        width: 525,
        height: 394,
        size_code: "rsr",
        created_at: "2025-03-26T23:33:06.175Z",
      },
      {
        url: "/filestore/2/7/2/3/3_ce2c0d2d1f7b567/33272pcs_f2f236377af69c4.jpg?v=1742978096",
        extension: "jpg",
        width: 335,
        height: 251,
        size_code: "pcs",
        created_at: "2025-03-26T23:33:06.175Z",
      },
      {
        url: "/filestore/2/7/2/3/3_ce2c0d2d1f7b567/33272thm_d688063923eb149.jpg?v=1742978097",
        extension: "jpg",
        width: 175,
        height: 131,
        size_code: "thm",
        created_at: "2025-03-26T23:33:06.175Z",
      },
      {
        url: "/filestore/2/7/2/3/3_ce2c0d2d1f7b567/33272col_03512325f568271.jpg?v=1742978097",
        extension: "jpg",
        width: 100,
        height: 75,
        size_code: "col",
        created_at: "2025-03-26T23:33:06.175Z",
      },
    ],
  },
  {
    rec_resource_id: "REC1735",
    caption: "Abbott Lake - REC1735",
    ref_id: "30863",
    created_at: "2025-03-26T23:33:06.175Z",
    recreation_resource_image_variants: [
      {
        url: "/filestore/3/6/8/0/3_e6bbf6ae0cadf83/30863_1eece985e2af6f3.webp?v=1742970902",
        extension: "webp",
        width: 1440,
        height: 1080,
        size_code: "original",
        created_at: "2025-03-26T23:33:06.175Z",
      },
      {
        url: "/filestore/3/6/8/0/3_e6bbf6ae0cadf83/30863hpr_3f8e81713688a1b.jpg?v=1742970902",
        extension: "jpg",
        width: 1440,
        height: 1080,
        size_code: "hpr",
        created_at: "2025-03-26T23:33:06.175Z",
      },
      {
        url: "/filestore/3/6/8/0/3_e6bbf6ae0cadf83/30863scr_38e8100515e466d.jpg?v=1742970903",
        extension: "jpg",
        width: 1067,
        height: 800,
        size_code: "scr",
        created_at: "2025-03-26T23:33:06.175Z",
      },
      {
        url: "/filestore/3/6/8/0/3_e6bbf6ae0cadf83/30863con_80a157e660f949b.jpg?v=1742970903",
        extension: "jpg",
        width: 987,
        height: 740,
        size_code: "con",
        created_at: "2025-03-26T23:33:06.175Z",
      },
      {
        url: "/filestore/3/6/8/0/3_e6bbf6ae0cadf83/30863lpr_f6d95848d86f983.jpg?v=1742970903",
        extension: "jpg",
        width: 1000,
        height: 750,
        size_code: "lpr",
        created_at: "2025-03-26T23:33:06.175Z",
      },
      {
        url: "/filestore/3/6/8/0/3_e6bbf6ae0cadf83/30863pre_5f23aea331e5b28.jpg?v=1742970903",
        extension: "jpg",
        width: 640,
        height: 480,
        size_code: "pre",
        created_at: "2025-03-26T23:33:06.175Z",
      },
      {
        url: "/filestore/3/6/8/0/3_e6bbf6ae0cadf83/30863ili_f5df83a659d5468.jpg?v=1742970904",
        extension: "jpg",
        width: 700,
        height: 525,
        size_code: "ili",
        created_at: "2025-03-26T23:33:06.175Z",
      },
      {
        url: "/filestore/3/6/8/0/3_e6bbf6ae0cadf83/30863lan_12da682701a455e.jpg?v=1742970904",
        extension: "jpg",
        width: 720,
        height: 540,
        size_code: "lan",
        created_at: "2025-03-26T23:33:06.175Z",
      },
      {
        url: "/filestore/3/6/8/0/3_e6bbf6ae0cadf83/30863llc_4e77fff865f9e31.jpg?v=1742970904",
        extension: "jpg",
        width: 507,
        height: 380,
        size_code: "llc",
        created_at: "2025-03-26T23:33:06.175Z",
      },
      {
        url: "/filestore/3/6/8/0/3_e6bbf6ae0cadf83/30863rsr_a2e7e2dddd54d4a.jpg?v=1742970904",
        extension: "jpg",
        width: 525,
        height: 394,
        size_code: "rsr",
        created_at: "2025-03-26T23:33:06.175Z",
      },
      {
        url: "/filestore/3/6/8/0/3_e6bbf6ae0cadf83/30863pcs_31cbda7b73501b9.jpg?v=1742970904",
        extension: "jpg",
        width: 335,
        height: 251,
        size_code: "pcs",
        created_at: "2025-03-26T23:33:06.175Z",
      },
      {
        url: "/filestore/3/6/8/0/3_e6bbf6ae0cadf83/30863thm_1a60975eaa048ca.jpg?v=1742970905",
        extension: "jpg",
        width: 175,
        height: 131,
        size_code: "thm",
        created_at: "2025-03-26T23:33:06.175Z",
      },
      {
        url: "/filestore/3/6/8/0/3_e6bbf6ae0cadf83/30863col_40143ccebe2d9fb.jpg?v=1742970905",
        extension: "jpg",
        width: 100,
        height: 75,
        size_code: "col",
        created_at: "2025-03-26T23:33:06.175Z",
      },
    ],
  },
  {
    rec_resource_id: "REC1735",
    caption: "Abbott Lake - REC1735",
    ref_id: "27953",
    created_at: "2025-03-26T23:33:06.175Z",
    recreation_resource_image_variants: [
      {
        url: "/filestore/3/5/9/7/2_54310885e27e146/27953_8e2def2b99b557c.webp?v=1742962225",
        extension: "webp",
        width: 1440,
        height: 1080,
        size_code: "original",
        created_at: "2025-03-26T23:33:06.175Z",
      },
      {
        url: "/filestore/3/5/9/7/2_54310885e27e146/27953hpr_3efdf28884e021a.jpg?v=1742962226",
        extension: "jpg",
        width: 1440,
        height: 1080,
        size_code: "hpr",
        created_at: "2025-03-26T23:33:06.175Z",
      },
      {
        url: "/filestore/3/5/9/7/2_54310885e27e146/27953scr_0750d9c3cabf8d2.jpg?v=1742962226",
        extension: "jpg",
        width: 1067,
        height: 800,
        size_code: "scr",
        created_at: "2025-03-26T23:33:06.175Z",
      },
      {
        url: "/filestore/3/5/9/7/2_54310885e27e146/27953con_f7c32f563a52267.jpg?v=1742962226",
        extension: "jpg",
        width: 987,
        height: 740,
        size_code: "con",
        created_at: "2025-03-26T23:33:06.175Z",
      },
      {
        url: "/filestore/3/5/9/7/2_54310885e27e146/27953lpr_c96c47cf361ebf5.jpg?v=1742962227",
        extension: "jpg",
        width: 1000,
        height: 750,
        size_code: "lpr",
        created_at: "2025-03-26T23:33:06.175Z",
      },
      {
        url: "/filestore/3/5/9/7/2_54310885e27e146/27953pre_4e31e8768484dc6.jpg?v=1742962227",
        extension: "jpg",
        width: 640,
        height: 480,
        size_code: "pre",
        created_at: "2025-03-26T23:33:06.175Z",
      },
      {
        url: "/filestore/3/5/9/7/2_54310885e27e146/27953ili_2fbf917945c4ccb.jpg?v=1742962227",
        extension: "jpg",
        width: 700,
        height: 525,
        size_code: "ili",
        created_at: "2025-03-26T23:33:06.175Z",
      },
      {
        url: "/filestore/3/5/9/7/2_54310885e27e146/27953lan_7af81c416afeefa.jpg?v=1742962227",
        extension: "jpg",
        width: 720,
        height: 540,
        size_code: "lan",
        created_at: "2025-03-26T23:33:06.175Z",
      },
      {
        url: "/filestore/3/5/9/7/2_54310885e27e146/27953llc_ca9bba50e39922a.jpg?v=1742962227",
        extension: "jpg",
        width: 507,
        height: 380,
        size_code: "llc",
        created_at: "2025-03-26T23:33:06.175Z",
      },
      {
        url: "/filestore/3/5/9/7/2_54310885e27e146/27953rsr_2716ff97cb06fe7.jpg?v=1742962228",
        extension: "jpg",
        width: 525,
        height: 394,
        size_code: "rsr",
        created_at: "2025-03-26T23:33:06.175Z",
      },
      {
        url: "/filestore/3/5/9/7/2_54310885e27e146/27953pcs_3ee26f56eea43de.jpg?v=1742962228",
        extension: "jpg",
        width: 335,
        height: 251,
        size_code: "pcs",
        created_at: "2025-03-26T23:33:06.175Z",
      },
      {
        url: "/filestore/3/5/9/7/2_54310885e27e146/27953thm_09e6feab4fc36c5.jpg?v=1742962228",
        extension: "jpg",
        width: 175,
        height: 131,
        size_code: "thm",
        created_at: "2025-03-26T23:33:06.175Z",
      },
      {
        url: "/filestore/3/5/9/7/2_54310885e27e146/27953col_271b932075268c7.jpg?v=1742962228",
        extension: "jpg",
        width: 100,
        height: 75,
        size_code: "col",
        created_at: "2025-03-26T23:33:06.175Z",
      },
    ],
  },
  {
    rec_resource_id: "REC1735",
    caption: "Abbott Lake 4 - REC1735",
    ref_id: "24220",
    created_at: "2025-03-26T23:33:06.175Z",
    recreation_resource_image_variants: [
      {
        url: "/filestore/0/2/2/4/2_8904484d6f089ea/24220_39d56c84be5e21b.webp?v=1742951043",
        extension: "webp",
        width: 1024,
        height: 768,
        size_code: "original",
        created_at: "2025-03-26T23:33:06.175Z",
      },
      {
        url: "/filestore/0/2/2/4/2_8904484d6f089ea/24220hpr_fd28ae66689919b.jpg?v=1742951044",
        extension: "jpg",
        width: 1024,
        height: 768,
        size_code: "hpr",
        created_at: "2025-03-26T23:33:06.175Z",
      },
      {
        url: "/filestore/0/2/2/4/2_8904484d6f089ea/24220scr_d864c571077ff74.jpg?v=1742951044",
        extension: "jpg",
        width: 1024,
        height: 768,
        size_code: "scr",
        created_at: "2025-03-26T23:33:06.175Z",
      },
      {
        url: "/filestore/0/2/2/4/2_8904484d6f089ea/24220con_0dfe9e75bad4a04.jpg?v=1742951044",
        extension: "jpg",
        width: 987,
        height: 740,
        size_code: "con",
        created_at: "2025-03-26T23:33:06.175Z",
      },
      {
        url: "/filestore/0/2/2/4/2_8904484d6f089ea/24220lpr_ea95061e15c65ae.jpg?v=1742951045",
        extension: "jpg",
        width: 1000,
        height: 750,
        size_code: "lpr",
        created_at: "2025-03-26T23:33:06.175Z",
      },
      {
        url: "/filestore/0/2/2/4/2_8904484d6f089ea/24220pre_189c55b69464ba6.jpg?v=1742951045",
        extension: "jpg",
        width: 640,
        height: 480,
        size_code: "pre",
        created_at: "2025-03-26T23:33:06.175Z",
      },
      {
        url: "/filestore/0/2/2/4/2_8904484d6f089ea/24220ili_1af157bad0cf87e.jpg?v=1742951045",
        extension: "jpg",
        width: 700,
        height: 525,
        size_code: "ili",
        created_at: "2025-03-26T23:33:06.175Z",
      },
      {
        url: "/filestore/0/2/2/4/2_8904484d6f089ea/24220lan_b14fdf961fcdab7.jpg?v=1742951045",
        extension: "jpg",
        width: 720,
        height: 540,
        size_code: "lan",
        created_at: "2025-03-26T23:33:06.175Z",
      },
      {
        url: "/filestore/0/2/2/4/2_8904484d6f089ea/24220llc_794597c36876efd.jpg?v=1742951045",
        extension: "jpg",
        width: 507,
        height: 380,
        size_code: "llc",
        created_at: "2025-03-26T23:33:06.175Z",
      },
      {
        url: "/filestore/0/2/2/4/2_8904484d6f089ea/24220rsr_9e722c3c230e7b3.jpg?v=1742951045",
        extension: "jpg",
        width: 525,
        height: 394,
        size_code: "rsr",
        created_at: "2025-03-26T23:33:06.175Z",
      },
      {
        url: "/filestore/0/2/2/4/2_8904484d6f089ea/24220pcs_1eeee455606e780.jpg?v=1742951045",
        extension: "jpg",
        width: 335,
        height: 251,
        size_code: "pcs",
        created_at: "2025-03-26T23:33:06.175Z",
      },
      {
        url: "/filestore/0/2/2/4/2_8904484d6f089ea/24220thm_13fd1afeb90af60.jpg?v=1742951046",
        extension: "jpg",
        width: 175,
        height: 131,
        size_code: "thm",
        created_at: "2025-03-26T23:33:06.175Z",
      },
      {
        url: "/filestore/0/2/2/4/2_8904484d6f089ea/24220col_371d6e4e34f85f8.jpg?v=1742951046",
        extension: "jpg",
        width: 100,
        height: 75,
        size_code: "col",
        created_at: "2025-03-26T23:33:06.175Z",
      },
    ],
  },
];

vi.mock("fs");

describe("ResourceImagesDocsService", () => {
  let prismaService: Mocked<PrismaService>;
  let service: ResourceImagesService;
  let damApiService: Mocked<DamApiService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppConfigModule],
      providers: [
        ResourceImagesService,
        {
          provide: PrismaService,
          useValue: {
            $transaction: vi.fn(),
            recreation_resource_images: {
              findUnique: vi.fn(),
              findMany: vi.fn(),
              create: vi.fn(),
              delete: vi.fn(),
              update: vi.fn(),
            },
            recreation_resource_image_variants: {
              deleteMany: vi.fn(),
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
            createAndUploadImage: vi.fn(),
            createAndUploadImageWithRetry: vi.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ResourceImagesService>(ResourceImagesService);
    prismaService = module.get(PrismaService);
    damApiService = module.get(DamApiService);
  });

  describe("getById", () => {
    it("should return one resource", async () => {
      vi.mocked(
        prismaService.recreation_resource_images.findUnique,
      ).mockResolvedValue(mockedResources[0] as any);

      const result = await service.getImageByResourceId("REC0001", "11535");
      expect(result).toMatchObject(mockedResources[0] as any);
    });

    it("should return status 404 if resource not found", async () => {
      vi.mocked(
        prismaService.recreation_resource_images.findUnique,
      ).mockResolvedValueOnce(null);
      try {
        await service.getImageByResourceId("REC0001", "11535");
      } catch (err) {
        expect(err.status).toBe(404);
      }
    });
  });

  describe("getAll", () => {
    it("should return all image resources related to the resource", async () => {
      vi.mocked(
        prismaService.recreation_resource_images.findMany,
      ).mockResolvedValue(mockedResources as any);

      const result = await service.getAll("REC0001");
      expect(result).toMatchObject(mockedResources);
    });

    it("should return empty array if resource not found", async () => {
      vi.mocked(
        prismaService.recreation_resource_images.findMany,
      ).mockResolvedValueOnce([]);
      const result = await service.getAll("NONEXISTENT");
      expect(result?.length).toBe(0);
    });
  });

  describe("create", () => {
    const file = {
      originalname: "sample.name",
      mimetype: "image/jpeg",
      path: "sample.url",
      buffer: Buffer.from("file"),
      fieldname: "",
      encoding: "",
      size: 0,
      stream: Readable.from(["test content"]),
      destination: "",
      filename: "",
    };
    it("should return the created resource", async () => {
      vi.mocked(
        damApiService.createAndUploadImageWithRetry,
      ).mockResolvedValueOnce({
        ref_id: "ref123",
        files: [
          {
            size_code: "original",
            url: "https://dam-url.com/path/file.jpg?v=123",
          },
          {
            size_code: "thm",
            url: "https://dam-url.com/path/file.jpg?v=123",
          },
          {
            size_code: "pre",
            url: "https://dam-url.com/path/file.jpg?v=123",
          },
        ],
      });
      vi.mocked(prismaService.recreation_resource.findUnique).mockResolvedValue(
        mockedResources[0] as any,
      );
      vi.mocked(
        prismaService.recreation_resource_images.create,
      ).mockResolvedValue(mockedResources[0] as any);

      const result = await service.create("REC0001", "Title", file);
      expect(result).toMatchObject(mockedResources[0] as any);
    });

    it("should return the created resource with no params on original path", async () => {
      vi.mocked(
        damApiService.createAndUploadImageWithRetry,
      ).mockResolvedValueOnce({
        ref_id: "ref123",
        files: [
          {
            size_code: "original",
            url: "https://dam-url.com/path/file.jpg?v=123",
          },
          {
            size_code: "thm",
            url: "https://dam-url.com/path/file.jpg?v=123",
          },
          {
            size_code: "pre",
            url: "https://dam-url.com/path/file.jpg?v=123",
          },
        ],
      });
      vi.mocked(prismaService.recreation_resource.findUnique).mockResolvedValue(
        mockedResources[0] as any,
      );
      vi.mocked(
        prismaService.recreation_resource_images.create,
      ).mockResolvedValue(mockedResources[0] as any);

      const result = await service.create("REC0001", "Title", file);
      expect(result).toMatchObject(mockedResources[0] as any);
    });

    it("should return status 404 if resource not found", async () => {
      vi.mocked(
        damApiService.createAndUploadImageWithRetry,
      ).mockResolvedValueOnce({
        ref_id: "ref123",
        files: [
          {
            size_code: "original",
            url: "https://dam-url.com/path/file.jpg?v=123",
          },
        ],
      });
      vi.mocked(prismaService.recreation_resource.findUnique).mockResolvedValue(
        null,
      );
      vi.mocked(
        prismaService.recreation_resource_images.create,
      ).mockResolvedValueOnce(null as any);
      try {
        await service.create("REC0001", "Title", file);
      } catch (err) {
        expect(err.status).toBe(404);
      }
    });

    it("should return the created resource retrying to get resource path", async () => {
      vi.mocked(
        damApiService.createAndUploadImageWithRetry,
      ).mockResolvedValueOnce({
        ref_id: "ref123",
        files: [
          {
            size_code: "original",
            url: "https://dam-url.com/path/file.jpg?v=123",
          },
          {
            size_code: "thm",
            url: "https://dam-url.com/path/file.jpg?v=123",
          },
          {
            size_code: "pre",
            url: "https://dam-url.com/path/file.jpg?v=123",
          },
        ],
      });
      vi.mocked(prismaService.recreation_resource.findUnique).mockResolvedValue(
        mockedResources[0] as any,
      );
      vi.mocked(
        prismaService.recreation_resource_images.create,
      ).mockResolvedValue(mockedResources[0] as any);

      const result = await service.create("REC0001", "Title", file);
      expect(result).toMatchObject(mockedResources[0] as any);
    });

    it("should return server error 500 after retrying to get resource path 3 times", async () => {
      vi.mocked(
        damApiService.createAndUploadImageWithRetry,
      ).mockRejectedValueOnce(
        new HttpException(
          "Error creating and uploading image with retry.",
          419,
        ),
      );
      vi.mocked(prismaService.recreation_resource.findUnique).mockResolvedValue(
        mockedResources[0] as any,
      );

      try {
        await service.create("REC0001", "Title", file);
      } catch (err) {
        expect(err.status).toBe(419);
      }
    });

    it("should return status 415 if the file type is invalid", async () => {
      file.mimetype = "application/zip";
      vi.mocked(prismaService.recreation_resource.findUnique).mockResolvedValue(
        mockedResources[0] as any,
      );
      try {
        await service.create("REC0001", "Title", file);
      } catch (err) {
        expect(err.status).toBe(415);
      }
    });
  });

  describe("update", () => {
    const file = {
      originalname: "sample.name",
      mimetype: "image/jpeg",
      path: "sample.url",
      buffer: Buffer.from("file"),
      fieldname: "",
      encoding: "",
      size: 0,
      stream: Readable.from(["test content"]),
      destination: "",
      filename: "",
    };
    it("should update and return the resource", async () => {
      vi.mocked(damApiService.uploadFile).mockResolvedValueOnce(undefined);
      vi.mocked(
        prismaService.recreation_resource_images.findUnique,
      ).mockResolvedValue(mockedResources[0] as any);
      vi.mocked(
        prismaService.recreation_resource_images.update,
      ).mockResolvedValue(mockedResources[0] as any);

      const result = await service.update("REC0001", "11535", "Title", file);
      expect(result).not.toBeNull();
    });

    it("should return status 404 if resource not found", async () => {
      vi.mocked(
        prismaService.recreation_resource_images.findUnique,
      ).mockResolvedValueOnce(null);
      try {
        await service.update("REC0001", "11535", "Title", file);
      } catch (err) {
        expect(err.status).toBe(404);
      }
    });

    it("should return status 415 if the file type is invalid", async () => {
      file.mimetype = "application/zip";
      vi.mocked(
        prismaService.recreation_resource_images.findUnique,
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
        prismaService.recreation_resource_image_variants.deleteMany,
      ).mockResolvedValue(
        mockedResources[0]?.recreation_resource_image_variants as any,
      );
      vi.mocked(
        prismaService.recreation_resource_images.delete,
      ).mockResolvedValue(mockedResources[0] as any);

      const result = await service.delete("REC0001", "11535");
      expect(result).toMatchObject(mockedResources[0] as any);
    });
  });
});
