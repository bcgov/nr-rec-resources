#!/usr/bin/env node
/**
 * List S3 objects that do NOT have the GuardDuty malware scan tag (GuardDutyMalwareScanStatus).
 * Optionally write keys to a file for use by run-s3-malware-scan.ts.
 *
 * Usage: npm run guardduty:list-unscanned -w ops -- --bucket BUCKET [--profile PROFILE] [--output FILE]
 */

import { ListObjectsV2Command, S3Client } from '@aws-sdk/client-s3';
import { writeFile } from 'fs/promises';
import { createLogger } from '../logger';
import {
  createS3Client,
  hasScanTag,
  parseArgs,
  runInBatches,
  runWithFatalHandler,
} from './utils';

const CONCURRENCY = 20;
const PROGRESS_INTERVAL = 500;

async function listAllKeys(
  client: S3Client,
  bucket: string,
): Promise<string[]> {
  const keys: string[] = [];
  let continuationToken: string | undefined;
  do {
    const command = new ListObjectsV2Command({
      Bucket: bucket,
      ContinuationToken: continuationToken,
      MaxKeys: 1000,
    });
    const response = await client.send(command);
    for (const obj of response.Contents ?? []) {
      if (obj.Key) keys.push(obj.Key);
    }
    continuationToken = response.NextContinuationToken;
  } while (continuationToken);
  return keys;
}

async function main(): Promise<void> {
  const startMs = Date.now();
  const { bucket, profile, output, region } = parseArgs({
    demandKeysFile: false,
  });
  const resolvedRegion = region ?? process.env.AWS_REGION ?? 'us-east-1';
  const logger = createLogger('list-unscanned', {
    bucket,
    region: resolvedRegion,
  });
  const client = createS3Client(profile, region);

  logger.info('Listing objects in bucket', { bucket });
  const allKeys = await listAllKeys(client, bucket);
  logger.info('Total objects listed', { count: String(allKeys.length) });

  if (allKeys.length === 0) {
    logger.info('No objects in bucket', { bucket });
    logger.info('Completed', { durationMs: String(Date.now() - startMs) });
    console.log('Objects without GuardDuty scan tag: 0');
    return;
  }

  logger.info('Checking tags for objects', { total: String(allKeys.length) });
  let checked = 0;
  const onTagError = (key: string, err: unknown) =>
    logger.warn('GetObjectTagging failed', { key, error: String(err) });
  const unscanned: string[] = [];
  const checks = await runInBatches(allKeys, CONCURRENCY, async (key) => {
    const result = await hasScanTag(client, bucket, key, onTagError);
    checked++;
    if (checked % PROGRESS_INTERVAL === 0) {
      logger.info('Tag check progress', {
        checked: String(checked),
        total: String(allKeys.length),
      });
    }
    return result;
  });
  allKeys.forEach((key, i) => {
    if (!checks[i]) unscanned.push(key);
  });

  unscanned.sort();
  for (const key of unscanned) {
    logger.info('Unscanned key', { key });
  }
  console.log(`Objects without GuardDuty scan tag: ${unscanned.length}`);
  for (const key of unscanned) {
    console.log(key);
  }

  if (output && unscanned.length > 0) {
    await writeFile(output, unscanned.join('\n') + '\n', 'utf8');
    logger.info('Wrote keys to file', {
      count: String(unscanned.length),
      output,
    });
  }
  logger.info('Completed', { durationMs: String(Date.now() - startMs) });
}

runWithFatalHandler('list-unscanned', main);
