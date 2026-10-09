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
    telephone: '',
    contactName: '',
    districtCode: '',
    recreationDistrict: '',
    licenseRecNumber: '',
    rootNamespace: 'esf',
    actionCode: 'I',
    accuracyCode: '10',
    captureMethod: 'GPS',
    dataSource: 'Unknown',
  },
};

export const REQUIRED_FIELD_LABELS: Record<RequiredFieldKey, string> = {
  recreationType: 'Recreation type',
  featureType: 'Feature type',
  email: 'Email Address',
  telephone: 'Telephone Number',
  contactName: 'Submitter Name',
  districtCode: 'Natural Resource District',
  recreationDistrict: 'Recreation District',
};

export const REQUIRED_FIELD_VALUE_SELECTORS: Record<
  RequiredFieldKey,
  (values: WizardValues) => string
> = {
  recreationType: (values) => values.recreationType,
  featureType: (values) => values.featureType,
  email: (values) => values.metadata.email,
  telephone: (values) => values.metadata.telephone,
  contactName: (values) => values.metadata.contactName,
  districtCode: (values) => values.metadata.districtCode,
  recreationDistrict: (values) => values.metadata.recreationDistrict,
};
