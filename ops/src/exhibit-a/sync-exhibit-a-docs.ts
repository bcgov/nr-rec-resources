import {
  CopyObjectCommand,
  ListObjectsV2Command,
  S3Client,
} from '@aws-sdk/client-s3';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { createLogger } from '../logger';

type ParsedArgs = {
  env?: 'dev' | 'test' | 'prod';
  sourceBucket: string;
  targetBucket?: string;
  prefix: string;
  region: string;
  profile?: string;
  dryRun: boolean;
  concurrency: number;
};

const SCRIPT_NAME = 'sync-exhibit-a-docs';

function parseArgs(): ParsedArgs {
  const parsed = yargs(hideBin(process.argv))
    .option('env', {
      type: 'string',
      choices: ['dev', 'test', 'prod'],
      description:
        'Target environment used to derive bucket rst-lza-exhibit-a-docs-{env}',
    })
    .option('source-bucket', {
      type: 'string',
      default: 'rst-fta-lza-dataload-oracle',
      description: 'Source bucket containing Exhibit_A objects',
    })
    .option('target-bucket', {
      type: 'string',
      description:
        'Explicit target bucket name. Overrides --env derived bucket when set',
    })
    .option('prefix', {
      type: 'string',
      default: 'Exhibit_A/',
      description: 'Prefix to copy from source to target',
    })
    .option('region', {
      type: 'string',
      default: 'ca-central-1',
      description: 'AWS region',
    })
    .option('profile', {
      type: 'string',
      description: 'AWS profile name (optional)',
    })
    .option('dry-run', {
      type: 'boolean',
      default: false,
      description: 'List and log copy operations without writing',
    })
    .option('concurrency', {
      type: 'number',
      default: 10,
      description: 'Number of concurrent copy operations',
    })
    .check((argv) => {
      if (!argv['target-bucket'] && !argv.env) {
        throw new Error('Provide either --env or --target-bucket');
      }
      const c = argv.concurrency;
      if (typeof c !== 'number' || c <= 0 || !Number.isFinite(c)) {
        throw new Error('--concurrency must be a positive number');
      }
      return true;
    })
    .help()
    .parseSync();

  return {
    env: parsed.env as ParsedArgs['env'],
    sourceBucket: parsed['source-bucket'] as string,
    targetBucket: parsed['target-bucket'] as string | undefined,
    prefix: parsed.prefix as string,
    region: parsed.region as string,
    profile: parsed.profile as string | undefined,
    dryRun: parsed['dry-run'] as boolean,
    concurrency: parsed.concurrency as number,
  };
}

function resolveTargetBucket(args: ParsedArgs): string {
  if (args.targetBucket?.trim()) {
    return args.targetBucket.trim();
  }
  return `rst-lza-exhibit-a-docs-${args.env}`;
}

function createS3Client(profile: string | undefined, region: string): S3Client {
  if (profile) {
    process.env.AWS_PROFILE = profile;
  }
  return new S3Client({ region });
}

async function listAllKeys(
  client: S3Client,
  sourceBucket: string,
  prefix: string,
): Promise<string[]> {
  const keys: string[] = [];
  let continuationToken: string | undefined;

  do {
    const response = await client.send(
      new ListObjectsV2Command({
        Bucket: sourceBucket,
        Prefix: prefix,
        ContinuationToken: continuationToken,
      }),
    );

    for (const object of response.Contents ?? []) {
      if (object.Key && !object.Key.endsWith('/')) {
        keys.push(object.Key);
      }
    }

    continuationToken = response.NextContinuationToken;
  } while (continuationToken);

  return keys;
}

async function runInBatches<T>(
  items: T[],
  concurrency: number,
  fn: (item: T) => Promise<void>,
): Promise<void> {
  let index = 0;
  async function worker(): Promise<void> {
    while (index < items.length) {
      const i = index++;
      await fn(items[i]);
    }
  }

  const workers = Array.from(
    { length: Math.min(concurrency, items.length) },
    () => worker(),
  );
  await Promise.all(workers);
}

async function main(): Promise<void> {
  const args = parseArgs();
  const logger = createLogger(SCRIPT_NAME);
  const targetBucket = resolveTargetBucket(args);
  const prefix = args.prefix.endsWith('/') ? args.prefix : `${args.prefix}/`;

  const client = createS3Client(args.profile, args.region);

  logger.info('Starting Exhibit A copy', {
    sourceBucket: args.sourceBucket,
    targetBucket,
    prefix,
    region: args.region,
    dryRun: String(args.dryRun),
    concurrency: String(args.concurrency),
  });

  const keys = await listAllKeys(client, args.sourceBucket, prefix);
  logger.info('Listed source keys', { count: String(keys.length) });

  if (keys.length === 0) {
    logger.warn('No objects found for prefix; nothing to copy', { prefix });
    return;
  }

  if (args.dryRun) {
    for (const key of keys.slice(0, 25)) {
      logger.info('Dry run copy', {
        source: `s3://${args.sourceBucket}/${key}`,
        target: `s3://${targetBucket}/${key}`,
      });
    }
    if (keys.length > 25) {
      logger.info('Dry run output truncated', {
        shown: '25',
        total: String(keys.length),
      });
    }
    logger.info('Dry run complete', { total: String(keys.length) });
    return;
  }

  let copied = 0;
  await runInBatches(keys, args.concurrency, async (key) => {
    await client.send(
      new CopyObjectCommand({
        Bucket: targetBucket,
        Key: key,
        CopySource: `${args.sourceBucket}/${encodeURIComponent(key).replace(/%2F/g, '/')}`,
      }),
    );
    copied += 1;
    if (copied % 500 === 0 || copied === keys.length) {
      logger.info('Copy progress', {
        copied: String(copied),
        total: String(keys.length),
      });
    }
  });

  logger.info('Copy complete', {
    sourceBucket: args.sourceBucket,
    targetBucket,
    copied: String(copied),
  });
}

main().catch((error) => {
  const logger = createLogger(SCRIPT_NAME);
  logger.error('Fatal error', {
    error: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined,
  });
  process.exit(1);
});
