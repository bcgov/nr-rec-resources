import { describe, expect, it } from "vitest";
import { Test } from "@nestjs/testing";
import { ResourceDocsModule } from "@/resource-docs/resource-docs.module";
import { ResourceDocsController } from "@/resource-docs/resource-docs.controller";
import { ResourceDocsService } from "@/resource-docs/service/resource-docs.service";

describe("ResourceDocsModule", () => {
  it("should compile and provide controller and service", async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [ResourceDocsModule],
    }).compile();

    const controller = moduleRef.get(ResourceDocsController);
    const service = moduleRef.get(ResourceDocsService);

    expect(controller).toBeDefined();
    expect(service).toBeDefined();
  });
});
