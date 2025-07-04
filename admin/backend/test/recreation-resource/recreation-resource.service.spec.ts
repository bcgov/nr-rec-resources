import { beforeEach, describe, expect, it, vi } from "vitest";
import { RecreationResourceService } from "@/recreation-resource/recreation-resource.service";
import { RecreationResourceRepository } from "@/recreation-resource/recreation-resource.repository";

describe("RecreationResourceService", () => {
  let service: RecreationResourceService;
  let repo: RecreationResourceRepository;

  beforeEach(() => {
    repo = {
      findSuggestions: vi.fn(),
    } as unknown as RecreationResourceRepository;
    service = new RecreationResourceService(repo);
  });

  it("should return suggestions in correct format", async () => {
    const mockData = [
      {
        name: "Test Resource",
        rec_resource_id: "REC123",
        recreation_resource_type: "RR",
        recreation_resource_type_code: "RR",
        district_description: "District",
      },
    ];
    (repo.findSuggestions as any).mockResolvedValue({
      total: 1,
      data: mockData,
    });

    const result = await service.getSuggestions("Test");
    expect(result.total).toBe(1);
    expect(result.suggestions[0].name).toBe("Test Resource");
    expect(result.suggestions[0].rec_resource_id).toBe("REC123");
  });

  it("should filter out suggestions missing rec_resource_id", async () => {
    const mockData = [
      {
        name: "Resource Without ID",
        rec_resource_id: null,
        recreation_resource_type: "RR",
        recreation_resource_type_code: "RR",
        district_description: "District",
      },
    ];
    (repo.findSuggestions as any).mockResolvedValue({
      total: 1,
      data: mockData,
    });

    const result = await service.getSuggestions("Test");
    expect(result.suggestions.length).toBe(0);
  });

  it("should filter out suggestions missing name", async () => {
    const mockData = [
      {
        name: null,
        rec_resource_id: "REC124",
        recreation_resource_type: "RR",
        recreation_resource_type_code: "RR",
        district_description: "District",
      },
    ];
    (repo.findSuggestions as any).mockResolvedValue({
      total: 1,
      data: mockData,
    });

    const result = await service.getSuggestions("Test");
    expect(result.suggestions.length).toBe(0);
  });
});
