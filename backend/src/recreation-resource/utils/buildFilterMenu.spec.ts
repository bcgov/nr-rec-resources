import { buildFilterMenu } from "./buildFilterMenu";
import { FilterDto } from "../dto/paginated-recreation-resource.dto";
import { AggregatedRecordCount } from "../service/types";

describe("buildFilterMenu", () => {
  const mockAggregatedCounts: AggregatedRecordCount[] = [
    { type: "district", code: "D1", description: "District A", count: 10 },
    { type: "type", code: "T1", description: "Park", count: 15 },
    { type: "activity", code: "A1", description: "Hiking", count: 12 },
    { type: "facilities", code: "table", description: "Tables", count: 8 },
    { type: "facilities", code: "toilet", description: "Toilets", count: 5 },
    { type: "access", code: "ACC1", description: "Wheelchair", count: 4 },
  ];

  describe("when provided with complete data", () => {
    it("should generate a complete filter menu with all categories", () => {
      const result = buildFilterMenu(mockAggregatedCounts);

      const expectedFilters: FilterDto[] = [
        {
          type: "multi-select",
          label: "District",
          param: "district",
          options: [{ id: "D1", description: "District A", count: 10 }],
        },
        {
          type: "multi-select",
          label: "Type",
          param: "type",
          options: [{ id: "T1", description: "Park", count: 15 }],
        },
        {
          type: "multi-select",
          label: "Things to do",
          param: "activities",
          options: [{ id: "A1", description: "Hiking", count: 12 }],
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
          options: [{ id: "ACC1", description: "Wheelchair access", count: 4 }],
        },
      ];

      expect(result).toEqual(expectedFilters);
    });
  });

  describe("when provided with partial data", () => {
    it("should handle missing categories", () => {
      const partialData: AggregatedRecordCount[] = [
        { type: "activity", code: "A1", description: "Hiking", count: 12 },
        { type: "facilities", code: "table", description: "Tables", count: 8 },
      ];

      const result = buildFilterMenu(partialData);

      expect(result).toHaveLength(5); // Should still return all filter categories
      expect(result[0].options).toHaveLength(0); // Empty district
      expect(result[1].options).toHaveLength(0); // Empty type
      expect(result[2].options).toHaveLength(1); // Activities
      expect(result[3].options).toHaveLength(2); // Facilities (always shows both - tables and toilets)
      expect(result[4].options).toHaveLength(0); // Empty access
    });

    it("should handle empty input", () => {
      const result = buildFilterMenu([]);

      expect(result).toHaveLength(5);
      result.forEach((filter) => {
        if (filter.param === "facilities") {
          expect(filter.options).toEqual([
            { id: "table", description: "Tables", count: 0 },
            { id: "toilet", description: "Toilets", count: 0 },
          ]);
        } else {
          expect(filter.options).toHaveLength(0);
        }
      });
    });

    it("should properly transform access descriptions", () => {
      const accessData: AggregatedRecordCount[] = [
        { type: "access", code: "ACC1", description: "Wheelchair", count: 4 },
        { type: "access", code: "ACC2", description: "Vehicle", count: 6 },
      ];

      const result = buildFilterMenu(accessData);
      const accessFilter = result.find((f) => f.param === "access");

      expect(accessFilter?.options).toEqual([
        { id: "ACC1", description: "Wheelchair access", count: 4 },
        { id: "ACC2", description: "Vehicle access", count: 6 },
      ]);
    });
  });
});
