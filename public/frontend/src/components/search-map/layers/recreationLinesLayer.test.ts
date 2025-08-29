import { describe, it, expect } from 'vitest';
import Feature from 'ol/Feature';
import VectorSource from 'ol/source/Vector';
import {
  createRecreationLineStyle,
  createRecreationLinesSource,
  createRecreationLinesLayer,
} from '@/components/search-map/layers/recreationLinesLayer';

describe('createRecreationLineStyle', () => {
  it('returns a Style with correct stroke defaults', () => {
    const feature = new Feature({});
    const style: any = createRecreationLineStyle(feature);
    expect(style).toBeDefined();
    const stroke = style.getStroke();
    expect(stroke).toBeDefined();
    expect(stroke.getColor()).toBe('#7BC371');
    expect(stroke.getWidth()).toBe(2);
    expect(stroke.getLineDash()).toEqual([10, 5]);
  });

  it('returns a Style with correct stroke when hovered', () => {
    const feature = new Feature({});
    const style: any = createRecreationLineStyle(feature, true);
    expect(style).toBeDefined();
    const stroke = style.getStroke();
    expect(stroke).toBeDefined();
    expect(stroke.getColor()).toBe('rgba(255, 0, 255, 1)');
    expect(stroke.getWidth()).toBe(2);
    expect(stroke.getLineDash()).toEqual([10, 5]);
  });
});

describe('createRecreationLinesSource', () => {
  it('returns a VectorSource', () => {
    const source = createRecreationLinesSource();
    expect(source).toBeInstanceOf(VectorSource);
  });
});

describe('createRecreationLinesLayer', () => {
  it('returns a VectorLayer with correct configuration', () => {
    const layer = createRecreationLinesLayer();
    expect(layer).toBeDefined();
    expect(layer.getSource()).toBeDefined();
    expect(layer.getStyle()).toBeDefined();
  });

  it('applies style function based on resolution', () => {
    const layer = createRecreationLinesLayer();
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
