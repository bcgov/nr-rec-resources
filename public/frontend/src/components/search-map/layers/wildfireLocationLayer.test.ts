import { describe, it, expect } from 'vitest';
import {
  createWildfireLocationStyle,
  createWildfireLocationSource,
  createWildfireLocationLayer,
} from '@/components/search-map/layers/wildfireLocationLayer';
import VectorSource from 'ol/source/Vector';
import Feature from 'ol/Feature';

describe('createWildfireLocationStyle', () => {
  it('returns a Style object with correct color', () => {
    const feature = new Feature({ FIRE_STATUS: 'default' });
    const style = createWildfireLocationStyle(feature);
    expect(style).toBeDefined();
    expect(style.getImage()).toBeDefined();
  });

  it('applies hover opacity', () => {
    const feature = new Feature({ FIRE_STATUS: 'default' });
    const style = createWildfireLocationStyle(feature, true) as any;
    expect(style.getImage().getFill().getColor()).toContain('0.5');
  });
});

describe('createWildfireLocationSource', () => {
  it('returns a VectorSource', () => {
    const source = createWildfireLocationSource();
    expect(source).toBeInstanceOf(VectorSource);
  });
});

describe('createWildfireLocationLayer', () => {
  it('returns a VectorLayer', () => {
    const source = createWildfireLocationSource();
    const layer = createWildfireLocationLayer(source);
    expect(layer.getSource()).toBe(source);
  });
});
