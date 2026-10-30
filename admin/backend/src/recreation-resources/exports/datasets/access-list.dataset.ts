import { Prisma } from '@generated/prisma';
import { type ExportDatasetBuilder } from './types';

export const accessListDataset: ExportDatasetBuilder = {
  id: 'access-list',
  buildQuery: ({ sql }) => Prisma.sql`
    SELECT
      ${sql.rstPrimaryColumns()},
      ${sql.describeCode(
        Prisma.sql`ra.access_code`,
        Prisma.sql`rac.description`,
      )} AS "ACCESS_DESC",
      ${sql.describeCode(
        Prisma.sql`ra.sub_access_code`,
        Prisma.sql`rsac.description`,
      )} AS "SUB_ACCESS_DESC",
      ${sql.legacySharedColumnsBeforeTail()},
      ${sql.legacySharedColumnsTail(
        Prisma.sql`COALESCE(GREATEST(rr.updated_at, ra.updated_at), rr.updated_at, ra.updated_at)`,
      )}
    FROM recreation_access ra
    INNER JOIN recreation_resource rr
      ON rr.rec_resource_id = ra.rec_resource_id
    LEFT JOIN recreation_access_code rac
      ON rac.access_code = ra.access_code
    LEFT JOIN recreation_sub_access_code rsac
      ON rsac.sub_access_code = ra.sub_access_code
    ${sql.sharedJoins}
    WHERE ${sql.rstFilters}
    ORDER BY rr.rec_resource_id, ra.id
  `,
};
