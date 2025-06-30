import { Circle, Fill, Stroke, Style, Text } from 'ol/style';

const CLUSTER_COLOR = '36,100,164';

const getClusterRadius = (size: number) => {
  if (size > 50) return 32;
  if (size > 9) return 18;
  return 14;
};

export function clusterStyle(size: number): Style[] {
  const radius = getClusterRadius(size);
  const strokeWidth = 2;
  const haloRadius = radius + strokeWidth;

  const haloStyle = new Style({
    image: new Circle({
      radius: haloRadius,
      stroke: new Stroke({
        color: 'rgba(255, 255, 255, 0.7)',
        width: 6,
      }),
      fill: new Fill({
        color: 'transparent',
      }),
    }),
  });

  const clusterStyle = new Style({
    image: new Circle({
      radius,
      stroke: new Stroke({
        color: `rgb(${CLUSTER_COLOR})`,
        width: strokeWidth,
      }),
      fill: new Fill({
        color: `rgb(${CLUSTER_COLOR})`,
      }),
    }),
    text: new Text({
      text: size.toString(),
      fill: new Fill({ color: '#FFF' }),
      scale: 1.8,
    }),
  });

  return [haloStyle, clusterStyle];
}
