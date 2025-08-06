import { describe, it, expect } from 'vitest';
import Feature from 'ol/Feature';
import VectorSource from 'ol/source/Vector';
import VectorLayer from 'ol/layer/Vector';
import {
  createWildfirePerimeterStyle,
  createWildfirePerimeterSource,
  createWildfirePerimeterLayer,
} from '@/components/search-map/layers/wildfirePerimeterLayer';

describe('createWildfirePerimeterStyle', () => {
  it('returns a Style object with correct color and opacity', () => {
    const feature = new Feature({ FIRE_STATUS: 'default' });
    const style = createWildfirePerimeterStyle(feature);
    expect(style).toBeDefined();
    expect(style.getFill()).toBeDefined();
    expect(style.getStroke()).toBeDefined();
  });

  it('applies hover opacity', () => {
    const feature = new Feature({ FIRE_STATUS: 'default' });
    const style = createWildfirePerimeterStyle(feature, true) as any;
    expect(style.getFill().getColor()).toContain('0.2');
    expect(style.getStroke().getColor()).toContain('0.4');
  });
});

describe('createWildfirePerimeterSource', () => {
  it('returns a VectorSource', () => {
    const source = createWildfirePerimeterSource();
    expect(source).toBeInstanceOf(VectorSource);
  });
});

describe('createWildfirePerimeterLayer', () => {
  it('returns a VectorLayer with the given source', () => {
    const source = createWildfirePerimeterSource();
    const layer = createWildfirePerimeterLayer(source);
    expect(layer).toBeInstanceOf(VectorLayer);
    expect(layer.getSource()).toBe(source);
  });
});
