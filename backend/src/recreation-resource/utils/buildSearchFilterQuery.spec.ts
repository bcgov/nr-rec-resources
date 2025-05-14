import { describe, expect, it } from "vitest";
import { buildSearchFilterQuery } from "src/recreation-resource/utils/buildSearchFilterQuery";
import { Prisma } from "@prisma/client";

const getQueryString = (query: Prisma.Sql) => {
  return query.sql.replace(/\s+/g, " ").trim();
};

describe("buildSearchFilterQuery", () => {
  it("should generate query with no filters", () => {
    const result = buildSearchFilterQuery({ filter: "" });
    const queryString = getQueryString(result);
    expect(queryString).toBe(
      "where (name ilike ? or closest_community ilike ?)",
    );
    expect(result.values).toEqual(["%%", "%%"]);
  });

  it("should generate query with basic text filter", () => {
    const result = buildSearchFilterQuery({ filter: "park" });
    const queryString = getQueryString(result);
    expect(queryString).toBe(
      "where (name ilike ? or closest_community ilike ?)",
    );
    expect(result.values).toEqual(["%park%", "%park%"]);
  });

  it("should add access filter correctly", () => {
    const result = buildSearchFilterQuery({ filter: "", access: "A1_A2" });
    const queryString = getQueryString(result);
    expect(queryString).toContain("and access_code in (?,?)");
    expect(result.values.slice(2)).toEqual(["A1", "A2"]);
  });

  it("should add district filter correctly", () => {
    const result = buildSearchFilterQuery({ filter: "", district: "D1_D2" });
    const queryString = getQueryString(result);
    expect(queryString).toContain("and district_code in (?,?)");
    expect(result.values.slice(2)).toEqual(["D1", "D2"]);
  });

  it("should add type filter correctly", () => {
    const result = buildSearchFilterQuery({ filter: "", type: "T1_T2" });
    const queryString = getQueryString(result);
    expect(queryString).toContain("and recreation_resource_type_code in (?,?)");
    expect(result.values.slice(2)).toEqual(["T1", "T2"]);
  });

  it("should add activity filter correctly", () => {
    const result = buildSearchFilterQuery({
      filter: "",
      activities: "101_102",
    });
    const queryString = getQueryString(result);
    expect(queryString).toContain(
      "and ( select count(*) from jsonb_array_elements(recreation_activity) AS activity where (activity->>'recreation_activity_code')::bigint in (?,?) ) = ?",
    );
    expect(result.values.slice(2)).toEqual([101, 102, 2]);
  });

  it("should add facility filter correctly", () => {
    const result = buildSearchFilterQuery({ filter: "", facilities: "F1_F2" });
    const queryString = getQueryString(result);
    expect(queryString).toContain(
      "AND ( SELECT COUNT(*) FROM ( SELECT rec_resource_id FROM jsonb_array_elements(recreation_structure) AS facility GROUP BY rec_resource_id HAVING COUNT(*) FILTER ( WHERE facility->>'description' ILIKE ? ) > 0 AND COUNT(*) FILTER ( WHERE facility->>'description' ILIKE ? ) > 0 ) AS filtered_resources ) > 0",
    );
    expect(result.values.slice(2)).toEqual(["%F1%", "%F2%"]);
  });

  it("should handle all filters combined", () => {
    const result = buildSearchFilterQuery({
      filter: "park",
      activities: "101_102",
      type: "T1_T2",
      district: "D1_D2",
      access: "A1_A2",
      facilities: "F1_F2",
    });

    const queryString = getQueryString(result);
    expect(queryString).toContain(
      "where (name ilike ? or closest_community ilike ?)",
    );
    expect(queryString).toContain("and access_code in");
    expect(queryString).toContain("and district_code in");
    expect(queryString).toContain("and recreation_resource_type_code in");
    expect(queryString).toContain(
      "from jsonb_array_elements(recreation_activity)",
    );
    expect(queryString).toContain("jsonb_array_elements(recreation_structure)");

    const expectedValues = [
      "%park%",
      "%park%",
      "A1",
      "A2",
      "D1",
      "D2",
      "T1",
      "T2",
      101,
      102,
      2,
      "%F1%",
      "%F2%",
    ];
    expect(result.values).toEqual(expectedValues);
  });

  it("should add location filter correctly", () => {
    const lat = 49.2;
    const lon = -123.1;
    const result = buildSearchFilterQuery({ filter: "", lat, lon });
    const queryString = getQueryString(result);
    expect(queryString).toContain("ST_DWithin");
    expect(result.values).toEqual(["%%", "%%", lon, lat, 50000]);
  });
});
