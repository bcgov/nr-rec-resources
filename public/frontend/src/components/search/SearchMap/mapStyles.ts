import { Circle, Fill, Icon, Stroke, Style, Text } from 'ol/style';
import locationDotBlue from '@/assets/location-dot-blue.png';
import locationDotRed from '@/assets/location-dot-red.png';

const CLUSTER_SM_COLOR = '255,204,38';
const CLUSTER_MD_COLOR = '151,213,112';
const CLUSTER_LG_COLOR = '242,153,91';

export function featureLabelText(text: string): Text {
  return new Text({
    text,
    font: '14px BC Sans,sans-serif',
    fill: new Fill({ color: '#000' }),
    stroke: new Stroke({ color: '#fff', width: 2 }),
    offsetY: -28,
  });
}

export const locationDotBlueIcon = new Style({
  image: new Icon({ src: locationDotBlue, scale: 0.3, anchor: [0.5, 1] }),
});

export const locationDotRedIcon = new Style({
  image: new Icon({ src: locationDotRed, scale: 0.3, anchor: [0.5, 1] }),
});

const getClusterColor = (size: number) => {
  if (size > 75) return CLUSTER_LG_COLOR;
  if (size > 8) return CLUSTER_MD_COLOR;
  return CLUSTER_SM_COLOR;
};

export function clusterStyle(size: number): Style[] {
  const baseColor = getClusterColor(size);

  const radius = 18;
  const strokeWidth = 6;
  const haloRadius = radius + strokeWidth;

  const haloStyle = new Style({
    image: new Circle({
      radius: haloRadius,
      stroke: new Stroke({
        color: `rgba(${baseColor}, 0.3)`,
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
        color: `rgb(${baseColor})`,
        width: strokeWidth,
      }),
      fill: new Fill({
        color: `rgb(${baseColor})`,
      }),
    }),
    text: new Text({
      text: size.toString(),
      fill: new Fill({ color: '#000000' }),
      scale: 1.8,
    }),
  });

  return [haloStyle, clusterStyle];
}
