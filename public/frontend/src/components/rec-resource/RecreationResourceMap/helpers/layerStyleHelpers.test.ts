import { describe, expect, it, vi } from 'vitest';
import { Fill, Icon, Stroke, Text } from 'ol/style';
import {
  MAP_STYLES,
  TEXT_STYLE,
} from '@/components/rec-resource/RecreationResourceMap/constants';
import {
  createFillStyle,
  createImageStyle,
  createStrokeStyle,
  createTextStyle,
} from './layerStyleHelpers';

vi.mock('ol/style');

describe('Map Style Functions', () => {
  describe('createImageStyle', () => {
    it('returns Icon when isPoint is true', () => {
      const style = createImageStyle(true);
      expect(Icon).toHaveBeenCalled();
      expect(style).toBeInstanceOf(Icon);
    });

    it('returns undefined when isPoint is false', () => {
      const style = createImageStyle(false);
      expect(style).toBeUndefined();
    });
  });

  describe('createStrokeStyle', () => {
    it('creates Stroke with lineDash for line type', () => {
      const style = createStrokeStyle(true);
      expect(Stroke).toHaveBeenCalledWith({
        color: MAP_STYLES.STROKE.COLOR,
        width: MAP_STYLES.STROKE.WIDTH,
        lineDash: MAP_STYLES.STROKE.LINE_DASH,
      });
      expect(style).toBeInstanceOf(Stroke);
    });

    it('creates Stroke without lineDash for non-line type', () => {
      const style = createStrokeStyle(false);
      expect(Stroke).toHaveBeenCalledWith({
        color: MAP_STYLES.STROKE.COLOR,
        width: MAP_STYLES.STROKE.WIDTH,
        lineDash: [],
      });
      expect(style).toBeInstanceOf(Stroke);
    });
  });

  describe('createFillStyle', () => {
    it('returns Fill when isPolygonType is true', () => {
      const style = createFillStyle(true);
      expect(Fill).toHaveBeenCalledWith({ color: MAP_STYLES.FILL.COLOR });
      expect(style).toBeInstanceOf(Fill);
    });

    it('returns undefined when isPolygonType is false', () => {
      const style = createFillStyle(false);
      expect(style).toBeUndefined();
    });
  });

  describe('createTextStyle', () => {
    it('creates Text style for line type', () => {
      const style = createTextStyle('Test Label', true, false);
      expect(Text).toHaveBeenCalledWith({
        text: 'Test Label',
        placement: 'line',
        fill: TEXT_STYLE.fill,
        stroke: TEXT_STYLE.stroke,
        textBaseline: 'middle',
        offsetY: 0,
        textAlign: 'center',
        repeat: 300,
        padding: [2, 5, 2, 5],
        rotateWithView: true,
        declutterMode: 'declutter',
        scale: 1.3,
      });
      expect(style).toBeInstanceOf(Text);
    });

    it('creates Text style for point type', () => {
      const style = createTextStyle('Test Label', false, true);
      expect(Text).toHaveBeenCalledWith({
        text: 'Test Label',
        placement: 'point',
        fill: TEXT_STYLE.fill,
        stroke: TEXT_STYLE.stroke,
        textBaseline: 'bottom',
        offsetY: -20,
        textAlign: 'center',
        repeat: undefined,
        padding: [2, 5, 2, 5],
        rotateWithView: false,
        declutterMode: 'declutter',
        scale: 1.3,
      });
      expect(style).toBeInstanceOf(Text);
    });
  });
});
