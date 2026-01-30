import exec from 'k6/execution';
import http from 'k6/http';
import checkStatus from '../utils/checkStatus.js'; // eslint-disable-line

// Comment out auth guards before running:
//  - resource-images.controller.ts
//  - resource-docs.controller.ts
//  - recreation-resource.controller.ts
//  - user-context.service.ts - returns 'LOAD_TEST_USER' when no auth token

const API_BASE = `${__ENV.SERVER_HOST}/api`;
const API_V1_BASE = `${__ENV.SERVER_HOST}/api/v1`;
const HEADERS = { headers: { 'Content-Type': 'application/json' } };
const RESOURCE_IDS = [
  'REC204117',
  'REC1222',
  'REC160773',
  'REC203239',
  'REC6866',
];
const SEARCH_TERMS = ['tofino', 'campbell', 'lake', 'trail', 'park', 'river'];
const DOC_NAMES = [
  'site-map.pdf',
  'trail-guide.pdf',
  'campground-rules.pdf',
  'access-directions.pdf',
];

const uploadStages = [
  { duration: '1m', target: 5 },
  { duration: '3m', target: 10 },
  { duration: '5m', target: 15 },
  { duration: '3m', target: 10 },
  { duration: '2m', target: 5 },
  { duration: '1m', target: 0 },
];

const apiStages = [
  { duration: '2m', target: 10 },
  { duration: '5m', target: 20 },
  { duration: '5m', target: 20 },
  { duration: '2m', target: 10 },
  { duration: '3m', target: 10 },
  { duration: '1m', target: 0 },
];

export const options = {
  scenarios: {
    'admin-image-upload': { executor: 'ramping-vus', stages: uploadStages },
    'admin-document-upload': { executor: 'ramping-vus', stages: uploadStages },
    'admin-suggestions-search': { executor: 'ramping-vus', stages: apiStages },
    'admin-resource-get': { executor: 'ramping-vus', stages: apiStages },
  },
  thresholds: {
    'http_req_duration{scenario:admin-image-upload}': ['p(95)<5000'],
    'http_req_duration{scenario:admin-document-upload}': ['p(95)<5000'],
    'http_req_duration{scenario:admin-suggestions-search}': ['p(99)<2000'],
    'http_req_duration{scenario:admin-resource-get}': ['p(99)<2000'],
  },
  rps: 50,
};

const randomFrom = (arr) => arr[Math.floor(Math.random() * arr.length)];

function testSuggestionsSearch() {
  const term = randomFrom(SEARCH_TERMS);
  const res = http.get(
    `${API_BASE}/recreation-resources/suggestions?search_term=${term}`,
    HEADERS,
  );
  checkStatus(res, `suggestions-search-${term}`, 200);
}

function testResourceGet(resourceId) {
  const res = http.get(
    `${API_BASE}/recreation-resources/${resourceId}`,
    HEADERS,
  );
  checkStatus(res, `resource-get-${resourceId}`, 200);
}

// Image upload: presign → finalize (S3 upload skipped)
function testImageUpload(resourceId) {
  const fileName = `load-test-${Date.now()}`;

  // Presign
  const presignRes = http.post(
    `${API_V1_BASE}/recreation-resources/${resourceId}/images/presign?fileName=${fileName}`,
    null,
    HEADERS,
  );
  if (!checkStatus(presignRes, 'image-presign', 201)) return;

  let imageId;
  try {
    imageId = JSON.parse(presignRes.body).image_id;
  } catch {
    console.error('Failed to parse presign response');
    return;
  }
  if (!imageId) {
    console.error('No image_id in presign response');
    return;
  }

  // Finalize (S3 upload skipped)
  const finalizeRes = http.post(
    `${API_V1_BASE}/recreation-resources/${resourceId}/images/finalize`,
    JSON.stringify({
      image_id: imageId,
      file_name: `${fileName}.webp`,
      file_size_original: 800 * 1024,
      file_size_scr: 250 * 1024,
      file_size_pre: 100 * 1024,
      file_size_thm: 30 * 1024,
    }),
    HEADERS,
  );
  checkStatus(finalizeRes, 'image-finalize', 201);
}

// Document upload: presign → finalize (S3 upload skipped)
function testDocumentUpload(resourceId) {
  const fileName = randomFrom(DOC_NAMES);

  // Presign
  const presignRes = http.post(
    `${API_V1_BASE}/recreation-resources/${resourceId}/docs/presign?fileName=${fileName}`,
    null,
    HEADERS,
  );
  if (!checkStatus(presignRes, 'doc-presign', 201)) return;

  let documentId;
  try {
    documentId = JSON.parse(presignRes.body).document_id;
  } catch {
    console.error('Failed to parse doc presign response');
    return;
  }
  if (!documentId) {
    console.error('No document_id in presign response');
    return;
  }

  // Finalize (S3 upload skipped)
  const finalizeRes = http.post(
    `${API_V1_BASE}/recreation-resources/${resourceId}/docs/finalize`,
    JSON.stringify({
      document_id: documentId,
      file_name: fileName,
      extension: 'pdf',
      file_size: 500 * 1024,
    }),
    HEADERS,
  );
  checkStatus(finalizeRes, 'doc-finalize', 201);
}

export default function () {
  const resourceId = randomFrom(RESOURCE_IDS);
  const scenario = exec.scenario.name;

  if (scenario === 'admin-image-upload') {
    testImageUpload(resourceId);
  }
  if (scenario === 'admin-document-upload') {
    testDocumentUpload(resourceId);
  }
  if (scenario === 'admin-suggestions-search') {
    testSuggestionsSearch();
  }
  if (scenario === 'admin-resource-get') {
    testResourceGet(resourceId);
  }
}
