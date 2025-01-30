import { PaginatedRecreationResourceDto } from "./paginated-recreation-resource.dto";
import { RecreationResourceDto } from "./recreation-resource.dto";

const recResourceArrayResolved: RecreationResourceDto[] = [
  new RecreationResourceDto(),
  new RecreationResourceDto(),
  new RecreationResourceDto(),
  new RecreationResourceDto(),
];

describe("PaginatedRecreationResourceDto", () => {
  it("should validate the structure of paginated response", () => {
    const paginatedResponse = new PaginatedRecreationResourceDto();
    paginatedResponse.data = recResourceArrayResolved;
    paginatedResponse.total = 4;
    paginatedResponse.page = 1;
    paginatedResponse.limit = 10;

    expect(paginatedResponse).toHaveProperty("data");
    expect(paginatedResponse).toHaveProperty("total");
    expect(paginatedResponse).toHaveProperty("page");
    expect(Array.isArray(paginatedResponse.data)).toBe(true);
    expect(typeof paginatedResponse.total).toBe("number");
    expect(typeof paginatedResponse.page).toBe("number");
  });

  it("should handle empty data array", () => {
    const emptyPaginatedResponse = new PaginatedRecreationResourceDto();
    emptyPaginatedResponse.data = [];
    emptyPaginatedResponse.total = 0;
    emptyPaginatedResponse.page = 1;
    emptyPaginatedResponse.limit = 10;

    expect(emptyPaginatedResponse.data).toHaveLength(0);
    expect(emptyPaginatedResponse.total).toBe(0);
  });
});
