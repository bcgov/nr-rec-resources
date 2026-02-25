import crypto, { createHash } from 'crypto';
import axios from 'axios';
import FormData from 'form-data';
import { LoggerService } from './logger-service';

const user = 'FBARRETA';
const privateKey =
  'eadf5671b31c517524b7c737b7b84bd365f40f96caa076cfc61891bd51f31363';
const damUrl = 'https://dam.lqc63d-test.nimbus.cloud.gov.bc.ca/api/?';

// DAM_RST_IMAGE_COLLECTION_ID=728

const logger = new LoggerService();

export async function getCollectionResources(
  collectionRef: string,
): Promise<any> {
  const params = {
    user: user,
    function: 'do_search',
    search: `!collection${collectionRef},!has_image`,
  };

  const logContext = `Collection: ${collectionRef}, User: ${user}`;

  return executeRequest(
    params,
    'Getting DAM resources from collection',
    logContext,
  );
}

export async function getResourceFieldData(resource: string): Promise<any> {
  const params = {
    user: user,
    function: 'get_resource_field_data',
    resource,
  };

  const logContext = `Resource Field Data: ${resource}, User: ${user}`;

  return executeRequest(
    params,
    'Getting DAM resources from collection',
    logContext,
  );
}

export async function getResourcePath(resource: string): Promise<any> {
  const params = {
    user: user,
    function: 'get_resource_all_image_sizes',
    resource,
  };

  const logContext = `Resource: ${resource}, User: ${user}`;

  return executeRequest(params, 'Getting DAM resource path', logContext);
}

async function executeRequest<T = any>(
  params: Record<string, any>,
  operation: string,
  logContext?: string,
): Promise<T | null> {
  logger.debug(`Executing ${operation} - ${logContext}`);

  try {
    const formData = createFormData(params);
    const result = await makeRequest(formData);

    logger.log(`${operation} completed successfully - ${logContext}`);
    return result;
  } catch (error) {
    logger.error(`${operation} failed - ${logContext}, Error: ${error}`);
    return null;
  }
}

function createFormData(params: Record<string, any>): FormData {
  logger.debug(
    `Creating form data - Parameters: [${Object.keys(params).join(', ')}], User: ${user}`,
  );

  const queryString = new URLSearchParams(params).toString();
  const signature = sign(queryString);
  const formData = new FormData();

  formData.append('query', queryString);
  formData.append('sign', signature);
  formData.append('user', user);

  logger.debug(
    `Form data created - Query Length: ${queryString.length}, Has Signature: ${!!signature}, User: ${user}`,
  );

  return formData;
}

function sign(query: string): string {
  logger.debug(
    `Signing DAM API query - Length: ${query.length}, Has Private Key: ${!!privateKey}`,
  );

  return createHash('sha256').update(`${privateKey}${query}`).digest('hex');
}

async function makeRequest(formData: FormData): Promise<any> {
  const startTime = Date.now();
  const requestId = crypto.randomBytes(6).toString('hex');

  logger.debug(`[${requestId}] Making DAM API request to ${damUrl}`);

  // Convert FormData to buffer to avoid stream consumption issues during retries
  const formDataBuffer = await formDataToBuffer(formData);
  const headers = formData.getHeaders();

  const response = await axios.post(damUrl, formDataBuffer, {
    headers,
  });

  const duration = Date.now() - startTime;
  logger.debug(
    `[${requestId}] DAM API request successful - Duration: ${duration}ms, Status: ${response.status}`,
  );

  return response.data;
}

/**
 * Converts FormData to Buffer to avoid stream consumption issues during retries
 */
async function formDataToBuffer(formData: FormData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];

    formData.on('data', (chunk) => {
      // Ensure chunk is converted to Buffer if it's not already
      if (Buffer.isBuffer(chunk)) {
        chunks.push(chunk);
      } else {
        chunks.push(Buffer.from(chunk));
      }
    });

    formData.on('end', () => {
      resolve(Buffer.concat(chunks));
    });

    formData.on('error', (error) => {
      reject(error);
    });

    // Start reading the stream
    formData.resume();
  });
}
