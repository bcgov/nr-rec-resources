import { describe, it, expect, beforeEach, vi } from 'vitest';
import { gunzipSync } from 'node:zlib';
import { ServiceUnavailableException } from '@nestjs/common';
import { AppConfigService } from '@/app-config/app-config.service';
import { S3Service } from '@/s3/s3.service';
import { BcgwExportService } from '@/bcgw/export/bcgw-export.service';
import { BCGW_LAYERS } from '@/bcgw/export/bcgw-layers';

/**
 * Shared, mutable state the module mocks read from. vi.hoisted so it exists before
 * the mock factories below run.
 */
const state = vi.hoisted(() => ({
  rows: [] as Record<string, unknown>[],
  lockAcquired: true,
  uploadFails: false,
  clients: [] as FakeClient[],
  uploads: [] as FakeUpload[],
}));

interface FakeClient {
  queries: string[];
  connected: boolean;
  ended: boolean;
}

interface FakeUpload {
  params: { Key: string; ContentType: string; Body: AsyncIterable<Buffer> };
  body: Buffer[];
  aborted: boolean;
}

vi.mock('pg', () => ({
  Client: class {
    connected = false;
    ended = false;
    queries: string[] = [];

    constructor() {
      state.clients.push(this as unknown as FakeClient);
    }

    async connect() {
      this.connected = true;
    }

    async end() {
      this.ended = true;
    }

    query(arg: unknown) {
      if (typeof arg === 'string') {
        this.queries.push(arg);
        return arg.includes('pg_try_advisory_lock')
          ? { rows: [{ locked: state.lockAcquired }] }
          : { rows: [] };
      }
      // A QueryStream, which our mock below makes a readable of rows already.
      return arg;
    }
  },
}));

vi.mock('pg-query-stream', async () => {
  const { Readable } = await import('node:stream');
  return {
    default: class extends Readable {
      private remaining: Record<string, unknown>[];

      constructor(public readonly text: string) {
        super({ objectMode: true });
        this.remaining = [...state.rows];
      }

      _read() {
        this.push(this.remaining.shift() ?? null);
      }
    },
  };
});

vi.mock('@aws-sdk/lib-storage', () => ({
  Upload: class {
    params: FakeUpload['params'];
    body: Buffer[] = [];
    aborted = false;

    constructor(opts: { params: FakeUpload['params'] }) {
      this.params = opts.params;
      state.uploads.push(this as unknown as FakeUpload);
    }

    async done() {
      // Throwing before draining mirrors a multipart failure: the service has to
      // tear the pipeline down itself rather than wait for a reader.
      if (state.uploadFails) {
        throw new Error('multipart upload failed');
      }
      for await (const chunk of this.params.Body) {
        this.body.push(Buffer.from(chunk));
      }
      return { ETag: '"etag-abc"' };
    }

    async abort() {
      this.aborted = true;
    }
  },
}));

describe('BcgwExportService', () => {
  let s3Service: {
    getS3Client: ReturnType<typeof vi.fn>;
    getBucketName: ReturnType<typeof vi.fn>;
    putJson: ReturnType<typeof vi.fn>;
  };
  let appConfig: AppConfigService;

  const createService = (s3: unknown = s3Service) =>
    new BcgwExportService(appConfig, s3 as S3Service | null);

  beforeEach(() => {
    state.rows = [
      {
        rec_resource_id: 'REC0001',
        rec_resource_name: 'First',
        geometry: '{"type":"Point","coordinates":[1,2]}',
      },
      {
        rec_resource_id: 'REC0002',
        rec_resource_name: 'Second',
        geometry: null,
      },
    ];
    state.lockAcquired = true;
    state.uploadFails = false;
    state.clients = [];
    state.uploads = [];

    s3Service = {
      getS3Client: vi.fn(() => ({})),
      getBucketName: vi.fn(() => 'rst-bcgw-exports-test'),
      putJson: vi.fn().mockResolvedValue(undefined),
    };
    appConfig = {
      databaseUrl: 'postgresql://test_user:test@localhost:5432/test_db',
    } as unknown as AppConfigService;
  });

  describe('S3 keys', () => {
    it('derives the data and manifest keys from the layer name', () => {
      expect(BcgwExportService.dataKey('recreation-lines')).toBe(
        'recreation-lines.geojson.gz',
      );
      expect(BcgwExportService.manifestKey('recreation-lines')).toBe(
        'recreation-lines.manifest.json',
      );
    });
  });

  describe('run', () => {
    it('exports one file and one manifest per layer', async () => {
      const manifests = await createService().run();

      expect(manifests.map((m) => m.layer)).toEqual(
        BCGW_LAYERS.map((l) => l.name),
      );
      expect(state.uploads.map((u) => u.params.Key)).toEqual(
        BCGW_LAYERS.map((l) => `${l.name}.geojson.gz`),
      );
      expect(s3Service.putJson).toHaveBeenCalledTimes(BCGW_LAYERS.length);
    });

    it('refreshes both materialized views before any export, concurrently', async () => {
      await createService().run();

      const { queries } = state.clients[0]!;
      expect(queries[0]).toContain('pg_try_advisory_lock');
      expect(queries[1]).toBe(
        'REFRESH MATERIALIZED VIEW CONCURRENTLY bcgw.resource_details_and_closures',
      );
      expect(queries[2]).toBe(
        'REFRESH MATERIALIZED VIEW CONCURRENTLY bcgw.recreation_map_features',
      );
    });

    it('uploads gzip that decompresses to a valid FeatureCollection', async () => {
      await createService().run();

      const first = state.uploads[0]!;
      expect(first.params.ContentType).toBe('application/gzip');

      const parsed = JSON.parse(
        gunzipSync(Buffer.concat(first.body)).toString(),
      );
      expect(parsed.type).toBe('FeatureCollection');
      expect(parsed.features).toHaveLength(2);
      expect(parsed.features[0].geometry).toEqual({
        type: 'Point',
        coordinates: [1, 2],
      });
      expect(parsed.features[1].geometry).toBeNull();
      expect(parsed.features[0].properties).toEqual({
        rec_resource_id: 'REC0001',
        rec_resource_name: 'First',
      });
    });

    it('counts the gzipped bytes that actually reached the uploader', async () => {
      const manifest = (await createService().run())[0]!;

      expect(manifest.bytes).toBe(Buffer.concat(state.uploads[0]!.body).length);
      expect(manifest.bytes).toBeGreaterThan(0);
    });

    it('records the feature count, an unquoted etag and a timestamp', async () => {
      const manifest = (await createService().run())[0]!;

      expect(manifest.feature_count).toBe(2);
      expect(manifest.etag).toBe('etag-abc');
      expect(Number.isNaN(Date.parse(manifest.generated_at))).toBe(false);
      expect(s3Service.putJson).toHaveBeenCalledWith(
        `${BCGW_LAYERS[0]!.name}.manifest.json`,
        manifest,
      );
    });

    it('writes an empty FeatureCollection when a layer has no rows', async () => {
      state.rows = [];

      const manifest = (await createService().run())[0]!;

      expect(manifest.feature_count).toBe(0);
      expect(
        JSON.parse(
          gunzipSync(Buffer.concat(state.uploads[0]!.body)).toString(),
        ),
      ).toEqual({ type: 'FeatureCollection', features: [] });
    });

    it('skips the run without refreshing when another task holds the lock', async () => {
      state.lockAcquired = false;

      await expect(createService().run()).resolves.toEqual([]);

      expect(state.uploads).toHaveLength(0);
      expect(s3Service.putJson).not.toHaveBeenCalled();
      expect(state.clients[0]!.queries.some((q) => q.includes('REFRESH'))).toBe(
        false,
      );
    });

    it('releases the advisory lock and closes the connection', async () => {
      await createService().run();

      expect(state.clients[0]!.queries).toContain(
        'SELECT pg_advisory_unlock($1)',
      );
      expect(state.clients[0]!.ended).toBe(true);
    });

    it('aborts the upload, still closes the connection, and rethrows on failure', async () => {
      state.uploadFails = true;

      await expect(createService().run()).rejects.toThrow(
        'multipart upload failed',
      );

      expect(state.uploads[0]!.aborted).toBe(true);
      expect(state.clients[0]!.ended).toBe(true);
      // No manifest, so a failed export never advertises itself as current.
      expect(s3Service.putJson).not.toHaveBeenCalled();
    });

    it('fails before opening a connection when no export bucket is configured', async () => {
      await expect(createService(null).run()).rejects.toThrow(
        ServiceUnavailableException,
      );

      expect(state.clients).toHaveLength(0);
    });
  });
});
