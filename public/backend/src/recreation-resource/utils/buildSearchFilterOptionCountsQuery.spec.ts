import { describe, expect, it } from "vitest";
import { Prisma } from "@prisma/client";
import { EXCLUDED_ACTIVITY_CODES } from "../constants/service.constants";
import { buildFilterOptionCountsQuery } from "./buildSearchFilterOptionCountsQuery";

describe("buildFilterOptionCountsQuery", () => {
  it("should build a SQL query with a where clause and no filter flags", () => {
    const whereClause = Prisma.sql`WHERE district_code = ${"D1"}`;
    const query = buildFilterOptionCountsQuery(whereClause);

    // Verify SQL structure
    const queryStr = query.sql;
    expect(queryStr).toContain("WITH filtered_resources AS");
    expect(queryStr).toContain("FROM recreation_resource_search_view");
    expect(queryStr).toContain("UNION ALL");

    // Verify placeholders and parameter values
    expect(query.values).toContain("D1");

    // Ensure excluded activity codes are included
    EXCLUDED_ACTIVITY_CODES.forEach((code) => {
      expect(query.values).toContain(code);
    });
  });

  it("should conditionally apply filter flags in CASE statements", () => {
    const whereClause = Prisma.sql`WHERE access_code = ${"AC1"}`;
    const filterTypes = {
      isOnlyDistrictFilter: true,
      isOnlyAccessFilter: true,
      isOnlyTypeFilter: true,
    };

    const query = buildFilterOptionCountsQuery(whereClause, filterTypes);
    const queryStr = query.sql;

    expect(queryStr).toContain(
      "WHEN ? THEN (SELECT COUNT(*) FROM recreation_resource_search_view WHERE district_code = dcv.district_code)::INT",
    );
    expect(queryStr).toContain(
      "WHEN ? THEN (SELECT COUNT(*) FROM recreation_resource_search_view WHERE access_code = acv.access_code)::INT",
    );
    expect(queryStr).toContain(
      "WHEN ? THEN (SELECT COUNT(*) FROM recreation_resource_search_view WHERE recreation_resource_type_code = acv.rec_resource_type_code)::INT",
    );

    expect(query.values).toContain("AC1");
  });

  it("should handle empty where clause", () => {
    const query = buildFilterOptionCountsQuery(Prisma.empty);

    expect(query.sql).toContain("FROM recreation_resource_search_view");

    const filteredBlock =
      query.sql.match(/WITH filtered_resources AS /)?.[0] || "";
    expect(filteredBlock).not.toContain("WHERE district_code =");
  });
});
