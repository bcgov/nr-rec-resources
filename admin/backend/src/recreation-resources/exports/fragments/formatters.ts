import { Prisma } from '@generated/prisma';

export function formatTimestamp(expression: Prisma.Sql): Prisma.Sql {
  return Prisma.sql`
    TO_CHAR(
      ${expression},
      'YYYY-MM-DD"T"HH24:MI:SS.MS'
    )
  `;
}

export function displayIndicator(expression: Prisma.Sql): Prisma.Sql {
  return Prisma.sql`
    CASE
      WHEN COALESCE(${expression}, 'N') = 'Y' THEN 'Yes'
      ELSE 'No'
    END
  `;
}
