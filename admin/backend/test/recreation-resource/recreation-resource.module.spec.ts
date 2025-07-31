import { RecreationResourceController } from "@/recreation-resource/recreation-resource.controller";
import { RecreationResourceModule } from "@/recreation-resource/recreation-resource.module";
import { RecreationResourceService } from "@/recreation-resource/recreation-resource.service";
import { Test } from "@nestjs/testing";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { AppConfigModule } from "@/app-config/app-config.module";

describe("RecreationResourceModule", () => {
  beforeAll(() => {
    vi.stubEnv("DATABASE_URL", "postgresql://test:test@localhost:5432/test");
  });

  afterAll(() => {
    vi.unstubAllEnvs();
  });

  it("should compile and provide controller and service", async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppConfigModule, RecreationResourceModule],
    }).compile();

    const controller = moduleRef.get(RecreationResourceController);
    const service = moduleRef.get(RecreationResourceService);

    expect(controller).toBeDefined();
    expect(service).toBeDefined();
  });
});
