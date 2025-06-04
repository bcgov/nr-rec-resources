import { Fill, Stroke } from 'ol/style';

export const STROKE_COLOR = '#42814A';
export const FILL_COLOR = '#42814A66';
export const TEXT_COLOR = '#000000';
export const TEXT_STROKE_COLOR = '#FFFFFF';

export const TEXT_STYLE = {
  fill: new Fill({ color: TEXT_COLOR }),
  stroke: new Stroke({
    color: TEXT_STROKE_COLOR,
    width: 2,
  }),
};

export const MAP_STYLES = {
  STROKE: {
    COLOR: STROKE_COLOR,
    WIDTH: 3,
    LINE_DASH: [6, 6],
  },
  FILL: {
    COLOR: FILL_COLOR,
  },
};

export const MATOMO_TRACKING_CATEGORY_MAP = 'Map';
