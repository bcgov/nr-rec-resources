import { Prisma } from '@generated/prisma';
import { type ExportDatasetBuilder } from './types';

export const activitiesListFtaDataset: ExportDatasetBuilder = {
  id: 'activities-list-fta',
  buildQuery: ({ sql }) => Prisma.sql`
    SELECT
      ${sql.ftaPrimaryColumns()},
      ra.recreation_activity_code::text AS "ACTIVITY_CODE",
      rac.description AS "ACTIVITY_DESC",
      ra.activity_rank::text AS "ACTIVITY_RANK",
      ${sql.ftaSharedLegacyExportColumnsBeforeTail()},
      ${sql.ftaSharedLegacyExportColumnsTail(
        Prisma.sql`COALESCE(GREATEST(rp.update_timestamp::timestamp, ra.update_timestamp), ra.update_timestamp, rp.update_timestamp::timestamp)`,
      )}
    FROM fta.recreation_activity ra
    INNER JOIN fta.recreation_project rp
      ON rp.forest_file_id = ra.forest_file_id
    LEFT JOIN fta.recreation_activity_code rac
      ON rac.recreation_activity_code = ra.recreation_activity_code
    ${sql.ftaSharedJoins}
    WHERE ${sql.ftaFilters}
    ORDER BY rp.forest_file_id, ra.activity_rank, ra.recreation_activity_code
  `,
};
