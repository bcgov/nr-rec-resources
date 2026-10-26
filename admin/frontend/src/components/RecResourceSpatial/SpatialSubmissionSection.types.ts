import type { ReactNode } from 'react';
import type { SubmissionMetadata } from './spatialSubmissionUtils';

export interface SpatialSubmissionSectionProps {
  recResourceId: string;
  defaultRecreationTypeCode?: string;
  defaultNaturalResourceDistrict?: string;
  defaultRecreationDistrict?: string;
  editMode?: boolean;
  existingSectionIds?: string[];
  showCreateHeading?: boolean;
  useGeospatialCompactForm?: boolean;
  onCancel?: () => void;
}

export interface WizardValues {
  recreationName: string;
  recreationType: string;
  featureType: string;
  targetCrs: string;
  metadata: SubmissionMetadata;
}

export type RequiredFieldKey =
  | 'recreationType'
  | 'featureType'
  | 'email'
  | 'contactName'
  | 'districtCode'
  | 'recreationDistrict';

export interface CreateStatus {
  variant: 'success' | 'danger';
  message: ReactNode;
}

export interface SpatialOption {
  id?: string;
  label?: string | null;
  is_archived?: boolean;
}
