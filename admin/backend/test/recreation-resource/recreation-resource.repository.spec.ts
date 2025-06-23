import { beforeEach, describe, expect, it, vi } from "vitest";
import { RecreationResourceRepository } from "@/recreation-resource/recreation-resource.repository";
import { PrismaService } from "@/prisma.service";

describe("RecreationResourceRepository", () => {
  let repo: RecreationResourceRepository;
  let prisma: PrismaService;

  beforeEach(() => {
    prisma = {
      $queryRawTyped: vi.fn(),
    } as unknown as PrismaService;
    repo = new RecreationResourceRepository(prisma);
  });

  it("should return total and data from findSuggestions", async () => {
    const mockData = [
      {
        name: "Test Resource",
        rec_resource_id: "REC123",
        recreation_resource_type: "RR",
        recreation_resource_type_code: "RR",
      },
    ];
    (prisma.$queryRawTyped as any).mockResolvedValue(mockData);

    const result = await repo.findSuggestions("Test");
    expect(result.total).toBe(1);
    expect(result.data[0].name).toBe("Test Resource");
    expect(result.data[0].rec_resource_id).toBe("REC123");
  });
});
