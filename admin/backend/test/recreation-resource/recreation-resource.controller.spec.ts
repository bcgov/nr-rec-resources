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
            findOne: vi.fn(),
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
      suggestions: [
        {
          name: "Test Resource",
          rec_resource_id: "REC123",
          recreation_resource_type: "RR",
          recreation_resource_type_code: "RR",
          district_description: "Test District",
        },
      ],
    };
    (service.getSuggestions as any).mockResolvedValue(mockResponse);

    const query: SuggestionsQueryDto = { searchTerm: "Test" };
    const result = await controller.getSuggestions(query);
    expect(service.getSuggestions).toHaveBeenCalledWith("Test");
    expect(result).toEqual(mockResponse);
  });

  it("should call service.findOne and return its result", async () => {
    const mockResource = {
      rec_resource_id: "REC123",
      name: "Test Resource",
      closest_community: "",
      description: undefined,
      driving_directions: undefined,
      maintenance_standard_code: undefined,
      rec_resource_type: "",
      recreation_access: [],
      recreation_activity: [],
      recreation_status: { description: "", comment: "", status_code: 1 },
      campsite_count: 0,
      recreation_structure: { has_toilet: false, has_table: false },
      recreation_district: undefined,
    };
    (service.findOne as any) = vi.fn().mockResolvedValue(mockResource);
    const result = await controller.findOne("REC123");
    expect(service.findOne).toHaveBeenCalledWith("REC123");
    expect(result).toEqual(mockResource);
  });

  it("should throw 404 if resource not found", async () => {
    (service.findOne as any) = vi.fn().mockResolvedValue(null);
    await expect(controller.findOne("NOT_FOUND")).rejects.toThrowError(
      "Recreation Resource not found.",
    );
  });
});
