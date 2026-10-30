import { Prisma } from '@generated/prisma';
import { describeCode } from './formatters';

/**
 * Leading columns every export carries: what the file is, which district owns
 * it, and what state the file is in. Lives here so a new dataset can't quietly
 * ship without them. FILE_STATUS in particular is how an archived resource is
 * spotted in the output.
 *
 * District and status are exported as descriptions only; the raw codes are left
 * out because describeCode already falls back to them when a lookup is missing.
 *
 * Both fragments depend on the matching shared joins being in the query.
 */
export function rstPrimaryColumns(): Prisma.Sql {
  return Prisma.sql`
    rr.rec_resource_id AS "REC_RESOURCE_ID",
    rr.name AS "NAME",
    ${describeCode(
      Prisma.sql`rr.district_code`,
      Prisma.sql`rdc_rst.description`,
    )} AS "DISTRICT",
    ${describeCode(
      Prisma.sql`rr.rec_status_code`,
      Prisma.sql`rrsc_rst.description`,
    )} AS "FILE_STATUS"
  `;
}

export function ftaPrimaryColumns(): Prisma.Sql {
  return Prisma.sql`
    rp.forest_file_id AS "FOREST_FILE_ID",
    rp.project_name AS "PROJECT_NAME",
    ${describeCode(
      Prisma.sql`district_fta.recreation_district_code`,
      Prisma.sql`rdc_fta.description`,
    )} AS "DISTRICT",
    ${describeCode(
      Prisma.sql`pfu_fta.file_status_st`,
      Prisma.sql`rfsc_fta.description`,
    )} AS "FILE_STATUS"
  `;
}
