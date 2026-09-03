import { Prisma } from '@generated/prisma';
import { type ExportDatasetBuilder } from './types';

export const assetListDataset: ExportDatasetBuilder = {
  id: 'asset-list',
  buildQuery: ({ sql }) => Prisma.sql`
    SELECT
      ${sql.rstPrimaryColumns()},
      ra.asset_id::text AS "ASSET_ID",
      parent.asset_name AS "PARENT_ASSET",
      rac.description AS "ASSET_TYPE",
      ra.asset_name AS "ASSET_NAME",
      ra.asset_tag AS "ASSET_TAG",
      ra.asset_comment AS "ASSET_COMMENT",
      ra.asset_length::text AS "ASSET_LENGTH",
      ra.asset_width::text AS "ASSET_WIDTH",
      ra.asset_area::text AS "ASSET_AREA",
      ra.actual_value::text AS "ACTUAL_VALUE",
      TO_CHAR(ra.installation_date, 'YYYY-MM-DD') AS "INSTALLATION_DATE",
      ra.created_by AS "CREATED_BY",
      ${sql.formatTimestamp(Prisma.sql`ra.created_at`)} AS "CREATE_TIMESTAMP",
      ra.updated_by AS "UPDATED_BY",
      ${sql.formatTimestamp(Prisma.sql`ra.updated_at`)} AS "UPDATE_TIMESTAMP"
    FROM recreation_asset ra
    INNER JOIN recreation_resource rr
      ON rr.rec_resource_id = ra.rec_resource_id
    LEFT JOIN recreation_asset_code rac
      ON rac.asset_code = ra.asset_code
    LEFT JOIN recreation_asset parent
      ON parent.asset_id = ra.parent_id
    ${sql.sharedJoins}
    WHERE ${sql.rstFilters}
    ORDER BY
      rr.rec_resource_id,
      COALESCE(ra.parent_id, ra.asset_id),
      ra.parent_id NULLS FIRST,
      ra.asset_name,
      ra.asset_id
  `,
};
