import { Prisma } from "@prisma/client";

export function buildRecreationResourcePageQuery(
  whereClause: Prisma.Sql,
  take: number,
  skip: number,
): Prisma.Sql {
  return Prisma.sql`
    SELECT *, COUNT(*) OVER()::INT AS total_count
    FROM recreation_resource_search_view
           ${whereClause}
    ORDER BY name ASC
      LIMIT ${take} ${skip ? Prisma.sql`OFFSET ${skip}` : Prisma.empty}`;
}
