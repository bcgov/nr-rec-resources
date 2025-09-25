import { describe, expect, it, vi } from 'vitest';
import { Fill, Icon, Stroke, Text } from 'ol/style';
import {
  MAP_ICONS,
  MAP_STYLES,
  StyleContext,
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
    it('returns Icon with scale 0.5 when isPoint is true and isForMapDisplay is true', () => {
      (
        recreationResourceUtils.isRecreationTrail as ReturnType<any>
      ).mockReturnValue(false);
      (
        recreationResourceUtils.isRecreationSite as ReturnType<any>
      ).mockReturnValue(false);
      (
        recreationResourceUtils.isInterpretiveForest as ReturnType<any>
      ).mockReturnValue(false);
      createImageStyle(true, mockRecResource, StyleContext.DOWNLOAD);
      expect(Icon).toHaveBeenCalled();
      expect(Icon).toHaveBeenCalledWith(
        expect.objectContaining({
          scale: 0.4,
        }),
      );
    });

    it('returns Icon with scale 0.3 when isPoint is true and isForMapDisplay is false (default)', () => {
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
          scale: 0.4,
        }),
      );
    });

    it('returns Icon with scale 0.3 when isPoint is true and isForMapDisplay is false (explicit)', () => {
      (
        recreationResourceUtils.isRecreationTrail as ReturnType<any>
      ).mockReturnValue(false);
      (
        recreationResourceUtils.isRecreationSite as ReturnType<any>
      ).mockReturnValue(false);
      (
        recreationResourceUtils.isInterpretiveForest as ReturnType<any>
      ).mockReturnValue(false);
      createImageStyle(true, mockRecResource, StyleContext.DOWNLOAD);
      expect(Icon).toHaveBeenCalled();
      expect(Icon).toHaveBeenCalledWith(
        expect.objectContaining({
          scale: 0.4,
        }),
      );
    });

    it('returns undefined when isPoint is false', () => {
      const style = createImageStyle(false, mockRecResource);
      expect(style).toBeUndefined();
    });
  });

  describe('createStrokeStyle', () => {
    it('creates Stroke with MAP_TRAIL_COLOR for line type when isForMapDisplay is true', () => {
      createStrokeStyle(true, StyleContext.DOWNLOAD);
      expect(Stroke).toHaveBeenCalledWith({
        color: MAP_STYLES.STROKE.DOWNLOAD.line.COLOR,
        width: MAP_STYLES.STROKE.DOWNLOAD.line.WIDTH,
        lineDash: MAP_STYLES.STROKE.DOWNLOAD.line.LINE_DASH,
      });
    });

    it('creates Stroke with KML_TRAIL_COLOR for line type when isForMapDisplay is false (default)', () => {
      createStrokeStyle(true);
      expect(Stroke).toHaveBeenCalledWith({
        color: MAP_STYLES.STROKE.DOWNLOAD.line.COLOR,
        width: MAP_STYLES.STROKE.DOWNLOAD.line.WIDTH,
        lineDash: MAP_STYLES.STROKE.DOWNLOAD.line.LINE_DASH,
      });
    });

    it('creates Stroke with KML_TRAIL_COLOR for line type when isForMapDisplay is false (explicit)', () => {
      createStrokeStyle(true, StyleContext.DOWNLOAD);
      expect(Stroke).toHaveBeenCalledWith({
        color: MAP_STYLES.STROKE.DOWNLOAD.line.COLOR,
        width: MAP_STYLES.STROKE.DOWNLOAD.line.WIDTH,
        lineDash: MAP_STYLES.STROKE.DOWNLOAD.line.LINE_DASH,
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
    it('creates Text style for line type with download styles', () => {
      createTextStyle('Test Label', true, false, StyleContext.DOWNLOAD);
      expect(Text).toHaveBeenCalledWith({
        text: 'Test Label',
        font: TEXT_STYLE[StyleContext.DOWNLOAD].font,
        fill: TEXT_STYLE[StyleContext.DOWNLOAD].fill,
        stroke: TEXT_STYLE[StyleContext.DOWNLOAD].stroke,
        scale: TEXT_STYLE[StyleContext.DOWNLOAD].scale,
        placement: 'line',
        textBaseline: 'middle',
        offsetY: 0,
        textAlign: 'center',
        repeat: 300,
        padding: [2, 5, 2, 5],
        rotateWithView: true,
        declutterMode: 'declutter',
      });
    });

    it('creates Text style for point type with download styles', () => {
      createTextStyle('Test Label', false, true, StyleContext.DOWNLOAD);
      expect(Text).toHaveBeenCalledWith({
        text: 'Test Label',
        font: TEXT_STYLE[StyleContext.DOWNLOAD].font,
        fill: TEXT_STYLE[StyleContext.DOWNLOAD].fill,
        stroke: TEXT_STYLE[StyleContext.DOWNLOAD].stroke,
        scale: TEXT_STYLE[StyleContext.DOWNLOAD].scale,
        placement: 'point',
        textBaseline: 'bottom',
        offsetY: -25,
        textAlign: 'center',
        repeat: undefined,
        padding: [2, 5, 2, 5],
        rotateWithView: false,
        declutterMode: 'declutter',
      });
    });

    it('creates Text style for line type with map display styles', () => {
      createTextStyle('Test Label', true, false, StyleContext.MAP_DISPLAY);
      expect(Text).toHaveBeenCalledWith({
        text: 'Test Label',
        font: TEXT_STYLE[StyleContext.MAP_DISPLAY].font,
        fill: TEXT_STYLE[StyleContext.MAP_DISPLAY].fill,
        stroke: TEXT_STYLE[StyleContext.MAP_DISPLAY].stroke,
        scale: TEXT_STYLE[StyleContext.MAP_DISPLAY].scale,
        placement: 'line',
        textBaseline: 'middle',
        offsetY: 0,
        textAlign: 'center',
        repeat: 300,
        padding: [2, 5, 2, 5],
        rotateWithView: true,
        declutterMode: 'declutter',
      });
    });

    it('creates Text style for point type with map display styles', () => {
      createTextStyle('Test Label', false, true, StyleContext.MAP_DISPLAY);
      expect(Text).toHaveBeenCalledWith({
        text: 'Test Label',
        font: TEXT_STYLE[StyleContext.MAP_DISPLAY].font,
        fill: TEXT_STYLE[StyleContext.MAP_DISPLAY].fill,
        stroke: TEXT_STYLE[StyleContext.MAP_DISPLAY].stroke,
        scale: TEXT_STYLE[StyleContext.MAP_DISPLAY].scale,
        placement: 'point',
        textBaseline: 'bottom',
        offsetY: -25,
        textAlign: 'center',
        repeat: undefined,
        padding: [2, 5, 2, 5],
        rotateWithView: false,
        declutterMode: 'declutter',
      });
    });
  });

  describe('getRecResourceIcon', () => {
    it('returns locationDotOrange for map display when isForMapDisplay is true', () => {
      const icon = getRecResourceIcon(
        mockRecResource,
        StyleContext.MAP_DISPLAY,
      );
      expect(icon).toBe('/src/assets/location-dot-orange.png');
    });

    it('returns RECREATION_TRAIL_HEAD icon for recreation trail when isForMapDisplay is false', () => {
      (
        recreationResourceUtils.isRecreationTrail as ReturnType<any>
      ).mockReturnValue(true);
      (
        recreationResourceUtils.isRecreationSite as ReturnType<any>
      ).mockReturnValue(false);
      (
        recreationResourceUtils.isInterpretiveForest as ReturnType<any>
      ).mockReturnValue(false);
      const icon = getRecResourceIcon(mockRecResource, StyleContext.DOWNLOAD);
      expect(icon).toBe(MAP_ICONS.RECREATION_TRAIL_HEAD);
    });

    it('returns RECREATION_SITE icon for recreation site when isForMapDisplay is false', () => {
      (
        recreationResourceUtils.isRecreationTrail as ReturnType<any>
      ).mockReturnValue(false);
      (
        recreationResourceUtils.isRecreationSite as ReturnType<any>
      ).mockReturnValue(true);
      (
        recreationResourceUtils.isInterpretiveForest as ReturnType<any>
      ).mockReturnValue(false);
      const icon = getRecResourceIcon(mockRecResource, StyleContext.DOWNLOAD);
      expect(icon).toBe(MAP_ICONS.LOCATION_PIN);
    });

    it('returns INTERPRETIVE_FOREST icon for interpretive forest when isForMapDisplay is false', () => {
      (
        recreationResourceUtils.isRecreationTrail as ReturnType<any>
      ).mockReturnValue(false);
      (
        recreationResourceUtils.isRecreationSite as ReturnType<any>
      ).mockReturnValue(false);
      (
        recreationResourceUtils.isInterpretiveForest as ReturnType<any>
      ).mockReturnValue(true);
      const icon = getRecResourceIcon(mockRecResource, StyleContext.DOWNLOAD);
      expect(icon).toBe(MAP_ICONS.LOCATION_PIN);
    });

    it('returns LOCATION_PIN icon for unknown type when isForMapDisplay is false', () => {
      (
        recreationResourceUtils.isRecreationTrail as ReturnType<any>
      ).mockReturnValue(false);
      (
        recreationResourceUtils.isRecreationSite as ReturnType<any>
      ).mockReturnValue(false);
      (
        recreationResourceUtils.isInterpretiveForest as ReturnType<any>
      ).mockReturnValue(false);
      const icon = getRecResourceIcon(mockRecResource, StyleContext.DOWNLOAD);
      expect(icon).toBe(MAP_ICONS.LOCATION_PIN);
    });

    it('returns LOCATION_PIN icon for unknown type when isForMapDisplay is not provided (default false)', () => {
      (
        recreationResourceUtils.isRecreationTrail as ReturnType<any>
      ).mockReturnValue(false);
      (
        recreationResourceUtils.isRecreationSite as ReturnType<any>
      ).mockReturnValue(false);
      (
        recreationResourceUtils.isInterpretiveForest as ReturnType<any>
      ).mockReturnValue(false);
      const icon = getRecResourceIcon(mockRecResource, StyleContext.DOWNLOAD);
      expect(icon).toBe(MAP_ICONS.LOCATION_PIN);
    });
  });
});
