import { Prisma } from '@generated/prisma';
import { type ExportDatasetBuilder } from './types';

export const structureListDataset: ExportDatasetBuilder = {
  id: 'structure-list',
  buildQuery: ({ sql }) => Prisma.sql`
    SELECT
      ${sql.rstPrimaryColumns()},
      rs2.structure_code::text AS "STRUCTURE_CODE",
      rsc2.description AS "STRUCTURE_DESC",
      ${sql.legacySharedColumnsBeforeTail()},
      ${sql.legacySharedColumnsTail(
        Prisma.sql`COALESCE(GREATEST(rr.updated_at, rs2.updated_at), rr.updated_at, rs2.updated_at)`,
      )}
    FROM recreation_structure rs2
    INNER JOIN recreation_resource rr
      ON rr.rec_resource_id = rs2.rec_resource_id
    LEFT JOIN recreation_structure_code rsc2
      ON rsc2.structure_code = rs2.structure_code
    ${sql.sharedJoins}
    WHERE ${sql.rstFilters}
    ORDER BY rr.rec_resource_id, rs2.structure_code
  `,
};
