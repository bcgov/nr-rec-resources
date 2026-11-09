export type ExportDatasetId =
  | 'file-details'
  | 'fee-list'
  | 'campsite-list'
  | 'objective-list'
  | 'asset-list'
  | 'access-list'
  | 'activities-list'
  | 'asset-repair-list'
  | 'partners-list';

export type ExportDatasetSource = 'RST';

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
  },
  {
    id: 'fee-list',
    label: 'Fee list',
    source: 'RST',
  },
  {
    id: 'campsite-list',
    label: 'Campsite list',
    source: 'RST',
  },
  {
    id: 'objective-list',
    label: 'Objective list',
    source: 'RST',
  },
  {
    id: 'asset-list',
    label: 'Asset list',
    source: 'RST',
  },
  {
    id: 'access-list',
    label: 'Access list',
    source: 'RST',
  },
  {
    id: 'activities-list',
    label: 'Activities list',
    source: 'RST',
  },
  {
    id: 'asset-repair-list',
    label: 'Asset repair list',
    source: 'RST',
  },
  {
    id: 'partners-list',
    label: 'Partners list',
    source: 'RST',
  },
];

export const IMPLEMENTED_EXPORT_DATASETS = ALL_EXPORT_DATASETS;

export const IMPLEMENTED_EXPORT_DATASET_IDS = IMPLEMENTED_EXPORT_DATASETS.map(
  (dataset) => dataset.id,
) as ExportDatasetId[];
