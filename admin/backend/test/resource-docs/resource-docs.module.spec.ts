import { ResourceDocsController } from "@/resource-docs/resource-docs.controller";
import { ResourceDocsModule } from "@/resource-docs/resource-docs.module";
import { ResourceDocsService } from "@/resource-docs/service/resource-docs.service";
import { Test } from "@nestjs/testing";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { AppConfigModule } from "@/app-config/app-config.module";

describe("ResourceDocsModule", () => {
  beforeAll(() => {
    vi.stubEnv("DATABASE_URL", "postgresql://test:test@localhost:5432/test");
    vi.stubEnv("DAM_URL", "http://localhost:3001");
  });

  afterAll(() => {
    vi.unstubAllEnvs();
  });

  it("should compile and provide controller and service", async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppConfigModule, ResourceDocsModule],
    }).compile();

    const controller = moduleRef.get(ResourceDocsController);
    const service = moduleRef.get(ResourceDocsService);

    expect(controller).toBeDefined();
    expect(service).toBeDefined();
  });
});
