#!/usr/bin/env node
/**
 * Verify that every S3 object key in a file has the GuardDutyMalwareScanStatus tag.
 * Run after guardduty:scan to confirm all listed objects were tagged by GuardDuty.
 *
 * Usage: npm run guardduty:verify -w ops -- --bucket BUCKET --keys-file FILE [--profile PROFILE] [--region REGION]
 */

import { createLogger } from '../logger';
import {
  createS3Client,
  hasScanTag,
  parseArgs,
  readKeysFromFile,
  runInBatches,
  runWithFatalHandler,
  TAG_KEY,
} from './utils';

const CONCURRENCY = 20;

async function main(): Promise<void> {
  const startMs = Date.now();
  const { bucket, keysFile, profile, region } = parseArgs({
    demandKeysFile: true,
  });
  const resolvedRegion = region ?? process.env.AWS_REGION ?? 'us-east-1';
  const logger = createLogger('verify', { bucket, region: resolvedRegion });
  const client = createS3Client(profile, region);

  const keys = await readKeysFromFile(keysFile!);
  if (keys.length === 0) {
    logger.warn('No keys found in keys file', { keysFile });
    process.exit(0);
  }

  logger.info('Verifying objects in bucket', {
    count: String(keys.length),
    bucket,
  });
  const onTagError = (key: string, err: unknown) =>
    logger.warn('GetObjectTagging failed', { key, error: String(err) });
  const checks = await runInBatches(keys, CONCURRENCY, async (key) =>
    hasScanTag(client, bucket, key, onTagError),
  );
  const withTag = keys.filter((_, i) => checks[i]);
  const withoutTag = keys.filter((_, i) => !checks[i]);

  console.log(`With ${TAG_KEY} tag: ${withTag.length}`);
  console.log(`Missing ${TAG_KEY} tag: ${withoutTag.length}`);

  const durationMs = Date.now() - startMs;

  if (withoutTag.length > 0) {
    logger.error('Keys still missing the scan tag', {
      count: String(withoutTag.length),
      keys: withoutTag,
    });
    withoutTag.forEach((k) => logger.warn('Key missing tag', { key: k }));
    logger.info('Completed', { durationMs: String(durationMs) });
    process.exit(1);
  }

  logger.info('All keys have the GuardDuty scan tag', {
    count: String(keys.length),
  });
  logger.info('Completed', { durationMs: String(durationMs) });
}

runWithFatalHandler('verify', main);
