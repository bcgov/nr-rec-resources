import { Transform, TransformCallback } from 'node:stream';

/**
 * Wraps a stream of database rows into a GeoJSON FeatureCollection, one feature
 * at a time, so a layer of any size can be serialized in constant memory.
 *
 * The `geometry` column already holds GeoJSON text from ST_AsGeoJSON, so it is
 * concatenated straight into the output rather than parsed and re-encoded. That
 * round trip was the main cost of building these responses inline.
 */
export class GeoJsonFeatureCollectionStream extends Transform {
  private featureCount = 0;

  constructor() {
    super({ writableObjectMode: true, readableObjectMode: false });
  }

  /** Number of features written so far. Final once the stream has ended. */
  get count(): number {
    return this.featureCount;
  }

  override _transform(
    row: Record<string, unknown>,
    _encoding: BufferEncoding,
    callback: TransformCallback,
  ): void {
    try {
      const { geometry, ...properties } = row;

      const prefix =
        this.featureCount === 0
          ? '{"type":"FeatureCollection","features":['
          : ',';

      this.push(
        `${prefix}{"type":"Feature","geometry":${
          typeof geometry === 'string' && geometry.length > 0
            ? geometry
            : 'null'
        },"properties":${JSON.stringify(properties)}}`,
      );

      this.featureCount += 1;
      callback();
    } catch (error) {
      callback(error as Error);
    }
  }

  override _flush(callback: TransformCallback): void {
    // An empty result set never emitted the opening brace, so write the whole
    // envelope here.
    this.push(
      this.featureCount === 0
        ? '{"type":"FeatureCollection","features":[]}'
        : ']}',
    );
    callback();
  }
}
