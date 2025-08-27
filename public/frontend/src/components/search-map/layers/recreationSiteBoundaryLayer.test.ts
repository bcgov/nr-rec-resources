import { describe, it, expect } from 'vitest';
import Feature from 'ol/Feature';
import VectorSource from 'ol/source/Vector';
import VectorLayer from 'ol/layer/Vector';
import Style from 'ol/style/Style';
import {
  createRecreationSiteBoundaryStyle,
  createRecreationSiteBoundarySource,
  createRecreationSiteBoundaryLayer,
} from '@/components/search-map/layers/recreationSiteBoundaryLayer';
import { RECREATION_SITE_BOUNDARY_LAYER } from '@/components/search-map/constants';

describe('createRecreationSiteBoundaryStyle', () => {
  it('returns a Style with correct stroke defaults', () => {
    const feature = new Feature({});
    const style: any = createRecreationSiteBoundaryStyle(feature);
    expect(style).toBeDefined();
    const stroke = style.getStroke();
    expect(stroke).toBeDefined();
    expect(stroke.getColor()).toBe('rgba(45,128,32,0.6)');
    expect(stroke.getWidth()).toBe(2);
  });

  it('applies hover stroke width and color', () => {
    const feature = new Feature({});
    const style: any = createRecreationSiteBoundaryStyle(feature, true);
    const stroke = style.getStroke();
    expect(stroke.getColor()).toBe('rgba(255,0,255,1)');
    expect(stroke.getWidth()).toBe(3);
  });

  it('returns a Style with correct fill', () => {
    const feature = new Feature({});
    const style: any = createRecreationSiteBoundaryStyle(feature);
    const fill = style.getFill();
    expect(fill).toBeDefined();
    expect(fill.getColor()).toBe('rgba(45,128,32,0.1)');
  });

  it('maintains consistent fill color regardless of hover state', () => {
    const feature = new Feature({});
    const styleDefault: any = createRecreationSiteBoundaryStyle(feature, false);
    const styleHovered: any = createRecreationSiteBoundaryStyle(feature, true);

    expect(styleDefault.getFill().getColor()).toBe('rgba(45,128,32,0.1)');
    expect(styleHovered.getFill().getColor()).toBe('rgba(45,128,32,0.1)');
  });
});

describe('createRecreationSiteBoundarySource', () => {
  it('returns a VectorSource', () => {
    const source = createRecreationSiteBoundarySource();
    expect(source).toBeInstanceOf(VectorSource);
  });

  it('configures source with correct format', () => {
    const source = createRecreationSiteBoundarySource();
    expect(source.getFormat()).toBeDefined();
  });

  it('configures source with bbox strategy', () => {
    const source = createRecreationSiteBoundarySource();
    expect((source as any).strategy_).toBeDefined();
  });

  it('configures source with wrapX disabled', () => {
    const source = createRecreationSiteBoundarySource();
    expect(source.getWrapX()).toBe(false);
  });

  it('generates correct URL with extent parameters', () => {
    const source = createRecreationSiteBoundarySource();
    const urlFunction = source.getUrl();
    expect(typeof urlFunction).toBe('function');

    const mockExtent = [1000, 2000, 3000, 4000];
    const url = (urlFunction as any)(mockExtent);

    expect(url).toContain(RECREATION_SITE_BOUNDARY_LAYER);
    expect(url).toContain('f=json');
    expect(url).toContain('outFields=OBJECTID');
    expect(url).toContain('geometry=1000,2000,3000,4000');
    expect(url).toContain('geometryType=esriGeometryEnvelope');
    expect(url).toContain('spatialRel=esriSpatialRelIntersects');
    expect(url).toContain('inSR=102100');
    expect(url).toContain('outSR=102100');
    expect(url).toContain("where=LIFE_CYCLE_STATUS_CODE='ACTIVE'");
  });
});

describe('createRecreationSiteBoundaryLayer', () => {
  it('returns a VectorLayer with provided source', () => {
    const source = createRecreationSiteBoundarySource();
    const layer = createRecreationSiteBoundaryLayer(source);
    expect(layer).toBeInstanceOf(VectorLayer);
    expect(layer.getSource()).toBe(source);
  });

  it('configures layer with resolution-based style function', () => {
    const source = createRecreationSiteBoundarySource();
    const layer = createRecreationSiteBoundaryLayer(source);

    const styleFn = layer.getStyleFunction();
    expect(typeof styleFn).toBe('function');
  });

  it('returns undefined style at high resolution (zoomed out)', () => {
    const source = createRecreationSiteBoundarySource();
    const layer = createRecreationSiteBoundaryLayer(source);

    const styleFn = layer.getStyleFunction();
    const feature = new Feature({});

    const styleHidden = styleFn && styleFn(feature as any, 500);
    expect(styleHidden).toBeUndefined();

    const styleHiddenMore = styleFn && styleFn(feature as any, 600);
    expect(styleHiddenMore).toBeUndefined();
  });

  it('returns style at low resolution (zoomed in)', () => {
    const source = createRecreationSiteBoundarySource();
    const layer = createRecreationSiteBoundaryLayer(source);

    const styleFn = layer.getStyleFunction();
    const feature = new Feature({});

    const styleShown = styleFn && styleFn(feature as any, 400);
    expect(styleShown instanceof Style || Array.isArray(styleShown)).toBe(true);

    const styleShownMore = styleFn && styleFn(feature as any, 100);
    expect(
      styleShownMore instanceof Style || Array.isArray(styleShownMore),
    ).toBe(true);
  });
});
