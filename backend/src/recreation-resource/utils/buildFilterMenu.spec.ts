import { buildFilterMenu } from "src/recreation-resource/utils/buildFilterMenu";
import { FilterDto } from "src/recreation-resource/dto/paginated-recreation-resource.dto";
import {
  CombinedRecordCount,
  CombinedStaticCount,
} from "src/recreation-resource/service/types";

describe("buildFilterMenu", () => {
  it("generates correct filter menu with valid data", () => {
    const combinedRecordCounts: CombinedRecordCount[] = [
      {
        recreation_activity_code: 1,
        description: "Hiking",
        recreation_activity_count: 12,
        total_toilet_count: 5,
        total_table_count: 8,
        total_count: 20,
      },
    ];

    const combinedStaticCounts: CombinedStaticCount[] = [
      { type: "district", code: "1", description: "District A", count: 10 },
      { type: "access", code: "1", description: "Wheelchair", count: 4 },
      { type: "type", code: "1", description: "Park", count: 15 },
    ];

    const result = buildFilterMenu({
      combinedRecordCounts,
      combinedStaticCounts,
    });

    expect(result).toEqual<FilterDto[]>([
      {
        type: "multi-select",
        label: "District",
        param: "district",
        options: [{ id: "1", description: "District A", count: 10 }],
      },
      {
        type: "multi-select",
        label: "Type",
        param: "type",
        options: [{ id: "1", description: "Park", count: 15 }],
      },
      {
        type: "multi-select",
        label: "Things to do",
        param: "activities",
        options: [{ id: "1", description: "Hiking", count: 12 }],
      },
      {
        type: "multi-select",
        label: "Facilities",
        param: "facilities",
        options: [
          { id: "table", description: "Tables", count: 8 },
          { id: "toilet", description: "Toilets", count: 5 },
        ],
      },
      {
        type: "multi-select",
        label: "Access type",
        param: "access",
        options: [{ id: "1", description: "Wheelchair access", count: 4 }],
      },
    ]);
  });

  it("returns correct counts when only combinedRecordCounts are provided", () => {
    const combinedRecordCounts: CombinedRecordCount[] = [
      {
        recreation_activity_code: 202,
        description: "Biking",
        recreation_activity_count: 7,
        total_toilet_count: 3,
        total_table_count: 6,
        total_count: 15,
      },
    ];
    const combinedStaticCounts: CombinedStaticCount[] = [];

    const result = buildFilterMenu({
      combinedRecordCounts,
      combinedStaticCounts,
    });

    expect(result[2].options).toEqual([
      { id: "202", description: "Biking", count: 7 },
    ]);
    expect(result[3].options).toEqual([
      { id: "table", description: "Tables", count: 6 },
      { id: "toilet", description: "Toilets", count: 3 },
    ]);
  });

  it("returns reversed order for type filters", () => {
    const combinedRecordCounts: CombinedRecordCount[] = [];
    const combinedStaticCounts: CombinedStaticCount[] = [
      { type: "type", code: "1", description: "Park", count: 15 },
      { type: "type", code: "2", description: "Campground", count: 8 },
    ];

    const result = buildFilterMenu({
      combinedRecordCounts,
      combinedStaticCounts,
    });

    expect(result[1].options).toEqual([
      { id: "2", description: "Campground", count: 8 },
      { id: "1", description: "Park", count: 15 },
    ]);
  });
});
