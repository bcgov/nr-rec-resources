import { Injectable, Logger } from '@nestjs/common';
import { Upload } from '@aws-sdk/lib-storage';
import { CompleteMultipartUploadCommandOutput } from '@aws-sdk/client-s3';
import { Client } from 'pg';
import QueryStream from 'pg-query-stream';
import { createGzip } from 'node:zlib';
import { pipeline } from 'node:stream/promises';
import { Transform } from 'node:stream';
import { AppConfigService } from '@/app-config/app-config.service';
import { S3Service } from '@/s3/s3.service';
import { BCGW_LAYERS, BcgwLayer } from './bcgw-layers';
import { GeoJsonFeatureCollectionStream } from './geojson-feature-collection.stream';

/**
 * Arbitrary but stable key for the advisory lock that serializes export runs.
 */
const EXPORT_ADVISORY_LOCK_KEY = 8472001;

/**
 * Rows fetched per round trip from the server-side cursor. Large enough to keep
 * the pipeline fed, small enough that a batch never dominates memory.
 */
const CURSOR_BATCH_SIZE = 500;

export interface BcgwLayerManifest {
  layer: string;
  generated_at: string;
  feature_count: number;
  bytes: number;
  etag?: string;
}

/**
 * Refreshes the BCGW materialized views and uploads one gzipped GeoJSON file per
 * layer to S3.
 *
 * Runs inside the API task. Memory stays bounded because rows are read through a
 * server-side cursor and piped straight into a multipart upload, so nothing ever
 * holds a whole layer. An advisory lock keeps concurrent tasks - rolling deploys,
 * autoscaling - from racing to write the same objects.
 */
@Injectable()
export class BcgwExportService {
  private readonly logger = new Logger(BcgwExportService.name);

  constructor(
    private readonly appConfig: AppConfigService,
    private readonly s3Service: S3Service,
  ) {}

  /** S3 key for a layer's data file. */
  static dataKey(layerName: string): string {
    return `${layerName}.geojson.gz`;
  }

  /** S3 key for a layer's manifest. */
  static manifestKey(layerName: string): string {
    return `${layerName}.manifest.json`;
  }

  /**
   * Refreshes both materialized views, then exports every layer.
   *
   * Refresh and export are sequential in one method, so each file is always
   * generated from a completed refresh. No-ops when another task holds the lock.
   *
   * @returns One manifest per exported layer, or an empty array if the lock was
   * not acquired.
   */
  async run(): Promise<BcgwLayerManifest[]> {
    const client = new Client({ connectionString: this.appConfig.databaseUrl });
    await client.connect();

    try {
      const { rows } = await client.query<{ locked: boolean }>(
        'SELECT pg_try_advisory_lock($1) AS locked',
        [EXPORT_ADVISORY_LOCK_KEY],
      );

      if (!rows[0]?.locked) {
        this.logger.debug(
          'BCGW export skipped - another task holds the advisory lock',
        );
        return [];
      }

      try {
        const startedAt = Date.now();
        await this.refreshMaterializedViews(client);

        const manifests: BcgwLayerManifest[] = [];
        for (const layer of BCGW_LAYERS) {
          manifests.push(await this.exportLayer(client, layer));
        }

        this.logger.log(
          `BCGW export complete - ${manifests.length} layers in ${
            Date.now() - startedAt
          }ms`,
        );

        return manifests;
      } finally {
        await client.query('SELECT pg_advisory_unlock($1)', [
          EXPORT_ADVISORY_LOCK_KEY,
        ]);
      }
    } finally {
      await client.end();
    }
  }

  /**
   * Refreshes the two materialized views backing the BCGW views. CONCURRENTLY so
   * readers are never blocked; both views have the required unique index.
   */
  private async refreshMaterializedViews(client: Client): Promise<void> {
    for (const view of [
      'bcgw.resource_details_and_closures',
      'bcgw.recreation_map_features',
    ]) {
      const startedAt = Date.now();
      await client.query(`REFRESH MATERIALIZED VIEW CONCURRENTLY ${view}`);
      this.logger.log(`Refreshed ${view} in ${Date.now() - startedAt}ms`);
    }
  }

  /**
   * Streams one layer to S3 and writes its manifest.
   *
   * The pipeline is cursor -> GeoJSON framing -> gzip -> byte counter, with the
   * counter handed to the multipart upload as its body. The upload only becomes
   * visible on completion, so BCGW can never read a half-written object.
   */
  private async exportLayer(
    client: Client,
    layer: BcgwLayer,
  ): Promise<BcgwLayerManifest> {
    const startedAt = Date.now();
    const key = BcgwExportService.dataKey(layer.name);

    const cursor = client.query(
      new QueryStream(layer.query, [], { batchSize: CURSOR_BATCH_SIZE }),
    );
    const features = new GeoJsonFeatureCollectionStream();

    // Counts the gzipped bytes on their way to the uploader. A `data` listener
    // would put the stream in flowing mode and steal chunks from the upload, so
    // the count has to happen inside the pipeline.
    let bytes = 0;
    const body = new Transform({
      transform(chunk: Buffer, _encoding, callback) {
        bytes += chunk.length;
        callback(null, chunk);
      },
    });

    const upload = new Upload({
      client: this.s3Service.getS3Client(),
      params: {
        Bucket: this.s3Service.getBucketName(),
        Key: key,
        Body: body,
        ContentType: 'application/gzip',
      },
    });

    const streaming = pipeline(cursor, features, createGzip(), body);

    let uploadResult: CompleteMultipartUploadCommandOutput;
    try {
      [uploadResult] = await Promise.all([upload.done(), streaming]);
    } catch (error) {
      // Whichever side failed, tear down the other: a dangling cursor would hold
      // a database connection open, and an unfinished multipart upload would
      // leave billable parts behind.
      cursor.destroy();
      body.destroy();
      await upload.abort().catch((abortError) => {
        this.logger.warn(
          `Failed to abort upload for ${key}: ${abortError.message}`,
        );
      });
      // The pipeline's own rejection is secondary once we have an error to throw,
      // but it still has to be consumed or it surfaces as an unhandled rejection.
      await streaming.catch(() => undefined);
      throw error;
    }

    const manifest: BcgwLayerManifest = {
      layer: layer.name,
      generated_at: new Date().toISOString(),
      feature_count: features.count,
      bytes,
      etag: uploadResult.ETag?.replace(/"/g, ''),
    };

    await this.s3Service.putJson(
      BcgwExportService.manifestKey(layer.name),
      manifest,
    );

    this.logger.log(
      `Exported ${layer.name} - ${manifest.feature_count} features, ` +
        `${bytes} bytes gzipped, ${Date.now() - startedAt}ms`,
    );

    return manifest;
  }
}
