import { describe, it, expect } from 'vitest';
import VectorSource from 'ol/source/Vector';
import VectorLayer from 'ol/layer/Vector';
import {
  createRecreationTrailStyle,
  createRecreationTrailSource,
  createRecreationTrailLayer,
} from './recreationTrailLayer';

describe('createRecreationTrailStyle', () => {
  it('returns a Style with a stroke', () => {
    const style = createRecreationTrailStyle();
    expect(style.getStroke()).toBeDefined();
  });

  it('has no fill', () => {
    const style = createRecreationTrailStyle();
    expect(style.getFill()).toBeNull();
  });

  it('stroke has the correct color', () => {
    const style = createRecreationTrailStyle();
    expect(style.getStroke().getColor()).toBe('#42814A');
  });

  it('stroke has width 3', () => {
    const style = createRecreationTrailStyle();
    expect(style.getStroke().getWidth()).toBe(3);
  });

  it('stroke is dashed', () => {
    const style = createRecreationTrailStyle();
    expect(style.getStroke().getLineDash()).toEqual([6, 6]);
  });
});

describe('createRecreationTrailSource', () => {
  // Geometry is loaded incrementally by useViewportIdFetch, so the factory just
  // returns an empty source — no loader, no fetch.
  it('returns an empty VectorSource', () => {
    const source = createRecreationTrailSource();
    expect(source).toBeInstanceOf(VectorSource);
    expect(source.getFeatures()).toHaveLength(0);
  });
});

describe('createRecreationTrailLayer', () => {
  it('returns a VectorLayer', () => {
    const source = new VectorSource();
    const layer = createRecreationTrailLayer(source);
    expect(layer).toBeInstanceOf(VectorLayer);
  });

  it('uses the provided source', () => {
    const source = new VectorSource();
    const layer = createRecreationTrailLayer(source);
    expect(layer.getSource()).toBe(source);
  });
});
