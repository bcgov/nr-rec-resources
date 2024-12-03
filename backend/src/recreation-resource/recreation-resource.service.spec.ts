import { Test, TestingModule } from "@nestjs/testing";
import { RecreationResourceService } from "./recreation-resource.service";

describe("RecreationResourceService", () => {
  let service: RecreationResourceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RecreationResourceService],
    }).compile();

    service = module.get<RecreationResourceService>(RecreationResourceService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });
});
