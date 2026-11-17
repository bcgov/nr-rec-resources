import { type ExportDatasetBuilderContext } from '@/recreation-resources/exports/datasets/types';
import { EXPORT_DATASET_BUILDERS } from '@/recreation-resources/exports/datasets/registry';
import { assetListDataset } from '@/recreation-resources/exports/datasets/asset-list.dataset';
import { partnersListDataset } from '@/recreation-resources/exports/datasets/partners-list.dataset';
import { assetRepairListDataset } from '@/recreation-resources/exports/datasets/asset-repair-list.dataset';
import { fileDetailsDataset } from '@/recreation-resources/exports/datasets/file-details.dataset';
import { objectiveListDataset } from '@/recreation-resources/exports/datasets/objective-list.dataset';
import {
  buildFtaFilters,
  buildRstFilters,
} from '@/recreation-resources/exports/fragments/filters';
import {
  booleanIndicator,
  describeCode,
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
      booleanIndicator,
      describeCode,
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
    expect(sql).not.toContain('"FEATURE_CODE"');
    expect(sql).toContain(
      'WHERE 1 = 1 AND rr.district_code = ? AND rrtva.rec_resource_type_code = ?',
    );
    expect(sql).toContain('ORDER BY rr.rec_resource_id');
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

  it('builds the RST partners list query with resolved foreign key names', () => {
    const sql = normalizeDatasetSql(
      partnersListDataset.buildQuery,
      createBuilderContext({
        dataset: 'partners-list',
      }),
    );

    expect(sql).toContain('FROM rst.recreation_agreement_holder ah');
    expect(sql).toContain(
      'INNER JOIN recreation_resource rr ON rr.rec_resource_id = ah.rec_resource_id',
    );
    expect(sql).toContain(
      `LEFT OUTER JOIN rst.recreation_fee rf ON rf.rec_resource_id = rr.rec_resource_id`,
    );
    expect(sql).toContain('"IS_RECREATION_OPERATOR"');
    expect(sql).toContain('"CLIENT_NUMBER"');
    expect(sql).toContain('"DISPLAY_ON_WEBSITE"');
    expect(sql).toContain('"AGREEMENT_START_DATE"');
    expect(sql).toContain('"AGREEMENT_END_DATE"');
    expect(sql).not.toContain('RELATIONSHIP_TYPE_CODE');
  });

  it('exposes asset attributes and campsite parentage in the asset list query', () => {
    const sql = normalizeDatasetSql(
      assetListDataset.buildQuery,
      createBuilderContext({
        dataset: 'asset-list',
      }),
    );

    expect(sql).toContain('"ASSET_ID"');
    expect(sql).toContain('"CAMPSITE_LOCATION"');
    expect(sql).toContain('"ASSET_TYPE"');
    expect(sql).toContain('"ASSET_NAME"');
    expect(sql).toContain('"ASSET_TAG"');
    expect(sql).toContain('"INSTALLATION_DATE"');
    // Raw FK columns are intentionally omitted in favour of the resolved names.
    expect(sql).not.toContain('"PARENT_ID"');
    expect(sql).not.toContain('"ASSET_CODE"');
    expect(sql).not.toContain('"LEGACY_STRUCTURE_ID"');
    expect(sql).toContain('"CREATED_AT"');
    expect(sql).toContain('"UPDATED_AT"');
    // Resource-level legacy columns are omitted: this export is per-asset, and
    // TOTAL_AREA/TOTAL_LENGTH would sit confusingly beside ASSET_AREA/ASSET_LENGTH.
    expect(sql).not.toContain('"TOTAL_AREA"');
    expect(sql).not.toContain('"TOTAL_LENGTH"');
    expect(sql).not.toContain('"DEFINED_CAMPSITES"');
    expect(sql).not.toContain('"ACTIVITY_COUNT"');
    expect(sql).not.toContain('"RESOURCE_TYPE"');
    expect(sql).not.toContain('"RISK_RATING"');
    expect(sql).not.toContain('"STATUS"');
    // Groups each parent campsite with its children, parent row first.
    expect(sql).toContain(
      'ORDER BY rr.rec_resource_id, COALESCE(ra.parent_id, ra.asset_id), ra.parent_id NULLS FIRST, ra.asset_name, ra.asset_id',
    );
  });

  it('builds the RST asset repair list query joined through its asset', () => {
    const sql = normalizeDatasetSql(
      assetRepairListDataset.buildQuery,
      createBuilderContext({
        dataset: 'asset-repair-list',
        district: 'D01',
        resourceType: 'TRAIL',
      }),
    );

    expect(sql).toContain('FROM recreation_asset_repair rap');
    // recreation_asset_repair has no rec_resource_id, so the resource is
    // reached through the asset -- which is also what the filters need.
    expect(sql).toContain(
      'INNER JOIN recreation_asset ra ON ra.asset_id = rap.asset_id',
    );
    expect(sql).toContain(
      'INNER JOIN recreation_resource rr ON rr.rec_resource_id = ra.rec_resource_id',
    );
    expect(sql).toContain(
      'WHERE 1 = 1 AND rr.district_code = ? AND rrtva.rec_resource_type_code = ?',
    );
  });

  it('exposes repair attributes and owning asset context in the repair list query', () => {
    const sql = normalizeDatasetSql(
      assetRepairListDataset.buildQuery,
      createBuilderContext({
        dataset: 'asset-repair-list',
      }),
    );

    expect(sql).toContain('"ASSET_ID"');
    expect(sql).toContain('"ASSET_NAME"');
    expect(sql).toContain('"ASSET_COMMENT"');
    expect(sql).toContain('"REPAIR_ID"');
    expect(sql).toContain('"REPAIR_TYPE"');
    expect(sql).toContain('"ESTIMATED_REPAIR_COST"');
    expect(sql).toContain('"ACTUAL_REPAIR_COST"');
    expect(sql).toContain('"REPAIR_COMPLETED_DATE"');
    expect(sql).toContain('"URGENCY"');
    // The repair code is resolved to its description, per the FK-name rule.
    // Aliased rrc, not rrrc, which sharedJoins already binds to the risk rating code.
    expect(sql).toContain(
      'LEFT JOIN recreation_remed_repair_code rrc ON rrc.recreation_remed_repair_code = rap.recreation_remed_repair_code',
    );
    expect(sql).not.toContain('"RECREATION_REMED_REPAIR_CODE"');
    expect(sql).toContain(
      'ORDER BY rr.rec_resource_id, ra.asset_id, rap.repair_id',
    );
  });

  it('builds the objective list query from imported objective notes', () => {
    const sql = normalizeDatasetSql(
      objectiveListDataset.buildQuery,
      createBuilderContext({
        dataset: 'objective-list',
      }),
    );

    expect(sql).toContain('FROM recreation_resource_note rn');
    expect(sql).toContain("rn.note_type_code = 'OBJECTIVE'");
    expect(sql).toContain("rn.source_system = 'FTA'");
    expect(sql).toContain('NULL::text AS "OBJECTIVE_REVISION_COUNT"');
    expect(sql).toContain(
      'ORDER BY rr.rec_resource_id, rn.date_logged, rn.note_id',
    );
    expect(sql).not.toContain('FROM recreation_objective ro');
  });
});

describe('export dataset shared column contract', () => {
  const datasetEntries = Object.entries(EXPORT_DATASET_BUILDERS).map(
    ([id, builder]) =>
      [
        id,
        normalizeDatasetSql(
          builder!.buildQuery,
          createBuilderContext({ dataset: id as never }),
        ),
      ] as const,
  );

  it.each(datasetEntries)('%s exports a district', (_id, sql) => {
    expect(sql).toContain('"DISTRICT"');
  });

  // This is what makes an archived resource identifiable in the output.
  it.each(datasetEntries)('%s exports the file status', (_id, sql) => {
    expect(sql).toContain('"FILE_STATUS"');
  });

  it.each(datasetEntries)(
    '%s no longer exports the mislabelled FILE_STATUS_ST',
    (_id, sql) => {
      expect(sql).not.toContain('"FILE_STATUS_ST"');
      expect(sql).not.toContain('"STATUS"');
    },
  );

  it.each(datasetEntries)('%s exports no raw code column', (_id, sql) => {
    const columns = [...sql.matchAll(/AS "([A-Z0-9_]+)"/g)].map((m) => m[1]!);
    expect(columns.filter((c) => c.endsWith('_CODE'))).toEqual([]);
  });

  // Archived rows are part of the export unless the caller opts out, so no
  // dataset should be carrying an 'AR' predicate at the default settings.
  it.each(datasetEntries)(
    '%s includes archived rows by default',
    (_id, sql) => {
      expect(sql).not.toContain("'AR'");
    },
  );

  it.each(datasetEntries)('%s has no duplicate output columns', (_id, sql) => {
    const columns = [...sql.matchAll(/AS "([A-Z0-9_]+)"/g)].map((m) => m[1]);
    expect(columns).toEqual([...new Set(columns)]);
  });
});
