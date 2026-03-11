import { Prisma } from '@generated/prisma';

export function rstPrimaryColumns(): Prisma.Sql {
  return Prisma.sql`
    rr.rec_resource_id AS "REC_RESOURCE_ID",
    rr.name AS "NAME"
  `;
}

export function ftaPrimaryColumns(): Prisma.Sql {
  return Prisma.sql`
    rp.forest_file_id AS "FOREST_FILE_ID",
    rp.project_name AS "PROJECT_NAME"
  `;
}
