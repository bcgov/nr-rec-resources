import { describe, it, expect } from 'vitest';
import Feature from 'ol/Feature';
import VectorSource from 'ol/source/Vector';
import VectorLayer from 'ol/layer/Vector';
import {
  createWildfireAreaRestrictionStyle,
  createWildfireAreaRestrictionSource,
  createWildfireAreaRestrictionLayer,
} from '@/components/search-map/layers/wildfireAreaRestrictionLayer';

describe('createWildfireAreaRestrictionStyle', () => {
  it('returns a Style object with fill and stroke', () => {
    const feature = new Feature();
    const style = createWildfireAreaRestrictionStyle(feature);
    expect(style).toBeDefined();
    expect(style.getFill()).toBeDefined();
    expect(style.getStroke()).toBeDefined();
  });

  it('uses a dark stroke colour', () => {
    const feature = new Feature();
    const style = createWildfireAreaRestrictionStyle(feature);
    // stroke uses black with opacity
    expect(String(style.getStroke()!.getColor())).toContain('rgba(0,0,0');
  });

  it('applies higher stroke opacity on hover', () => {
    const feature = new Feature();
    const style = createWildfireAreaRestrictionStyle(feature, true);
    expect(String(style.getStroke()!.getColor())).toContain('0.8');
  });

  it('applies default stroke opacity when not hovered', () => {
    const feature = new Feature();
    const style = createWildfireAreaRestrictionStyle(feature, false);
    expect(String(style.getStroke()!.getColor())).toContain('0.6');
  });
});

describe('createWildfireAreaRestrictionSource', () => {
  it('returns a VectorSource', () => {
    const source = createWildfireAreaRestrictionSource();
    expect(source).toBeInstanceOf(VectorSource);
  });
});

describe('createWildfireAreaRestrictionLayer', () => {
  it('returns a VectorLayer with the given source', () => {
    const source = createWildfireAreaRestrictionSource();
    const layer = createWildfireAreaRestrictionLayer(source);
    expect(layer).toBeInstanceOf(VectorLayer);
    expect(layer.getSource()).toBe(source);
  });
});

describe('createWildfireAreaRestrictionStyle – additional cases', () => {
  it('returns a Style with fill even when canvas context is unavailable', () => {
    // Simulate a null canvas context
    const origCreate = document.createElement.bind(document);
    vi.spyOn(document, 'createElement').mockImplementation((tag: string) => {
      if (tag === 'canvas') {
        const c = origCreate(tag) as HTMLCanvasElement;
        c.getContext = () => null;
        return c;
      }
      return origCreate(tag);
    });

    const feature = new Feature();
    const style = createWildfireAreaRestrictionStyle(feature);
    expect(style).toBeDefined();
    // Falls back to rgba fill when pattern is null
    expect(style.getFill()).toBeDefined();
    vi.restoreAllMocks();
  });

  it('applies heavier stroke width on hover', () => {
    const feature = new Feature();
    const hovered = createWildfireAreaRestrictionStyle(feature, true);
    const normal = createWildfireAreaRestrictionStyle(feature, false);
    expect(hovered.getStroke()!.getWidth()!).toBeGreaterThan(
      normal.getStroke()!.getWidth()!,
    );
  });
});

describe('createWildfireAreaRestrictionSource URL builder', () => {
  it('builds a URL containing geometry and required params', () => {
    const source = createWildfireAreaRestrictionSource();
    const urlFn = (source as any).url_;
    const url: string = urlFn([1, 2, 3, 4]);
    expect(url).toContain('f=json');
    expect(url).toContain('geometry=1,2,3,4');
    expect(url).toContain('outFields=');
    expect(url).toContain('esriGeometryEnvelope');
  });
});
