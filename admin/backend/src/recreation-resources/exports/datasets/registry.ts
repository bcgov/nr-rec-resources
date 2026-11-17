import { accessListDataset } from './access-list.dataset';
import { activitiesListDataset } from './activities-list.dataset';
import { assetListDataset } from './asset-list.dataset';
import { assetRepairListDataset } from './asset-repair-list.dataset';
import { campsiteListDataset } from './campsite-list.dataset';
import { fileDetailsDataset } from './file-details.dataset';
import { feeListDataset } from './fee-list.dataset';
import { type ExportDatasetId } from './metadata';
import { objectiveListDataset } from './objective-list.dataset';
import { partnersListDataset } from './partners-list.dataset';
import { type ExportDatasetBuilder } from './types';

export const EXPORT_DATASET_BUILDERS: Partial<
  Record<ExportDatasetId, ExportDatasetBuilder>
> = {
  [accessListDataset.id]: accessListDataset,
  [activitiesListDataset.id]: activitiesListDataset,
  [assetListDataset.id]: assetListDataset,
  [assetRepairListDataset.id]: assetRepairListDataset,
  [campsiteListDataset.id]: campsiteListDataset,
  [fileDetailsDataset.id]: fileDetailsDataset,
  [feeListDataset.id]: feeListDataset,
  [objectiveListDataset.id]: objectiveListDataset,
  [partnersListDataset.id]: partnersListDataset,
};
