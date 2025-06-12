import { describe, expect, it } from "vitest";
import { Test } from "@nestjs/testing";
import { RecreationResourceModule } from "@/recreation-resource/recreation-resource.module";
import { RecreationResourceController } from "@/recreation-resource/recreation-resource.controller";
import { RecreationResourceService } from "@/recreation-resource/recreation-resource.service";

describe("RecreationResourceModule", () => {
  it("should compile and provide controller and service", async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [RecreationResourceModule],
    }).compile();

    const controller = moduleRef.get(RecreationResourceController);
    const service = moduleRef.get(RecreationResourceService);

    expect(controller).toBeDefined();
    expect(service).toBeDefined();
  });
});
