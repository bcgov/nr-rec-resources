import { beforeEach, describe, expect, it, vi } from "vitest";
import { Test } from "@nestjs/testing";
import { RecreationResourceController } from "@/recreation-resource/recreation-resource.controller";
import { RecreationResourceService } from "@/recreation-resource/recreation-resource.service";
import { SuggestionsResponseDto } from "@/recreation-resource/dtos/suggestions-response.dto";
import { SuggestionsQueryDto } from "@/recreation-resource/dtos/suggestions-query.dto";

describe("RecreationResourceController", () => {
  let controller: RecreationResourceController;
  let service: RecreationResourceService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [RecreationResourceController],
      providers: [
        {
          provide: RecreationResourceService,
          useValue: {
            getSuggestions: vi.fn(),
          },
        },
      ],
    }).compile();

    controller = moduleRef.get(RecreationResourceController);
    service = moduleRef.get(RecreationResourceService);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  it("should call service.getSuggestions and return its result", async () => {
    const mockResponse: SuggestionsResponseDto = {
      total: 1,
      data: [
        {
          name: "Test Resource",
          rec_resource_id: "REC123",
          recreation_resource_type: "RR",
          recreation_resource_type_code: "RR",
        },
      ],
    };
    (service.getSuggestions as any).mockResolvedValue(mockResponse);

    const query: SuggestionsQueryDto = { searchTerm: "Test" };
    const result = await controller.getSuggestions(query);
    expect(service.getSuggestions).toHaveBeenCalledWith("Test");
    expect(result).toEqual(mockResponse);
  });
});
