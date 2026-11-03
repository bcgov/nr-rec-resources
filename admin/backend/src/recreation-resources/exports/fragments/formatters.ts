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

/**
 * Collapses a code/description pair into the one readable column. Falls back to
 * the code when the lookup row has no description -- FTA code tables come from
 * CSV imports, so a missing row would otherwise blank the column completely.
 */
export function describeCode(
  code: Prisma.Sql,
  description: Prisma.Sql,
): Prisma.Sql {
  return Prisma.sql`COALESCE(NULLIF(TRIM(${description}), ''), ${code}::text)`;
}

/** Same Yes/No output as displayIndicator, for real booleans instead of Y/N. */
export function booleanIndicator(expression: Prisma.Sql): Prisma.Sql {
  return Prisma.sql`
    CASE
      WHEN COALESCE(${expression}, false) THEN 'Yes'
      ELSE 'No'
    END
  `;
}
