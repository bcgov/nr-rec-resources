import { Prisma } from '@generated/prisma';
import { type ExportDatasetBuilder } from './types';

export const accessListFtaDataset: ExportDatasetBuilder = {
  id: 'access-list-fta',
  buildQuery: ({ sql }) => Prisma.sql`
    SELECT
      ${sql.ftaPrimaryColumns()},
      ra.recreation_access_code AS "ACCESS_CODE",
      rac.description AS "ACCESS_DESC",
      ra.recreation_sub_access_code AS "SUB_ACCESS_CODE",
      rsac.description AS "SUB_ACCESS_DESC",
      ${sql.ftaSharedLegacyExportColumnsBeforeTail()},
      ${sql.ftaSharedLegacyExportColumnsTail(
        Prisma.sql`COALESCE(GREATEST(rp.update_timestamp::timestamp, ra.update_timestamp), ra.update_timestamp, rp.update_timestamp::timestamp)`,
      )}
    FROM fta.recreation_access ra
    INNER JOIN fta.recreation_project rp
      ON rp.forest_file_id = ra.forest_file_id
    LEFT JOIN fta.recreation_access_code rac
      ON rac.recreation_access_code = ra.recreation_access_code
    LEFT JOIN fta.recreation_sub_access_code rsac
      ON rsac.recreation_sub_access_code = ra.recreation_sub_access_code
    ${sql.ftaSharedJoins}
    WHERE ${sql.ftaFilters}
    ORDER BY rp.forest_file_id, ra.recreation_access_code, ra.recreation_sub_access_code
  `,
};
