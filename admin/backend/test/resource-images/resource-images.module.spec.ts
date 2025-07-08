import { describe, expect, it } from "vitest";
import { Test } from "@nestjs/testing";
import { ResourceImagesModule } from "@/resource-images/resource-images.module";
import { ResourceImagesController } from "@/resource-images/resource-images.controller";
import { ResourceImagesService } from "@/resource-images/service/resource-images.service";

describe("ResourceImagesModule", () => {
  it("should compile and provide controller and service", async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [ResourceImagesModule],
    }).compile();

    const controller = moduleRef.get(ResourceImagesController);
    const service = moduleRef.get(ResourceImagesService);

    expect(controller).toBeDefined();
    expect(service).toBeDefined();
  });
});
