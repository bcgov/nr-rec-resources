export type ValidationType =
  | 'METADATA'
  | 'ATTRIBUTE'
  | 'GEOMETRY'
  | 'CRS'
  | 'FILE_FORMAT'
  | 'EXTENT'
  | 'TOPOLOGY'
  | 'SECTION_ID';

export type ValidationSeverity = 'ERROR' | 'WARNING';

export interface ValidationIssue {
  type: ValidationType;
  severity: ValidationSeverity;
  message: string;
  code?: string;
}

export interface SubmissionMetadata {
  email: string;
  telephone: string;
  contactName: string;
  districtCode: string;
  recreationDistrict: string;
  licenseRecNumber: string;
  rootNamespace: string;
  actionCode: string;
  accuracyCode: string;
  captureMethod: string;
  dataSource: string;
}

export interface FeatureSectionId {
  featureIndex: number;
  sectionId: string | null;
}

export interface SpatialFeature {
  type?: string;
  properties?: Record<string, unknown>;
  geometry?: {
    type?: string;
    coordinates?: unknown;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

export interface SpatialFeatureCollection {
  type?: string;
  crs?: unknown;
  bbox?: unknown;
  features: SpatialFeature[];
  [key: string]: unknown;
}

export interface PreparedFeatureCollectionResult {
  featureCollection: SpatialFeatureCollection;
  fieldName: string;
  sourceFieldName: string | null;
}

export interface SectionIdExtractionResult {
  fieldName: string | null;
  sectionIds: string[];
  featureSectionIds: FeatureSectionId[];
  issues: ValidationIssue[];
}
