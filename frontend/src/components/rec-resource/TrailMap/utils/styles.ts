import { Fill, Stroke, Style, Text } from 'ol/style';
import { StyleLike } from 'ol/style/Style';
import { FeatureLike } from 'ol/Feature';

export const getLayerStyle =
  (label: string): StyleLike =>
  (feature: FeatureLike) => {
    const geometry = feature.getGeometry();
    const type = geometry?.getType();

    return new Style({
      stroke: new Stroke({ color: '#42814A', width: 3, lineDash: [6, 6] }),
      fill:
        type !== 'LineString'
          ? new Fill({ color: 'rgba(255, 0, 0, 0.2)' })
          : undefined,
      text: new Text({
        text: label, // Replace with your label property
        placement: type === 'LineString' ? 'line' : 'point',
        fill: new Fill({ color: 'black' }),
        stroke: new Stroke({ color: 'white', width: 2 }),
        textBaseline: type === 'Polygon' ? 'middle' : 'bottom',
        textAlign: 'center',
      }),
    });
  };
