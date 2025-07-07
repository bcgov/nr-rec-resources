import { describe, it, expect } from 'vitest';
import {
  locationDotBlueIcon,
  locationDotOrangeIcon,
  locationDotRedIcon,
} from '@/components/search/SearchMap/styles/icons';
import { Icon } from 'ol/style';
import locationDotBlue from '@/assets/location-dot-blue.png';
import locationDotRed from '@/assets/location-dot-red.png';

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

  it('locationDotOrangeIcon uses the correct image and settings', () => {
    const image = locationDotOrangeIcon.getImage() as Icon;

    expect(image).toBeInstanceOf(Icon);
    expect(image.getSrc()).toBe(locationDotOrangeIcon);
    expect(image.getScale()).toBe(0.6);
  });
});
