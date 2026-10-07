import {
  DEFAULT_SECTION_ID_FIELD_NAME,
  MAP_LABEL_FIELD_CANDIDATES,
  SECTION_ID_FIELD_CANDIDATES,
} from './spatialSubmission.constants';
import type {
  FeatureSectionId,
  PreparedFeatureCollectionResult,
  SectionIdExtractionResult,
  ValidationIssue,
} from './spatialSubmission.types';

const normalizeFieldKey = (value: string): string =>
  value.toLowerCase().replaceAll(/[^a-z0-9]/g, '');

const pickSectionIdFieldName = (features: any[]): string | null => {
  const allPropertyKeys = Array.from(
    new Set(
      features.flatMap((feature) =>
        Object.keys(feature?.properties ?? {}).filter((key) => key.trim()),
      ),
    ),
  );

  if (!allPropertyKeys.length) {
    return null;
  }

  for (const candidate of SECTION_ID_FIELD_CANDIDATES) {
    const matchedKey = allPropertyKeys.find(
      (propertyKey) => normalizeFieldKey(propertyKey) === candidate,
    );
    if (matchedKey) {
      return matchedKey;
    }
  }

  return (
    allPropertyKeys.find((propertyKey) => {
      const normalizedKey = normalizeFieldKey(propertyKey);
      return (
        (normalizedKey.includes('section') && normalizedKey.includes('id')) ||
        (normalizedKey.includes('segment') && normalizedKey.includes('id'))
      );
    }) ?? null
  );
};

const pickMapLabelFieldName = (features: any[]): string | null => {
  const allPropertyKeys = Array.from(
    new Set(
      features.flatMap((feature) =>
        Object.keys(feature?.properties ?? {}).filter((key) => key.trim()),
      ),
    ),
  );

  for (const candidate of MAP_LABEL_FIELD_CANDIDATES) {
    const matchedKey = allPropertyKeys.find(
      (propertyKey) => normalizeFieldKey(propertyKey) === candidate,
    );
    if (matchedKey) {
      return matchedKey;
    }
  }

  return null;
};

const extractSectionIdSeedValue = (
  feature: any,
  fieldName: string | null,
  useMapLabelFallback = false,
): string => {
  if (!fieldName) {
    return '';
  }

  const rawValue = feature?.properties?.[fieldName];
  if (rawValue === null || rawValue === undefined) {
    return '';
  }

  let value = String(rawValue).trim();
  if (useMapLabelFallback) {
    value = value.split(/\s+/).at(-1) ?? '';
  }

  return value;
};

export const prepareFeatureCollectionForSectionEditing = (
  featureCollection: any,
): PreparedFeatureCollectionResult => {
  const features: any[] = featureCollection?.features ?? [];
  const detectedSectionIdFieldName = pickSectionIdFieldName(features);
  const mapLabelFieldName = detectedSectionIdFieldName
    ? null
    : pickMapLabelFieldName(features);
  const targetFieldName =
    detectedSectionIdFieldName ?? DEFAULT_SECTION_ID_FIELD_NAME;

  return {
    featureCollection: {
      ...featureCollection,
      features: features.map((feature: any) => ({
        ...feature,
        properties: {
          ...(feature?.properties ?? Object.create(null)),
          [targetFieldName]: extractSectionIdSeedValue(
            feature,
            detectedSectionIdFieldName ?? mapLabelFieldName,
            Boolean(mapLabelFieldName && !detectedSectionIdFieldName),
          ),
        },
      })),
    },
    fieldName: targetFieldName,
    sourceFieldName: detectedSectionIdFieldName ?? mapLabelFieldName,
  };
};

export const updateFeatureSectionId = (
  featureCollection: any,
  featureIndex: number,
  fieldName: string,
  nextSectionId: string,
): any => ({
  ...featureCollection,
  features: (featureCollection?.features ?? []).map(
    (feature: any, index: number) =>
      index === featureIndex
        ? {
            ...feature,
            properties: {
              ...(feature?.properties ?? Object.create(null)),
              [fieldName]: nextSectionId,
            },
          }
        : feature,
  ),
});

export const extractSectionIdDetails = (
  featureCollection: any,
): SectionIdExtractionResult => {
  const features: any[] = featureCollection?.features ?? [];
  const issues: ValidationIssue[] = [];

  if (!features.length) {
    return { fieldName: null, sectionIds: [], featureSectionIds: [], issues };
  }

  let fieldName = pickSectionIdFieldName(features);
  let usedMapLabelFallback = false;

  if (!fieldName) {
    fieldName = pickMapLabelFieldName(features);
    usedMapLabelFallback = fieldName !== null;
  }

  if (!fieldName) {
    const availableFields = Array.from(
      new Set(
        features.flatMap((feature) => Object.keys(feature?.properties ?? {})),
      ),
    ).sort((a, b) => a.localeCompare(b));

    issues.push({
      type: 'ATTRIBUTE',
      severity: 'WARNING',
      message: availableFields.length
        ? `No Section ID field was found among the uploaded attributes (${availableFields.join(', ')}). Expected a field such as SECTION_ID.`
        : 'No Section ID field was found: the uploaded file has no attributes at all.',
    });

    return { fieldName: null, sectionIds: [], featureSectionIds: [], issues };
  }

  const extractRawValue = (feature: any): string | null => {
    const rawValue = feature?.properties?.[fieldName as string];
    if (rawValue === null || rawValue === undefined) return null;

    let value = String(rawValue).trim();
    if (usedMapLabelFallback) {
      value = value.split(/\s+/).at(-1) ?? '';
    }

    return value || null;
  };

  const featureSectionIds: FeatureSectionId[] = features.map(
    (feature, index) => ({
      featureIndex: index + 1,
      sectionId: extractRawValue(feature),
    }),
  );

  const missingFeatures = featureSectionIds.filter(
    (entry) => entry.sectionId === null,
  );
  if (missingFeatures.length > 0) {
    const missingFeatureLabel = missingFeatures
      .map((entry) => `#${entry.featureIndex}`)
      .join(', ');
    issues.push({
      type: 'SECTION_ID',
      severity: 'ERROR',
      message: `${missingFeatures.length} feature(s) are missing a ${fieldName} value: ${missingFeatureLabel}.`,
      code: 'SECTION_ID_MISSING',
    });
  }

  const featureIndicesBySectionId = new Map<string, number[]>();
  featureSectionIds.forEach((entry) => {
    if (entry.sectionId === null) return;
    const existing = featureIndicesBySectionId.get(entry.sectionId) ?? [];
    existing.push(entry.featureIndex);
    featureIndicesBySectionId.set(entry.sectionId, existing);
  });

  featureIndicesBySectionId.forEach((featureIndices, sectionId) => {
    if (featureIndices.length > 1) {
      issues.push({
        type: 'SECTION_ID',
        severity: 'ERROR',
        message: `Section ID "${sectionId}" is used by ${featureIndices.length} features (${featureIndices
          .map((i) => `#${i}`)
          .join(', ')}); each feature should have a unique ${fieldName}.`,
        code: 'SECTION_ID_DUPLICATE',
      });
    }
  });

  const sectionIds = Array.from(featureIndicesBySectionId.keys()).sort(
    (first, second) =>
      first.localeCompare(second, undefined, { numeric: true }),
  );

  return { fieldName, sectionIds, featureSectionIds, issues };
};
