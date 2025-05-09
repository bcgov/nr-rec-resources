import { describe, expect, it } from "vitest";
import { Prisma } from "@prisma/client";
import { buildRecreationResourcePageQuery } from "./buildRecreationResourcePageQuery";

describe("buildRecreationResourcePageQuery", () => {
  it("should build a paginated SQL query with filters", () => {
    const whereClause = Prisma.sql`WHERE type = ${"park"}`;
    const take = 10;
    const skip = 20;

    const query = buildRecreationResourcePageQuery(whereClause, take, skip);

    const queryStr = query.sql;

    expect(queryStr).toContain("SELECT");
    expect(queryStr).toContain("FROM recreation_resource_search_view");
    expect(queryStr).toContain("WHERE type =");
    expect(queryStr).toContain("LIMIT");
    expect(queryStr).toContain("OFFSET");

    expect(query.values).toContain("park");
    expect(query.values).toContain(take);
    expect(query.values).toContain(skip);
  });

  it("should work without a WHERE clause", () => {
    const whereClause = Prisma.empty;
    const query = buildRecreationResourcePageQuery(whereClause, 5, 0);

    expect(query.sql).not.toContain("WHERE");
    expect(query.sql).toContain("LIMIT");
  });
});
