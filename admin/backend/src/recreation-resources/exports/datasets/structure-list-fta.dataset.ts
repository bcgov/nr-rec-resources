import { Prisma } from '@generated/prisma';
import { type ExportDatasetBuilder } from './types';

export const structureListFtaDataset: ExportDatasetBuilder = {
  id: 'structure-list-fta',
  buildQuery: ({ sql }) => Prisma.sql`
    SELECT
      ${sql.ftaPrimaryColumns()},
      rsf.recreation_structure_code::text AS "STRUCTURE_CODE",
      rscf.description AS "STRUCTURE_DESC",
      ${sql.ftaSharedLegacyExportColumnsBeforeTail()},
      ${sql.ftaSharedLegacyExportColumnsTail(
        Prisma.sql`COALESCE(GREATEST(rp.update_timestamp::timestamp, rsf.update_timestamp), rsf.update_timestamp, rp.update_timestamp::timestamp)`,
      )}
    FROM fta.recreation_structure rsf
    INNER JOIN fta.recreation_project rp
      ON rp.forest_file_id = rsf.forest_file_id
    LEFT JOIN fta.recreation_structure_code rscf
      ON rscf.recreation_structure_code = rsf.recreation_structure_code
    ${sql.ftaSharedJoins}
    WHERE ${sql.ftaFilters}
    ORDER BY rp.forest_file_id, rsf.recreation_structure_code, rsf.structure_id
  `,
};
