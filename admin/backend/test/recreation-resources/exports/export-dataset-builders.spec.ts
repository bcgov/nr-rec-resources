import { type ExportDatasetBuilderContext } from '@/recreation-resources/exports/datasets/types';
import { assetListDataset } from '@/recreation-resources/exports/datasets/asset-list.dataset';
import { closureListFtaDataset } from '@/recreation-resources/exports/datasets/closure-list-fta.dataset';
import { feeListFtaDataset } from '@/recreation-resources/exports/datasets/fee-list-fta.dataset';
import { fileDetailsDataset } from '@/recreation-resources/exports/datasets/file-details.dataset';
import { siteInspectionFtaDataset } from '@/recreation-resources/exports/datasets/site-inspection-fta.dataset';
import {
  buildFtaFilters,
  buildRstFilters,
} from '@/recreation-resources/exports/fragments/filters';
import {
  displayIndicator,
  formatTimestamp,
} from '@/recreation-resources/exports/fragments/formatters';
import {
  buildFtaSharedJoins,
  buildSharedJoins,
} from '@/recreation-resources/exports/fragments/joins';
import {
  ftaSharedLegacyExportColumnsBeforeTail,
  ftaSharedLegacyExportColumnsTail,
  legacySharedColumnsBeforeTail,
  legacySharedColumnsTail,
} from '@/recreation-resources/exports/fragments/legacy-columns';
import {
  ftaPrimaryColumns,
  rstPrimaryColumns,
} from '@/recreation-resources/exports/fragments/source-columns';
import { describe, expect, it } from 'vitest';
import { Prisma } from '@generated/prisma';

function createBuilderContext(
  params: ExportDatasetBuilderContext['params'],
): ExportDatasetBuilderContext {
  return {
    params,
    sql: {
      rstFilters: buildRstFilters(params),
      ftaFilters: buildFtaFilters(params),
      sharedJoins: buildSharedJoins(),
      ftaSharedJoins: buildFtaSharedJoins(),
      rstPrimaryColumns,
      ftaPrimaryColumns,
      legacySharedColumnsBeforeTail,
      legacySharedColumnsTail,
      ftaSharedLegacyExportColumnsBeforeTail,
      ftaSharedLegacyExportColumnsTail,
      displayIndicator,
      formatTimestamp,
    },
  };
}

function normalizeDatasetSql(
  buildQuery: (context: ExportDatasetBuilderContext) => Prisma.Sql,
  context: ExportDatasetBuilderContext,
): string {
  return buildQuery(context).sql.replace(/\s+/g, ' ').trim();
}

describe('export dataset builders', () => {
  it('builds the main RST file details query with requested filters', () => {
    const sql = normalizeDatasetSql(
      fileDetailsDataset.buildQuery,
      createBuilderContext({
        dataset: 'file-details',
        district: 'D01',
        resourceType: 'TRAIL',
      }),
    );

    expect(sql).toContain('FROM recreation_resource rr');
    expect(sql).not.toContain('"TOTAL_REMEDIAL_REPAIRS"');
    expect(sql).not.toContain('"STRUCTURE_COUNT"');
    expect(sql).toContain(
      'WHERE 1 = 1 AND rr.district_code = ? AND rrtva.rec_resource_type_code = ?',
    );
    expect(sql).toContain('ORDER BY rr.rec_resource_id');
  });

  it('builds the fee list FTA query with FTA filters and fee ordering', () => {
    const sql = normalizeDatasetSql(
      feeListFtaDataset.buildQuery,
      createBuilderContext({
        dataset: 'fee-list-fta',
        district: 'D01',
        resourceType: 'CABIN',
      }),
    );

    expect(sql).toContain('FROM fta.recreation_fee rf');
    expect(sql).toContain('"FEE_ID"');
    expect(sql).toContain(
      'EXISTS ( SELECT 1 FROM fta.recreation_district_xref rdx_filter WHERE rdx_filter.forest_file_id = rp.forest_file_id AND rdx_filter.recreation_district_code = ? )',
    );
    expect(sql).toContain('ORDER BY rp.forest_file_id, rf.fee_id');
  });

  it('builds the site inspection FTA query from the inspection report table', () => {
    const sql = normalizeDatasetSql(
      siteInspectionFtaDataset.buildQuery,
      createBuilderContext({
        dataset: 'site-inspection-fta',
      }),
    );

    expect(sql).toContain('FROM fta.recreation_inspection_report rir');
    expect(sql).toContain('"FILE_TYPE_CODE"');
    expect(sql).toContain('"RECREATION_FEATURE"');
    expect(sql).toContain('"REM_REPAIR_COUNT"');
    expect(sql).toContain(
      'LEFT JOIN fta.recreation_project rp ON rp.forest_file_id = rir.forest_file_id',
    );
    expect(sql).toContain('LEFT JOIN fta.recreation_file_type_code rftc');
    expect(sql).toContain('ORDER BY rir.forest_file_id, rir.inspection_id');
  });

  it('builds the closure list FTA query with closure and archive filters', () => {
    const sql = normalizeDatasetSql(
      closureListFtaDataset.buildQuery,
      createBuilderContext({
        dataset: 'closure-list-fta',
      }),
    );

    expect(sql).toContain('FROM fta.recreation_comment rc');
    expect(sql).toContain("rc.rec_comment_type_code = 'CLOS'");
    expect(sql).toContain("rc.closure_ind = 'Y'");
    expect(sql).toContain("NULLIF(TRIM(rc.project_comment), '') IS NOT NULL");
    expect(sql).toContain("COALESCE(pfu.file_status_st, '') <> 'AR'");
    expect(sql).toContain('"CLOSURE_COMMENT"');
    expect(sql).toContain('"CLOSEST_COMMUNITY"');
    expect(sql).toContain('"VISIBLE_ON_PUBLIC_SITE"');
    expect(sql).toContain('"DISTRICT"');
    expect(sql).toContain('"PROJECT_TYPE"');
    expect(sql).toContain('ORDER BY rp.forest_file_id');
  });

  it('builds the RST asset list query with resolved foreign key names', () => {
    const sql = normalizeDatasetSql(
      assetListDataset.buildQuery,
      createBuilderContext({
        dataset: 'asset-list',
        district: 'D01',
        resourceType: 'TRAIL',
      }),
    );

    expect(sql).toContain('FROM recreation_asset ra');
    expect(sql).toContain(
      'INNER JOIN recreation_resource rr ON rr.rec_resource_id = ra.rec_resource_id',
    );
    expect(sql).toContain(
      'LEFT JOIN recreation_asset_code rac ON rac.asset_code = ra.asset_code',
    );
    expect(sql).toContain(
      'LEFT JOIN recreation_asset parent ON parent.asset_id = ra.parent_id',
    );
    expect(sql).toContain(
      'WHERE 1 = 1 AND rr.district_code = ? AND rrtva.rec_resource_type_code = ?',
    );
  });

  it('exposes asset attributes and campsite parentage in the asset list query', () => {
    const sql = normalizeDatasetSql(
      assetListDataset.buildQuery,
      createBuilderContext({
        dataset: 'asset-list',
      }),
    );

    expect(sql).toContain('"ASSET_ID"');
    expect(sql).toContain('"PARENT_ASSET"');
    expect(sql).toContain('"ASSET_TYPE"');
    expect(sql).toContain('"ASSET_NAME"');
    expect(sql).toContain('"ASSET_TAG"');
    expect(sql).toContain('"INSTALLATION_DATE"');
    // Raw FK columns are intentionally omitted in favour of the resolved names.
    expect(sql).not.toContain('"PARENT_ID"');
    expect(sql).not.toContain('"ASSET_CODE"');
    expect(sql).not.toContain('"LEGACY_STRUCTURE_ID"');
    expect(sql).toContain('"CREATE_TIMESTAMP"');
    expect(sql).toContain('"UPDATE_TIMESTAMP"');
    // Resource-level legacy columns are omitted: this export is per-asset, and
    // TOTAL_AREA/TOTAL_LENGTH would sit confusingly beside ASSET_AREA/ASSET_LENGTH.
    expect(sql).not.toContain('"TOTAL_AREA"');
    expect(sql).not.toContain('"TOTAL_LENGTH"');
    expect(sql).not.toContain('"DEFINED_CAMPSITES"');
    expect(sql).not.toContain('"ACTIVITY_COUNT"');
    expect(sql).not.toContain('"PROJECT_TYPE"');
    expect(sql).not.toContain('"RISK_RATING"');
    expect(sql).not.toContain('"STATUS"');
    // Groups each parent campsite with its children, parent row first.
    expect(sql).toContain(
      'ORDER BY rr.rec_resource_id, COALESCE(ra.parent_id, ra.asset_id), ra.parent_id NULLS FIRST, ra.asset_name, ra.asset_id',
    );
  });
});
