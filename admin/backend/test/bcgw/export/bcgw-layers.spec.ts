import { describe, it, expect } from 'vitest';
import { BCGW_LAYERS, BCGW_LAYER_NAMES } from '@/bcgw/export/bcgw-layers';

describe('BCGW_LAYERS', () => {
  it('defines the four layers BCGW ingests, in a stable order', () => {
    expect(BCGW_LAYER_NAMES).toEqual([
      'closures-fully-attributed',
      'closures-short',
      'recreation-lines',
      'recreation-polygons',
    ]);
  });

  it('gives every layer a distinct name, since the name is the S3 key', () => {
    expect(new Set(BCGW_LAYER_NAMES).size).toBe(BCGW_LAYERS.length);
  });

  it.each(BCGW_LAYERS.map((layer) => [layer.name, layer] as const))(
    '%s reads a bcgw view, selects geometry and orders deterministically',
    (_name, layer) => {
      expect(layer.query).toMatch(/FROM\s+bcgw\.\w+/i);
      expect(layer.query).toMatch(/\bgeometry\b/);
      // Without a deterministic sort the exported file churns between runs even
      // when nothing changed, which defeats etag comparison on the BCGW side.
      expect(layer.query).toMatch(/ORDER BY\s+\w+\s+ASC/i);
    },
  );

  it.each(BCGW_LAYERS.map((layer) => [layer.name, layer] as const))(
    '%s exposes rec_resource names rather than legacy FTA aliases',
    (_name, layer) => {
      expect(layer.query).toContain('rec_resource_id');
      expect(layer.query).not.toMatch(/\bAS\s+forest_file_id\b/i);
      expect(layer.query).not.toMatch(/\bAS\s+project_name\b/i);
      expect(layer.query).not.toMatch(/\bAS\s+project_type\b/i);
    },
  );
});
