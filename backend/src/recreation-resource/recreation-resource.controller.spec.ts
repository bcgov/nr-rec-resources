import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";
import { RecreationResourceController } from "./recreation-resource.controller";
import { RecreationResourceService } from "./recreation-resource.service";
import { PrismaService } from "nestjs-prisma";

describe("RecreationResourceController", () => {
  let recService: RecreationResourceService;
  let controller: RecreationResourceController;
  let app: INestApplication;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RecreationResourceController],
      providers: [
        RecreationResourceService,
        {
          provide: PrismaService,
          useValue: {},
        },
      ],
    }).compile();

    recService = module.get<RecreationResourceService>(
      RecreationResourceService,
    );
    controller = module.get<RecreationResourceController>(
      RecreationResourceController,
    );
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
});
