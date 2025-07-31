import { ResourceImagesController } from "@/resource-images/resource-images.controller";
import { ResourceImagesModule } from "@/resource-images/resource-images.module";
import { ResourceImagesService } from "@/resource-images/service/resource-images.service";
import { Test } from "@nestjs/testing";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { AppConfigModule } from "@/app-config/app-config.module";

describe("ResourceImagesModule", () => {
  beforeAll(() => {
    vi.stubEnv("DATABASE_URL", "postgresql://test:test@localhost:5432/test");
    vi.stubEnv("DAM_URL", "http://localhost:3001");
  });

  afterAll(() => {
    vi.unstubAllEnvs();
  });

  it("should compile and provide controller and service", async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppConfigModule, ResourceImagesModule],
    }).compile();

    const controller = moduleRef.get(ResourceImagesController);
    const service = moduleRef.get(ResourceImagesService);

    expect(controller).toBeDefined();
    expect(service).toBeDefined();
  });
});
