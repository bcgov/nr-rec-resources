import type {
  RequiredFieldKey,
  WizardValues,
} from './SpatialSubmissionSection.types';

export const FEATURE_TYPE_OPTIONS = [
  { value: 'LineString', label: 'Linear' },
  { value: 'Polygon', label: 'Polygon' },
];

export const DEFAULT_WIZARD_VALUES: WizardValues = {
  recreationName: '',
  recreationType: '',
  featureType: '',
  targetCrs: 'EPSG:3005 (BC Albers)',
  metadata: {
    email: '',
    contactName: '',
    districtCode: '',
    recreationDistrict: '',
    licenseRecNumber: '',
  },
};

export const REQUIRED_FIELD_LABELS: Record<RequiredFieldKey, string> = {
  recreationType: 'Recreation type',
  featureType: 'Feature type',
  email: 'Email address',
  contactName: 'Submitter name',
  districtCode: 'Natural resource district',
  recreationDistrict: 'Recreation district',
};

export const REQUIRED_FIELD_VALUE_SELECTORS: Record<
  RequiredFieldKey,
  (values: WizardValues) => string
> = {
  recreationType: (values) => values.recreationType,
  featureType: (values) => values.featureType,
  email: (values) => values.metadata.email,
  contactName: (values) => values.metadata.contactName,
  districtCode: (values) => values.metadata.districtCode,
  recreationDistrict: (values) => values.metadata.recreationDistrict,
};
