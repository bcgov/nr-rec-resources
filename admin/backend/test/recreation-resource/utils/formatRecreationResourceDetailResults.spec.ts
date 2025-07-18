import { RecreationResourceMaintenanceStandardCode } from "@/recreation-resource/dtos/recreation-resource-detail.dto";
import { OPEN_STATUS } from "@/recreation-resource/recreation-resource.constants";
import { formatRecreationResourceDetailResults } from "@/recreation-resource/utils";
import { describe, it, expect } from "vitest";

const baseResource = {
  rec_resource_id: "123",
  name: "Test Site",
  closest_community: "Testville",
  recreation_site_description: { description: "A nice place" },
  recreation_driving_direction: { description: "Turn left" },
  maintenance_standard_code: "A" as RecreationResourceMaintenanceStandardCode,
  recreation_resource_type_view: [{ description: "Campground" }],
  recreation_access: [
    { recreation_access_code: { description: "Road" } },
    { recreation_access_code: { description: "Trail" } },
  ],
  recreation_activity: [
    {
      recreation_activity: {
        description: "Hiking",
        recreation_activity_code: "HIKE",
      },
    },
  ],
  recreation_status: {
    recreation_status_code: { description: "Closed" },
    comment: "Seasonal closure",
    status_code: 2,
  },
  _count: { recreation_defined_campsite: 5 },
  recreation_structure: [
    { recreation_structure_code: { description: "Toilet" } },
    { recreation_structure_code: { description: "Table" } },
  ],
};

describe("formatRecreationResourceDetailResults", () => {
  it("should format a fully populated resource", () => {
    const input = {
      ...baseResource,
      recreation_district_code: {
        description: "District 1",
        district_code: "D1",
      },
    };
    const result = formatRecreationResourceDetailResults(input as any);
    expect(result.rec_resource_id).toBe("123");
    expect(result.name).toBe("Test Site");
    expect(result.closest_community).toBe("Testville");
    expect(result.description).toBe("A nice place");
    expect(result.driving_directions).toBe("Turn left");
    expect(result.maintenance_standard_code).toBe("A");
    expect(result.rec_resource_type).toBe("Campground");
    expect(result.recreation_access).toEqual(["Road", "Trail"]);
    expect(result.recreation_activity).toEqual([
      { description: "Hiking", recreation_activity_code: "HIKE" },
    ]);
    expect(result.recreation_status).toEqual({
      description: "Closed",
      comment: "Seasonal closure",
      status_code: 2,
    });
    expect(result.campsite_count).toBe(5);
    expect(result.recreation_structure).toEqual({
      has_toilet: true,
      has_table: true,
    });
    expect(result.recreation_district).toEqual({
      description: "District 1",
      district_code: "D1",
    });
  });

  it("should handle missing optional fields and use OPEN_STATUS defaults", () => {
    const input = {
      rec_resource_id: "456",
      // name missing
      // closest_community missing
      // recreation_site_description missing
      // recreation_driving_direction missing
      maintenance_standard_code: undefined,
      recreation_resource_type_view: [],
      recreation_access: undefined,
      recreation_activity: undefined,
      recreation_status: undefined,
      _count: {},
      recreation_structure: undefined,
      recreation_district_code: undefined,
    };
    const result = formatRecreationResourceDetailResults(input as any);
    expect(result.name).toBe("");
    expect(result.closest_community).toBe("");
    expect(result.description).toBeUndefined();
    expect(result.driving_directions).toBeUndefined();
    expect(result.maintenance_standard_code).toBeUndefined();
    expect(result.rec_resource_type).toBe("");
    expect(result.recreation_access).toEqual([]);
    expect(result.recreation_activity).toEqual([]);
    expect(result.recreation_status).toEqual({
      description: OPEN_STATUS.DESCRIPTION,
      comment: "",
      status_code: OPEN_STATUS.STATUS_CODE,
    });
    expect(result.campsite_count).toBe(0);
    expect(result.recreation_structure).toEqual({
      has_toilet: false,
      has_table: false,
    });
    expect(result.recreation_district).toBeUndefined();
  });

  it("should filter out falsy recreation_access descriptions", () => {
    const input = {
      ...baseResource,
      recreation_access: [
        { recreation_access_code: { description: "Road" } },
        { recreation_access_code: { description: undefined } },
      ],
    };
    const result = formatRecreationResourceDetailResults(input as any);
    expect(result.recreation_access).toEqual(["Road"]);
  });

  it("should return an empty array if all recreation_access descriptions are falsy", () => {
    const input = {
      ...baseResource,
      recreation_access: [
        { recreation_access_code: { description: undefined } },
        { recreation_access_code: { description: null } },
      ],
    };
    const result = formatRecreationResourceDetailResults(input as any);
    expect(result.recreation_access).toEqual([]);
  });

  it("should set has_toilet and has_table to false if recreation_structure is not an array", () => {
    const input = {
      ...baseResource,
      recreation_structure: undefined,
    };
    const result = formatRecreationResourceDetailResults(input as any);
    expect(result.recreation_structure).toEqual({
      has_toilet: false,
      has_table: false,
    });
  });

  it("should set has_toilet and has_table to false if no matching descriptions", () => {
    const input = {
      ...baseResource,
      recreation_structure: [
        { recreation_structure_code: { description: "Other" } },
      ],
    };
    const result = formatRecreationResourceDetailResults(input as any);
    expect(result.recreation_structure).toEqual({
      has_toilet: false,
      has_table: false,
    });
  });

  it("should set activity description to empty string if undefined", () => {
    const input = {
      ...baseResource,
      recreation_activity: [
        {
          recreation_activity: {
            description: undefined,
            recreation_activity_code: "HIKE",
          },
        },
      ],
    };
    const result = formatRecreationResourceDetailResults(input as any);
    expect(result.recreation_activity).toEqual([
      { description: "", recreation_activity_code: "HIKE" },
    ]);
  });
});
