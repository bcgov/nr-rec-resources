import { describe, expect, it, vi } from 'vitest';
import { Fill, Icon, Stroke, Text } from 'ol/style';
import {
  MAP_ICONS,
  MAP_STYLES,
  TEXT_STYLE,
} from '@/components/rec-resource/RecreationResourceMap/constants';
import { RecreationResourceDetailModel } from '@/service/custom-models';
import {
  createFillStyle,
  createImageStyle,
  createStrokeStyle,
  createTextStyle,
  getRecResourceIcon,
} from '@/components/rec-resource/RecreationResourceMap/helpers/layerStyleHelpers';
import * as recreationResourceUtils from '@/utils/recreationResourceUtils';

vi.mock('ol/style');
vi.mock('@/utils/recreationResourceUtils', () => ({
  isInterpretiveForest: vi.fn(),
  isRecreationSite: vi.fn(),
  isRecreationTrail: vi.fn(),
}));

describe('Map Style Functions', () => {
  const mockRecResource = {
    resourceType: 'site',
  } as unknown as RecreationResourceDetailModel;

  describe('createImageStyle', () => {
    it('returns Icon when isPoint is true', () => {
      (
        recreationResourceUtils.isRecreationTrail as ReturnType<any>
      ).mockReturnValue(false);
      (
        recreationResourceUtils.isRecreationSite as ReturnType<any>
      ).mockReturnValue(false);
      (
        recreationResourceUtils.isInterpretiveForest as ReturnType<any>
      ).mockReturnValue(false);
      createImageStyle(true, mockRecResource);
      expect(Icon).toHaveBeenCalled();
      expect(Icon).toHaveBeenCalledWith(
        expect.objectContaining({
          scale: 0.3,
        }),
      );
    });

    it('returns undefined when isPoint is false', () => {
      const style = createImageStyle(false, mockRecResource);
      expect(style).toBeUndefined();
    });
  });

  describe('createStrokeStyle', () => {
    it('creates Stroke with lineDash for line type', () => {
      createStrokeStyle(true);
      expect(Stroke).toHaveBeenCalledWith({
        color: MAP_STYLES.STROKE.TRAIL_COLOR,
        width: MAP_STYLES.STROKE.WIDTH,
        lineDash: MAP_STYLES.STROKE.LINE_DASH,
      });
    });

    it('creates Stroke without lineDash for non-line type', () => {
      createStrokeStyle(false);
      expect(Stroke).toHaveBeenCalledWith({
        color: MAP_STYLES.STROKE.POLYGON_COLOR,
        width: MAP_STYLES.STROKE.WIDTH,
        lineDash: [],
      });
    });
  });

  describe('createFillStyle', () => {
    it('returns Fill when isPolygonType is true', () => {
      createFillStyle(true);
      expect(Fill).toHaveBeenCalledWith({ color: MAP_STYLES.FILL.COLOR });
    });

    it('returns undefined when isPolygonType is false', () => {
      const style = createFillStyle(false);
      expect(style).toBeUndefined();
    });
  });

  describe('createTextStyle', () => {
    it('creates Text style for line type', () => {
      createTextStyle('Test Label', true, false);
      expect(Text).toHaveBeenCalledWith({
        text: 'Test Label',
        placement: 'line',
        fill: TEXT_STYLE.fill,
        backgroundFill: TEXT_STYLE.backgroundFill,
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
    });

    it('creates Text style for point type', () => {
      createTextStyle('Test Label', false, true);
      expect(Text).toHaveBeenCalledWith({
        text: 'Test Label',
        placement: 'point',
        fill: TEXT_STYLE.fill,
        backgroundFill: TEXT_STYLE.backgroundFill,
        stroke: TEXT_STYLE.stroke,
        textBaseline: 'bottom',
        offsetY: -25,
        textAlign: 'center',
        repeat: undefined,
        padding: [2, 5, 2, 5],
        rotateWithView: false,
        declutterMode: 'declutter',
        scale: 1.3,
      });
    });

    it('creates Text style for point type for trail', () => {
      createTextStyle('Test Label', false, true);
      expect(Text).toHaveBeenCalledWith({
        text: 'Test Label',
        placement: 'point',
        fill: TEXT_STYLE.fill,
        backgroundFill: TEXT_STYLE.backgroundFill,
        stroke: TEXT_STYLE.stroke,
        textBaseline: 'bottom',
        offsetY: -25,
        textAlign: 'center',
        repeat: undefined,
        padding: [2, 5, 2, 5],
        rotateWithView: false,
        declutterMode: 'declutter',
        scale: 1.3,
      });
    });
  });

  describe('getRecResourceIcon', () => {
    it('returns RECREATION_TRAIL_HEAD icon for recreation trail', () => {
      (
        recreationResourceUtils.isRecreationTrail as ReturnType<any>
      ).mockReturnValue(true);
      (
        recreationResourceUtils.isRecreationSite as ReturnType<any>
      ).mockReturnValue(false);
      (
        recreationResourceUtils.isInterpretiveForest as ReturnType<any>
      ).mockReturnValue(false);
      const icon = getRecResourceIcon(mockRecResource);
      expect(icon).toBe(MAP_ICONS.RECREATION_TRAIL_HEAD);
    });

    it('returns RECREATION_SITE icon for recreation site', () => {
      (
        recreationResourceUtils.isRecreationTrail as ReturnType<any>
      ).mockReturnValue(false);
      (
        recreationResourceUtils.isRecreationSite as ReturnType<any>
      ).mockReturnValue(true);
      (
        recreationResourceUtils.isInterpretiveForest as ReturnType<any>
      ).mockReturnValue(false);
      const icon = getRecResourceIcon(mockRecResource);
      expect(icon).toBe(MAP_ICONS.RECREATION_SITE);
    });

    it('returns INTERPRETIVE_FOREST icon for interpretive forest', () => {
      (
        recreationResourceUtils.isRecreationTrail as ReturnType<any>
      ).mockReturnValue(false);
      (
        recreationResourceUtils.isRecreationSite as ReturnType<any>
      ).mockReturnValue(false);
      (
        recreationResourceUtils.isInterpretiveForest as ReturnType<any>
      ).mockReturnValue(true);
      const icon = getRecResourceIcon(mockRecResource);
      expect(icon).toBe(MAP_ICONS.INTERPRETIVE_FOREST);
    });

    it('returns LOCATION_DOT_BLUE icon for unknown type', () => {
      (
        recreationResourceUtils.isRecreationTrail as ReturnType<any>
      ).mockReturnValue(false);
      (
        recreationResourceUtils.isRecreationSite as ReturnType<any>
      ).mockReturnValue(false);
      (
        recreationResourceUtils.isInterpretiveForest as ReturnType<any>
      ).mockReturnValue(false);
      const icon = getRecResourceIcon(mockRecResource);
      expect(icon).toBe(MAP_ICONS.LOCATION_DOT_BLUE);
    });
  });
});
