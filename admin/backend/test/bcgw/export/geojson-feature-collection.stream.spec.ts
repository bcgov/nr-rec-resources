import { describe, it, expect } from 'vitest';
import { Readable, Writable } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import { GeoJsonFeatureCollectionStream } from '@/bcgw/export/geojson-feature-collection.stream';

/** Runs rows through the transform and returns the serialized output. */
async function serialize(
  rows: Record<string, unknown>[],
): Promise<{ json: string; count: number }> {
  const stream = new GeoJsonFeatureCollectionStream();
  const chunks: string[] = [];

  const collect = new Writable({
    write(chunk: Buffer, _encoding, callback) {
      chunks.push(String(chunk));
      callback();
    },
  });

  await pipeline(Readable.from(rows), stream, collect);

  return { json: chunks.join(''), count: stream.count };
}

describe('GeoJsonFeatureCollectionStream', () => {
  it('emits a valid empty FeatureCollection for no rows', async () => {
    const { json, count } = await serialize([]);

    expect(JSON.parse(json)).toEqual({
      type: 'FeatureCollection',
      features: [],
    });
    expect(count).toBe(0);
  });

  it('emits a single feature with geometry spliced in as text', async () => {
    const { json, count } = await serialize([
      {
        rec_resource_id: 'REC4531',
        defined_campsites: 5,
        geometry: '{"type":"Point","coordinates":[-123.4,54.1]}',
      },
    ]);

    expect(JSON.parse(json)).toEqual({
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          geometry: { type: 'Point', coordinates: [-123.4, 54.1] },
          properties: { rec_resource_id: 'REC4531', defined_campsites: 5 },
        },
      ],
    });
    expect(count).toBe(1);
  });

  it('separates multiple features with commas', async () => {
    const { json, count } = await serialize([
      {
        rec_resource_id: 'A',
        geometry: '{"type":"Point","coordinates":[0,0]}',
      },
      {
        rec_resource_id: 'B',
        geometry: '{"type":"Point","coordinates":[1,1]}',
      },
      {
        rec_resource_id: 'C',
        geometry: '{"type":"Point","coordinates":[2,2]}',
      },
    ]);

    const parsed = JSON.parse(json);
    expect(parsed.features).toHaveLength(3);
    expect(
      parsed.features.map((f: any) => f.properties.rec_resource_id),
    ).toEqual(['A', 'B', 'C']);
    expect(count).toBe(3);
  });

  it('emits null geometry when the column is null or empty', async () => {
    const { json } = await serialize([
      { rec_resource_id: 'A', geometry: null },
      { rec_resource_id: 'B', geometry: '' },
    ]);

    const parsed = JSON.parse(json);
    expect(parsed.features[0].geometry).toBeNull();
    expect(parsed.features[1].geometry).toBeNull();
  });

  it('keeps the geometry column out of properties', async () => {
    const { json } = await serialize([
      {
        rec_resource_id: 'A',
        geometry: '{"type":"Point","coordinates":[0,0]}',
      },
    ]);

    expect(JSON.parse(json).features[0].properties).not.toHaveProperty(
      'geometry',
    );
  });
});
