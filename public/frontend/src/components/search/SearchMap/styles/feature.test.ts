import { describe, it, expect } from 'vitest';
import {
  featureLabelText,
  locationDotBlueIcon,
  locationDotRedIcon,
} from '@/components/search/SearchMap/styles/feature';
import { Text, Icon } from 'ol/style';
import locationDotBlue from '@/assets/location-dot-blue.png';
import locationDotRed from '@/assets/location-dot-red.png';

describe('featureLabelText', () => {
  it('creates a Text style with correct properties', () => {
    const text = featureLabelText('Hello');

    expect(text).toBeInstanceOf(Text);
    expect(text.getText()).toBe('Hello');
    expect(text.getFont()).toBe('14px BC Sans,sans-serif');
    expect(text.getOffsetY()).toBe(-42);

    const fill = text.getFill();
    const stroke = text.getStroke();

    expect(fill?.getColor()).toBe('#000');
    expect(stroke?.getColor()).toBe('#fff');
    expect(stroke?.getWidth()).toBe(2);
  });
});

describe('locationDot icons', () => {
  it('locationDotBlueIcon uses the correct image and settings', () => {
    const image = locationDotBlueIcon.getImage() as Icon;

    expect(image).toBeInstanceOf(Icon);
    expect(image.getSrc()).toBe(locationDotBlue);
    expect(image.getScale()).toBe(0.5);
  });

  it('locationDotRedIcon uses the correct image and settings', () => {
    const image = locationDotRedIcon.getImage() as Icon;

    expect(image).toBeInstanceOf(Icon);
    expect(image.getSrc()).toBe(locationDotRed);
    expect(image.getScale()).toBe(0.5);
  });
});
