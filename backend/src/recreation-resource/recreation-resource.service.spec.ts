import { Test, TestingModule } from "@nestjs/testing";
import { PrismaService } from "nestjs-prisma";
import { RecreationResourceService } from "./recreation-resource.service";

describe("RecreationResourceService", () => {
  let service: RecreationResourceService;
  let prisma: PrismaService;

  const recreationResource1 = {
    id: 1,
    name: "Rec site 1",
    description: "Rec site 1 description",
    site_location: "Rec site 1 location",
  };

  const recreationResource2 = {
    id: 2,
    name: "Rec site 2",
    description: "Rec site 2 description",
    site_location: "Rec site 2 location",
  };

  const recresourceArray = [recreationResource1, recreationResource2];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RecreationResourceService,
        {
          provide: PrismaService,
          useValue: {
            recreation_resource: {
              findMany: vi.fn().mockResolvedValue(recresourceArray),
              findUnique: vi.fn().mockResolvedValue(recreationResource1),
            },
          },
        },
      ],
    }).compile();

    service = module.get<RecreationResourceService>(RecreationResourceService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("findAll", () => {
    it("should return an array of users", async () => {
      const users = await service.findMany();
      expect(users).toEqual(recresourceArray);
    });
  });
});
