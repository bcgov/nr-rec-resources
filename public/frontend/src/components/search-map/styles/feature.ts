import { Fill, Stroke, Text } from 'ol/style';

export function featureLabelText(text: string): Text {
  return new Text({
    text,
    font: '14px BC Sans,sans-serif',
    fill: new Fill({ color: '#000' }),
    stroke: new Stroke({ color: '#fff', width: 2 }),
    offsetY: -42,
  });
}
