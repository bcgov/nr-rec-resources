/**
 * Constants for the Act integration module.
 *
 * The Act team pushes real-time advisory changes into ACT data tables
 * via the secure CUD API exposed under `/api/v1/act/advisories`.
 *
 * Authentication is performed through CSS (Common Hosted Single Sign-On)
 * using the OAuth2 Client Credentials grant flow. The bearer token issued
 * by CSS must carry the `act-service` client role.
 */

// Swagger tag used to group Act endpoints in the OpenAPI docs
export const ACT_API_TAG = 'act';

// URI path segment for Act CUD endpoints
export const ACT_ADVISORIES_PATH = 'act/advisories';

// Log messages for the Act advisories service
export const ACT_LOG_MESSAGES = {
  UPSERT_RECEIVED: 'Received Act advisory upsert request',
  UPSERT_SUCCESS: 'Act advisory upsert completed',
  UPDATE_RECEIVED: 'Received Act advisory update request',
  UPDATE_SUCCESS: 'Act advisory update completed',
  DELETE_RECEIVED: 'Received Act advisory delete request',
  DELETE_SUCCESS: 'Act advisory delete completed',
} as const;

// Error messages returned by the Act advisories endpoints
export const ACT_ERROR_MESSAGES = {
  ADVISORY_NOT_FOUND: 'Advisory not found',
  REC_RESOURCE_NOT_FOUND: 'Recreation resource not found',
  INVALID_ADVISORY_NUMBER: 'advisory_number must be a positive integer',
} as const;
