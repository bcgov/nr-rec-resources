import { describe, it, expect } from 'vitest';
import Feature from 'ol/Feature';
import VectorSource from 'ol/source/Vector';
import VectorLayer from 'ol/layer/Vector';
import {
  createFireEvacuationStyle,
  createFireEvacuationSource,
  createFireEvacuationLayer,
} from '@/components/search-map/layers/fireEvacuationLayer';

describe('createFireEvacuationStyle', () => {
  it('returns a Style object with fill and stroke', () => {
    const feature = new Feature({ ORDER_ALERT_STATUS: 'Order' });
    const style = createFireEvacuationStyle(feature);
    expect(style).toBeDefined();
    expect(style.getFill()).toBeDefined();
    expect(style.getStroke()).toBeDefined();
  });

  it('uses red colour for Order status', () => {
    const feature = new Feature({ ORDER_ALERT_STATUS: 'Order' });
    const style = createFireEvacuationStyle(feature);
    expect(style.getStroke()!.getColor()).toContain('180, 30, 20');
  });

  it('uses amber colour for Alert status', () => {
    const feature = new Feature({ ORDER_ALERT_STATUS: 'Alert' });
    const style = createFireEvacuationStyle(feature);
    expect(style.getStroke()!.getColor()).toContain('180, 110, 0');
  });

  it('applies higher fill opacity on hover', () => {
    const feature = new Feature({ ORDER_ALERT_STATUS: 'Order' });
    const style = createFireEvacuationStyle(feature, true);
    expect(style.getFill()!.getColor()).toContain('0.7');
  });

  it('applies default fill opacity when not hovered', () => {
    const feature = new Feature({ ORDER_ALERT_STATUS: 'Order' });
    const style = createFireEvacuationStyle(feature, false);
    expect(style.getFill()!.getColor()).toContain('0.5');
  });

  it('uses wider stroke on hover', () => {
    const feature = new Feature({ ORDER_ALERT_STATUS: 'Order' });
    const hovered = createFireEvacuationStyle(feature, true);
    const normal = createFireEvacuationStyle(feature, false);
    expect(hovered.getStroke()!.getWidth()).toBeGreaterThan(
      normal.getStroke()!.getWidth()!,
    );
  });
});

describe('createFireEvacuationSource', () => {
  it('returns a VectorSource', () => {
    const source = createFireEvacuationSource();
    expect(source).toBeInstanceOf(VectorSource);
  });
});

describe('createFireEvacuationLayer', () => {
  it('returns a VectorLayer with the given source', () => {
    const source = createFireEvacuationSource();
    const layer = createFireEvacuationLayer(source);
    expect(layer).toBeInstanceOf(VectorLayer);
    expect(layer.getSource()).toBe(source);
  });
});

describe('createFireEvacuationStyle - additional statuses', () => {
  it('uses brown/orange colour for Tactical Evacuation status', () => {
    const feature = new Feature({ ORDER_ALERT_STATUS: 'Tactical Evacuation' });
    const style = createFireEvacuationStyle(feature);
    expect(style.getStroke()!.getColor()).toContain('140, 80, 20');
  });

  it('falls back to default (Order) colour for unknown status', () => {
    const feature = new Feature({ ORDER_ALERT_STATUS: 'Unknown' });
    const style = createFireEvacuationStyle(feature);
    expect(style.getStroke()!.getColor()).toContain('180, 30, 20');
  });

  it('falls back to default when ORDER_ALERT_STATUS is missing', () => {
    const feature = new Feature({});
    const style = createFireEvacuationStyle(feature);
    expect(style.getStroke()!.getColor()).toContain('180, 30, 20');
  });
});

describe('createFireEvacuationSource URL builder', () => {
  it('builds a URL containing geometry and required params', () => {
    const source = createFireEvacuationSource();
    const urlFn = (source as any).url_;
    const url: string = urlFn([1, 2, 3, 4]);
    expect(url).toContain('f=json');
    expect(url).toContain('geometry=1,2,3,4');
    expect(url).toContain('outFields=');
    expect(url).toContain('esriGeometryEnvelope');
  });
});
