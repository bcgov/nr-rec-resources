import { Prisma } from '@generated/prisma';
import { type ExportDatasetBuilder } from './types';

export const activitiesListDataset: ExportDatasetBuilder = {
  id: 'activities-list',
  buildQuery: ({ sql }) => Prisma.sql`
    SELECT
      ${sql.rstPrimaryColumns()},
      ra.recreation_activity_code::text AS "ACTIVITY_CODE",
      rac.description AS "ACTIVITY_DESC",
      ${sql.legacySharedColumnsBeforeTail()},
      ${sql.legacySharedColumnsTail(
        Prisma.sql`COALESCE(GREATEST(rr.updated_at, ra.updated_at), rr.updated_at, ra.updated_at)`,
      )}
    FROM recreation_activity ra
    INNER JOIN recreation_resource rr
      ON rr.rec_resource_id = ra.rec_resource_id
    LEFT JOIN recreation_activity_code rac
      ON rac.recreation_activity_code = ra.recreation_activity_code
    ${sql.sharedJoins}
    WHERE ${sql.rstFilters}
    ORDER BY rr.rec_resource_id, ra.recreation_activity_code
  `,
};
