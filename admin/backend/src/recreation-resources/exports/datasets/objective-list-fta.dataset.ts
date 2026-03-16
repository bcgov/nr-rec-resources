import { Prisma } from '@generated/prisma';
import { type ExportDatasetBuilder } from './types';

export const objectiveListFtaDataset: ExportDatasetBuilder = {
  id: 'objective-list-fta',
  buildQuery: ({ sql }) => Prisma.sql`
    SELECT
      ${sql.ftaPrimaryColumns()},
      ro.objective_id::text AS "OBJECTIVE_ID",
      ro.objective_description AS "OBJECTIVE_DESCRIPTION",
      TO_CHAR(ro.objective_established_date, 'YYYY-MM-DD') AS "OBJECTIVE_ESTABLISHED_DATE",
      TO_CHAR(ro.objective_amended_date, 'YYYY-MM-DD') AS "OBJECTIVE_AMENDED_DATE",
      TO_CHAR(ro.objective_cancelled_date, 'YYYY-MM-DD') AS "OBJECTIVE_CANCELLED_DATE",
      ro.revision_count::text AS "OBJECTIVE_REVISION_COUNT",
      ${sql.ftaSharedLegacyExportColumnsBeforeTail()},
      ${sql.ftaSharedLegacyExportColumnsTail(
        Prisma.sql`COALESCE(GREATEST(rp.update_timestamp::timestamp, ro.update_timestamp), ro.update_timestamp, rp.update_timestamp::timestamp)`,
      )}
    FROM fta.recreation_objective ro
    INNER JOIN fta.recreation_project rp
      ON rp.forest_file_id = ro.forest_file_id
    ${sql.ftaSharedJoins}
    WHERE ${sql.ftaFilters}
    ORDER BY rp.forest_file_id, ro.objective_id
  `,
};
