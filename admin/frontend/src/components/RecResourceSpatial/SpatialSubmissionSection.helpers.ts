import { REQUIRED_FIELD_VALUE_SELECTORS } from './SpatialSubmissionSection.constants';
import type {
  RequiredFieldKey,
  WizardValues,
} from './SpatialSubmissionSection.types';

export const getMissingRequiredFields = (
  values: WizardValues,
): RequiredFieldKey[] => {
  return (
    Object.keys(REQUIRED_FIELD_VALUE_SELECTORS) as RequiredFieldKey[]
  ).filter((field) => !REQUIRED_FIELD_VALUE_SELECTORS[field](values).trim());
};

export const requiresSectionIdsForFeatureCollection = (
  featureCollection: any,
): boolean => {
  const geometryType = featureCollection?.features?.[0]?.geometry?.type;
  if (!geometryType) {
    return false;
  }
  return geometryType !== 'Polygon' && geometryType !== 'MultiPolygon';
};
