import { describe, it, expect } from 'vitest';
import Feature from 'ol/Feature';
import VectorSource from 'ol/source/Vector';
import Style from 'ol/style/Style';
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

  it('applies hover stroke width and color', () => {
    const feature = new Feature({});
    const style: any = createRecreationLineStyle(feature, true);
    const stroke = style.getStroke();
    expect(stroke.getColor()).toBe('rgba(255, 0, 255, 1)');
    expect(stroke.getWidth()).toBe(4);
  });
});

describe('createRecreationLinesSource', () => {
  it('returns a VectorSource', () => {
    const source = createRecreationLinesSource();
    expect(source).toBeInstanceOf(VectorSource);
  });
});

describe('createRecreationLinesLayer', () => {
  it('returns a VectorLayer with provided source and resolution-based style', () => {
    const source = createRecreationLinesSource();
    const layer = createRecreationLinesLayer(source);
    expect(layer.getSource()).toBe(source);

    const styleFn = layer.getStyleFunction();
    expect(typeof styleFn).toBe('function');

    const feature = new Feature({});
    const styleHidden = styleFn && styleFn(feature as any, 600);
    expect(styleHidden).toBeUndefined();

    const styleShown = styleFn && styleFn(feature as any, 400);
    expect(styleShown instanceof Style || Array.isArray(styleShown)).toBe(true);
  });
});
