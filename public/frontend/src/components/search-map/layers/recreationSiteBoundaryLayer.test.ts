import { describe, it, expect } from 'vitest';
import Feature from 'ol/Feature';
import VectorSource from 'ol/source/Vector';
import {
  createRecreationSiteBoundaryStyle,
  createRecreationSiteBoundarySource,
  createRecreationSiteBoundaryLayer,
} from '@/components/search-map/layers/recreationSiteBoundaryLayer';

describe('createRecreationSiteBoundaryStyle', () => {
  it('returns a Style with correct stroke defaults', () => {
    const feature = new Feature({});
    const style: any = createRecreationSiteBoundaryStyle(feature);
    expect(style).toBeDefined();
    const stroke = style.getStroke();
    expect(stroke).toBeDefined();
    expect(stroke.getColor()).toBe('rgba(45,128,32,0.6)');
    expect(stroke.getWidth()).toBe(2);

    const fill = style.getFill();
    expect(fill).toBeDefined();
    expect(fill.getColor()).toBe('rgba(45,128,32,0.1)');
  });

  it('returns a Style with correct stroke when hovered', () => {
    const feature = new Feature({});
    const style: any = createRecreationSiteBoundaryStyle(feature, true);
    expect(style).toBeDefined();
    const stroke = style.getStroke();
    expect(stroke).toBeDefined();
    expect(stroke.getColor()).toBe('rgba(255,0,255,1)');
    expect(stroke.getWidth()).toBe(2);
  });
});

describe('createRecreationSiteBoundarySource', () => {
  it('returns a VectorSource', () => {
    const source = createRecreationSiteBoundarySource();
    expect(source).toBeInstanceOf(VectorSource);
  });
});

describe('createRecreationSiteBoundaryLayer', () => {
  it('returns a VectorLayer with correct configuration', () => {
    const layer = createRecreationSiteBoundaryLayer();
    expect(layer).toBeDefined();
    expect(layer.getSource()).toBeDefined();
    expect(layer.getStyle()).toBeDefined();
  });

  it('applies style function based on resolution', () => {
    const layer = createRecreationSiteBoundaryLayer();
    const styleFunction = layer.getStyle();
    expect(typeof styleFunction).toBe('function');

    if (typeof styleFunction === 'function') {
      const fineResolutionStyle = styleFunction(new Feature(), 100);
      expect(fineResolutionStyle).toBeDefined();

      const coarseResolutionStyle = styleFunction(new Feature(), 600);
      expect(coarseResolutionStyle).toBeDefined();
    }
  });
});
