import { AppConfigModule } from "@/app-config/app-config.module";
import { ResourceImagesController } from "@/resource-images/resource-images.controller";
import { ResourceImagesModule } from "@/resource-images/resource-images.module";
import { ResourceImagesService } from "@/resource-images/service/resource-images.service";
import { Test } from "@nestjs/testing";
import { describe, expect, it } from "vitest";

describe("ResourceImagesModule", () => {
  it("should compile and provide controller and service", async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [ResourceImagesModule, AppConfigModule],
    }).compile();

    const controller = moduleRef.get(ResourceImagesController);
    const service = moduleRef.get(ResourceImagesService);

    expect(controller).toBeDefined();
    expect(service).toBeDefined();
  });
});
