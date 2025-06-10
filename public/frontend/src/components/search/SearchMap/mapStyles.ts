import { Style, Fill, Icon, Stroke, Text } from 'ol/style';
import locationDotBlue from '@/assets/location-dot-blue.png';
import locationDotRed from '@/assets/location-dot-red.png';

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
