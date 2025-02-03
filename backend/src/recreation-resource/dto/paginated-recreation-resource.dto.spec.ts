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
    paginatedResponse.filters = [
      {
        type: "multi-select",
        label: "Activity",
        param: "activities",
        options: [
          {
            id: 1,
            count: 42,
            description: "Snowmobiling",
          },
        ],
      },
    ];

    expect(paginatedResponse).toHaveProperty("data");
    expect(paginatedResponse).toHaveProperty("total");
    expect(paginatedResponse).toHaveProperty("page");
    expect(Array.isArray(paginatedResponse.data)).toBe(true);

    expect(paginatedResponse.filters).toHaveLength(1);
    expect(paginatedResponse.filters[0]).toHaveProperty("options");
    expect(paginatedResponse.filters[0]).toHaveProperty("label");
    expect(paginatedResponse.filters[0]).toHaveProperty("param");
    expect(paginatedResponse.filters[0]).toHaveProperty("type");
    expect(paginatedResponse.filters[0].options).toHaveLength(1);
    expect(paginatedResponse.filters[0].options[0]).toHaveProperty("id");
    expect(paginatedResponse.filters[0].options[0]).toHaveProperty("count");
    expect(typeof paginatedResponse.total).toBe("number");
    expect(typeof paginatedResponse.page).toBe("number");
    expect(typeof paginatedResponse.filters[0].options).toBe("object");
    expect(typeof paginatedResponse.filters[0].options[0].count).toBe("number");
    expect(typeof paginatedResponse.filters[0].label).toBe("string");
    expect(typeof paginatedResponse.filters[0].param).toBe("string");
    expect(typeof paginatedResponse.filters[0].options[0].id).toBe("number");
    expect(typeof paginatedResponse.filters[0].type).toBe("string");
    expect(paginatedResponse.filters[0].options[0]).toHaveProperty(
      "description",
    );
    expect(typeof paginatedResponse.filters[0].options[0].description).toBe(
      "string",
    );
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

  it("should handle empty filters array", () => {
    const emptyFiltersPaginatedResponse = new PaginatedRecreationResourceDto();
    emptyFiltersPaginatedResponse.data = recResourceArrayResolved;
    emptyFiltersPaginatedResponse.total = 4;
    emptyFiltersPaginatedResponse.page = 1;
    emptyFiltersPaginatedResponse.limit = 10;
    emptyFiltersPaginatedResponse.filters = [];

    expect(emptyFiltersPaginatedResponse.filters).toHaveLength(0);
  });
});
