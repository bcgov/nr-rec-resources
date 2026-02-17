/**
 * Shared utilities for GuardDuty scripts: CLI parsing, S3/client helpers,
 * batch execution, tag checks, and fatal-error handler.
 */

import { GetObjectTaggingCommand, S3Client } from '@aws-sdk/client-s3';
import { createReadStream } from 'fs';
import { createInterface } from 'readline';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { createLogger } from '../logger';

export const TAG_KEY = 'GuardDutyMalwareScanStatus';

/**
 * Options for {@link parseArgs}.
 */
export type ParseArgsOptions = {
  demandKeysFile: boolean; // If true, require --keys-file to be provided
};

/**
 * Result of {@link parseArgs}: CLI options for GuardDuty scripts.
 */
export type ParsedArgs = {
  bucket: string; // S3 bucket name
  keysFile?: string; // Path to file with S3 object keys, one per line
  profile?: string; // AWS profile name
  region?: string; // AWS region
  output?: string; // Output file path (e.g. for unscanned keys)
};

export function parseArgs(options: ParseArgsOptions): ParsedArgs {
  const { demandKeysFile } = options;
  let builder = yargs(hideBin(process.argv))
    .option('bucket', {
      type: 'string',
      description: 'S3 bucket name',
    })
    .option('keys-file', {
      type: 'string',
      description: 'Path to file with S3 object keys (one per line)',
    })
    .option('profile', {
      type: 'string',
      description: 'AWS profile name (default: use AWS_PROFILE env)',
    })
    .option('region', {
      type: 'string',
      default: 'ca-central-1',
      description: 'AWS region',
    })
    .option('output', {
      type: 'string',
      description: 'Write unscanned keys to this file (list-unscanned only)',
    })
    .demandOption('bucket', 'bucket is required (--bucket)')
    .check((argv) => {
      const b = argv.bucket;
      if (typeof b !== 'string' || !b.trim()) {
        throw new Error('bucket is required and must be non-empty (--bucket)');
      }
      return true;
    });
  if (demandKeysFile) {
    builder = builder
      .demandOption('keys-file', 'keys-file is required (--keys-file)')
      .check((argv) => {
        const k = argv['keys-file'];
        if (typeof k !== 'string' || !k.trim()) {
          throw new Error('keys-file is required and must be a non-empty path (--keys-file). Example: make verify BUCKET=my-bucket KEYS_FILE=unscanned-keys.txt');
        }
        return true;
      });
  }
  const parsed = builder.help().parseSync();
  return {
    bucket: parsed.bucket as string,
    keysFile: parsed['keys-file'] as string | undefined,
    profile: parsed.profile as string | undefined,
    region: parsed.region as string | undefined,
    output: parsed.output as string | undefined,
  };
}

export function runWithFatalHandler(scriptName: string, main: () => Promise<void>): void {
  main().catch((err) => {
    createLogger(scriptName).error('Fatal error', {
      error: String(err),
      stack: err instanceof Error ? err.stack : undefined,
    });
    process.exit(1);
  });
}

export function createS3Client(profile?: string, region?: string): S3Client {
  if (profile) process.env.AWS_PROFILE = profile;
  const resolvedRegion = region ?? process.env.AWS_REGION ?? 'us-east-1';
  return new S3Client({ region: resolvedRegion });
}

export async function readKeysFromFile(path: string): Promise<string[]> {
  const keys: string[] = [];
  const rl = createInterface({
    input: createReadStream(path),
    crlfDelay: Infinity,
  });
  for await (const line of rl) {
    const key = line.trim();
    if (key) keys.push(key);
  }
  return keys;
}

export async function runInBatches<T, R>(
  items: T[],
  concurrency: number,
  fn: (item: T) => Promise<R>,
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let index = 0;
  async function worker(): Promise<void> {
    while (index < items.length) {
      const i = index++;
      results[i] = await fn(items[i]);
    }
  }
  const workers = Array.from(
    { length: Math.min(concurrency, items.length) },
    () => worker(),
  );
  await Promise.all(workers);
  return results;
}

export async function hasScanTag(
  client: S3Client,
  bucket: string,
  key: string,
  onError?: (key: string, err: unknown) => void,
): Promise<boolean> {
  try {
    const response = await client.send(
      new GetObjectTaggingCommand({ Bucket: bucket, Key: key }),
    );
    return (response.TagSet ?? []).some((t) => t.Key === TAG_KEY);
  } catch (err) {
    onError?.(key, err);
    return false;
  }
}
