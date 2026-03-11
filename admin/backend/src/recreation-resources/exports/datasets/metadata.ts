export type ExportDatasetId =
  | 'file-details'
  | 'file-details-fta'
  | 'fee-list'
  | 'fee-list-fta'
  | 'agreement-list'
  | 'agreement-list-fta'
  | 'campsite-list'
  | 'campsite-list-fta'
  | 'objective-list'
  | 'objective-list-fta'
  | 'structure-list'
  | 'structure-list-fta'
  | 'access-list'
  | 'access-list-fta'
  | 'activities-list'
  | 'activities-list-fta'
  | 'site-inspection'
  | 'site-inspection-fta';

export type ExportDatasetSource = 'RST' | 'FTA';

export const NOT_IMPLEMENTED_INFO = 'not-implemented';
export const MISSING_FTA_LEGACY_METADATA_INFO =
  'Legacy rollup region, org unit, file type, and file status fields are not currently included in this export.';
export const MISSING_FTA_SITE_INSPECTION_METADATA_INFO =
  'Legacy rollup region, org unit, file status, management unit, and associated files fields are not currently included in this export. PROJECT_CODE_DESC and TENURE_APP_ID remain excluded pending a confirmed source. H_REM_REPAIR_COUNT and LAST_C_E_INSPECTION_DATE remain excluded because their legacy mappings are still ambiguous. REC_PROJECT_SKEY and PARAM_* remain intentionally excluded.';
export const MISSING_RST_STRUCTURE_COUNT_INFO =
  'STRUCTURE_COUNT is not implemented in this export yet because RST does not yet fully import structure data.';

export interface ExportDatasetDefinition {
  id: ExportDatasetId;
  label: string;
  source: ExportDatasetSource;
  info?: string;
}

export const ALL_EXPORT_DATASETS: ExportDatasetDefinition[] = [
  {
    id: 'file-details',
    label: 'File details',
    source: 'RST',
    info: `TOTAL_REMEDIAL_REPAIRS is not implemented in this export yet because RST does not yet fully import structure data. ${MISSING_RST_STRUCTURE_COUNT_INFO}`,
  },
  {
    id: 'file-details-fta',
    label: 'File details',
    source: 'FTA',
  },
  {
    id: 'fee-list',
    label: 'Fee list',
    source: 'RST',
    info: MISSING_RST_STRUCTURE_COUNT_INFO,
  },
  {
    id: 'fee-list-fta',
    label: 'Fee list',
    source: 'FTA',
    info: MISSING_FTA_LEGACY_METADATA_INFO,
  },
  {
    id: 'agreement-list',
    label: 'Agreement list',
    source: 'RST',
    info: `${MISSING_FTA_LEGACY_METADATA_INFO} ${MISSING_RST_STRUCTURE_COUNT_INFO}`,
  },
  {
    id: 'agreement-list-fta',
    label: 'Agreement list',
    source: 'FTA',
    info: MISSING_FTA_LEGACY_METADATA_INFO,
  },
  {
    id: 'campsite-list',
    label: 'Campsite list',
    source: 'RST',
    info: MISSING_RST_STRUCTURE_COUNT_INFO,
  },
  {
    id: 'campsite-list-fta',
    label: 'Campsite list',
    source: 'FTA',
    info: MISSING_FTA_LEGACY_METADATA_INFO,
  },
  {
    id: 'objective-list',
    label: 'Objective list',
    source: 'RST',
    info: NOT_IMPLEMENTED_INFO,
  },
  {
    id: 'objective-list-fta',
    label: 'Objective list',
    source: 'FTA',
    info: MISSING_FTA_LEGACY_METADATA_INFO,
  },
  {
    id: 'structure-list',
    label: 'Structure list',
    source: 'RST',
    info: NOT_IMPLEMENTED_INFO,
  },
  {
    id: 'structure-list-fta',
    label: 'Structure list',
    source: 'FTA',
    info: MISSING_FTA_LEGACY_METADATA_INFO,
  },
  {
    id: 'access-list',
    label: 'Access list',
    source: 'RST',
    info: MISSING_RST_STRUCTURE_COUNT_INFO,
  },
  {
    id: 'access-list-fta',
    label: 'Access list',
    source: 'FTA',
    info: MISSING_FTA_LEGACY_METADATA_INFO,
  },
  {
    id: 'activities-list',
    label: 'Activities list',
    source: 'RST',
    info: MISSING_RST_STRUCTURE_COUNT_INFO,
  },
  {
    id: 'activities-list-fta',
    label: 'Activities list',
    source: 'FTA',
    info: MISSING_FTA_LEGACY_METADATA_INFO,
  },
  {
    id: 'site-inspection',
    label: 'Site inspection',
    source: 'RST',
    info: NOT_IMPLEMENTED_INFO,
  },
  {
    id: 'site-inspection-fta',
    label: 'Site inspection',
    source: 'FTA',
    info: MISSING_FTA_SITE_INSPECTION_METADATA_INFO,
  },
];

export const IMPLEMENTED_EXPORT_DATASETS = ALL_EXPORT_DATASETS.filter(
  (dataset) => dataset.info !== NOT_IMPLEMENTED_INFO,
);

export const IMPLEMENTED_EXPORT_DATASET_IDS = IMPLEMENTED_EXPORT_DATASETS.map(
  (dataset) => dataset.id,
) as ExportDatasetId[];
