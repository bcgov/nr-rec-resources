import { describe, expect, it } from 'vitest';
import { getLayerStyle } from './helpers';
import { Style } from 'ol/style';
import Feature from 'ol/Feature';
import LineString from 'ol/geom/LineString';
import Polygon from 'ol/geom/Polygon';
import {
  FILL_COLOR,
  STROKE_COLOR,
} from '@/components/rec-resource/RecreationResourceMap/constants';

describe('helpers', () => {
  describe('getLayerStyle', () => {
    it('creates correct style for LineString feature', () => {
      const lineFeature = new Feature({
        geometry: new LineString([
          [0, 0],
          [1, 1],
        ]),
      });
      const styleFunc = getLayerStyle('Test Label');
      const style = styleFunc(lineFeature, 1) as Style;

      expect(style).toBeInstanceOf(Style);
      expect(style.getStroke()?.getColor()).toBe(STROKE_COLOR);
      expect(style.getStroke()?.getWidth()).toBe(3);
      expect(style.getStroke()?.getLineDash()).toEqual([6, 6]);
      expect(style.getFill())?.toBeNull();
      expect(style.getText()?.getText()).toBe('Test Label');
      expect(style.getText()?.getPlacement()).toBe('line');
    });

    it('creates correct style for Polygon feature', () => {
      const polygonFeature = new Feature({
        geometry: new Polygon([
          [
            [0, 0],
            [1, 1],
            [1, 0],
            [0, 0],
          ],
        ]),
      });
      const styleFunc = getLayerStyle('Test Label');
      const style = styleFunc(polygonFeature, 1) as Style;

      expect(style).toBeInstanceOf(Style);
      expect(style.getFill()).toBeDefined();
      expect(style.getFill()?.getColor()).toBe(FILL_COLOR);
      expect(style.getText()?.getPlacement()).toBe('point');
      expect(style.getText()?.getTextBaseline()).toBe('middle');
    });
  });
});
