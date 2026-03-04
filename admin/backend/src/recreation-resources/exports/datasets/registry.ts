import { agreementListFtaDataset } from './agreement-list-fta.dataset';
import { agreementListDataset } from './agreement-list.dataset';
import { accessListFtaDataset } from './access-list-fta.dataset';
import { accessListDataset } from './access-list.dataset';
import { activitiesListFtaDataset } from './activities-list-fta.dataset';
import { activitiesListDataset } from './activities-list.dataset';
import { campsiteListFtaDataset } from './campsite-list-fta.dataset';
import { campsiteListDataset } from './campsite-list.dataset';
import { fileDetailsFtaDataset } from './file-details-fta.dataset';
import { fileDetailsDataset } from './file-details.dataset';
import { feeListFtaDataset } from './fee-list-fta.dataset';
import { feeListDataset } from './fee-list.dataset';
import { type ExportDatasetId } from './metadata';
import { objectiveListFtaDataset } from './objective-list-fta.dataset';
import { siteInspectionFtaDataset } from './site-inspection-fta.dataset';
import { structureListFtaDataset } from './structure-list-fta.dataset';
import { type ExportDatasetBuilder } from './types';

export const EXPORT_DATASET_BUILDERS: Partial<
  Record<ExportDatasetId, ExportDatasetBuilder>
> = {
  [agreementListDataset.id]: agreementListDataset,
  [agreementListFtaDataset.id]: agreementListFtaDataset,
  [accessListDataset.id]: accessListDataset,
  [accessListFtaDataset.id]: accessListFtaDataset,
  [activitiesListDataset.id]: activitiesListDataset,
  [activitiesListFtaDataset.id]: activitiesListFtaDataset,
  [campsiteListDataset.id]: campsiteListDataset,
  [campsiteListFtaDataset.id]: campsiteListFtaDataset,
  [fileDetailsDataset.id]: fileDetailsDataset,
  [fileDetailsFtaDataset.id]: fileDetailsFtaDataset,
  [feeListDataset.id]: feeListDataset,
  [feeListFtaDataset.id]: feeListFtaDataset,
  [objectiveListFtaDataset.id]: objectiveListFtaDataset,
  [siteInspectionFtaDataset.id]: siteInspectionFtaDataset,
  [structureListFtaDataset.id]: structureListFtaDataset,
};
