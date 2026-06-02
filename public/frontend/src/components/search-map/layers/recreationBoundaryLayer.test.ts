import { describe, it, expect } from 'vitest';
import VectorSource from 'ol/source/Vector';
import VectorLayer from 'ol/layer/Vector';
import {
  createRecreationBoundaryStyle,
  createRecreationBoundarySource,
  createRecreationBoundaryLayer,
} from './recreationBoundaryLayer';

describe('createRecreationBoundaryStyle', () => {
  it('returns a Style with a stroke and fill', () => {
    const style = createRecreationBoundaryStyle();
    expect(style.getStroke()).toBeDefined();
    expect(style.getFill()).toBeDefined();
  });

  it('stroke has the correct color', () => {
    const style = createRecreationBoundaryStyle();
    expect(style.getStroke().getColor()).toBe('#42814A');
  });

  it('stroke has width 3', () => {
    const style = createRecreationBoundaryStyle();
    expect(style.getStroke().getWidth()).toBe(3);
  });

  it('fill has the correct semi-transparent color', () => {
    const style = createRecreationBoundaryStyle();
    expect(style.getFill().getColor()).toBe('#42814A66');
  });
});

describe('createRecreationBoundarySource', () => {
  // Geometry is loaded incrementally by useViewportIdFetch, so the factory just
  // returns an empty source — no loader, no fetch.
  it('returns an empty VectorSource', () => {
    const source = createRecreationBoundarySource();
    expect(source).toBeInstanceOf(VectorSource);
    expect(source.getFeatures()).toHaveLength(0);
  });
});

describe('createRecreationBoundaryLayer', () => {
  it('returns a VectorLayer', () => {
    const source = new VectorSource();
    const layer = createRecreationBoundaryLayer(source);
    expect(layer).toBeInstanceOf(VectorLayer);
  });

  it('uses the provided source', () => {
    const source = new VectorSource();
    const layer = createRecreationBoundaryLayer(source);
    expect(layer.getSource()).toBe(source);
  });
});
