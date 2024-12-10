import { Test, TestingModule } from "@nestjs/testing";
import { PrismaService } from "nestjs-prisma";
import { RecreationResourceService } from "./recreation-resource.service";

describe("RecreationResourceService", () => {
  let service: RecreationResourceService;

  const recreationResource1 = {
    forest_file_id: "REC0001",
    name: "Rec site 1",
    description: "Rec site 1 description",
    site_location: "Rec site 1 location",
  };

  const recreationResource2 = {
    forest_file_id: "REC0002",
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

  describe("findOne", () => {
    it("should return a Recreation Resource", async () => {
      expect(service.findOne("REC0001")).resolves.toEqual(recreationResource1);
    });
  });

  describe("findAll", () => {
    it("should return an array of Recreation Resources", async () => {
      const users = await service.findAll();
      expect(users).toEqual(recresourceArray);
    });
  });
});
