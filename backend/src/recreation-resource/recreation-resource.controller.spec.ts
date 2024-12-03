import { Test, TestingModule } from "@nestjs/testing";
import { RecreationResourceController } from "./recreation-resource.controller";

describe("RecreationResourceController", () => {
  let controller: RecreationResourceController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RecreationResourceController],
    }).compile();

    controller = module.get<RecreationResourceController>(
      RecreationResourceController,
    );
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });
});
