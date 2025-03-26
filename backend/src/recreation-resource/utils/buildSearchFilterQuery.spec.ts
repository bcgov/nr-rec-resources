import { describe, it, expect } from "vitest";
import { buildSearchFilterQuery } from "src/recreation-resource/utils/buildSearchFilterQuery";

const filterString = "where (name ilike ? or closest_community ilike ?)";
const accessString = "and access_code in (?,?)";
const districtString = "and district_code in (?,?)";
const typeString = "and recreation_resource_type_code in (?,?)";
const activityString =
  "where (activity->>'recreation_activity_code')::bigint in (?,?)";
const facilityString =
  "select count(*) from jsonb_array_elements(recreation_structure) AS facility where ( (facility->>'description') ilike ? or (facility->>'description') ilike ? ) ";

export const getQueryString = (query) => {
  return query.sql.replace(/\s+/g, " ").trim();
};

describe("buildSearchFilterQuery", () => {
  it("should generate query with no filters", () => {
    const result = buildSearchFilterQuery({ filter: "" });
    const queryString = getQueryString(result);
    expect(queryString).toBe(filterString);
  });

  it("should generate query with basic text filter", () => {
    const result = buildSearchFilterQuery({ filter: "park" });
    const queryString = getQueryString(result);
    expect(queryString).toBe(filterString);
  });

  it("should add access filter correctly", () => {
    const result = buildSearchFilterQuery({ filter: "", access: "A1_A2" });
    const queryString = getQueryString(result);
    expect(queryString).toContain(accessString);
  });

  it("should add district filter correctly", () => {
    const result = buildSearchFilterQuery({ filter: "", district: "D1_D2" });
    const queryString = getQueryString(result);
    expect(queryString).toContain(districtString);
  });

  it("should add type filter correctly", () => {
    const result = buildSearchFilterQuery({ filter: "", type: "T1_T2" });
    const queryString = getQueryString(result);
    expect(queryString).toContain(typeString);
  });

  it("should add activity filter correctly", () => {
    const result = buildSearchFilterQuery({
      filter: "",
      activities: "101_102",
    });
    const queryString = getQueryString(result);

    expect(queryString).toContain(activityString);
  });

  it("should add facility filter correctly", () => {
    const result = buildSearchFilterQuery({
      filter: "",
      facilities: "F1_F2",
    });
    const queryString = getQueryString(result);

    expect(queryString).toContain(facilityString);
  });

  it("should handle all filters", () => {
    const result = buildSearchFilterQuery({
      filter: "park",
      activities: "101_102",
      type: "T1_T2",
      district: "D1_D2",
      access: "A1_A2",
      facilities: "F1_F2",
    });
    const queryString = getQueryString(result);

    expect(queryString).toContain(filterString);
    expect(queryString).toContain(accessString);
    expect(queryString).toContain(districtString);
    expect(queryString).toContain(typeString);
    expect(queryString).toContain(activityString);
    expect(queryString).toContain(facilityString);
  });
});
