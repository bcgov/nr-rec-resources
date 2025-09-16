export enum MetricNames {
  REQUEST_LATENCY = 'RequestLatency',
  REQUEST_COUNT = 'RequestCount',
  RESPONSE_CODE_COUNT = 'ResponseCodeCount',
  ERROR_COUNT = 'ErrorCount',
}

export enum ErrorTypes {
  SERVER = 'ServerError',
  CLIENT = 'ClientError',
}

export enum MetricDimensions {
  OPERATION = 'Operation',
  METHOD = 'Method',
  STATUS_CODE = 'StatusCode',
  ERROR_TYPE = 'ErrorType',
}

export const ENV_VARS = {
  APP_ENV: 'APP_ENV',
} as const;

export enum EnvValues {
  LOCAL = 'local',
}

export const SWAGGER_CONSTANTS = {
  API_OPERATION: 'swagger/apiOperation',
} as const;

export const DEFAULT_METRIC_NAMESPACE_NAME_PREFIX =
  'RecreationSitesAndTrailsBCAPI';

export const ADMIN_METRIC_NAMESPACE_NAME_PREFIX =
  'RecreationSitesAndTrailsBCAdminAPI';

export const PUBLIC_METRIC_NAMESPACE_NAME_PREFIX =
  'RecreationSitesAndTrailsBCPublicAPI';
