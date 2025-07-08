import { describe, it, expect } from 'vitest';
import {
  locationDotBlueIcon,
  locationDotRedIcon,
  locationDotOrangeIcon,
  createLocationDotBlueIcon,
  createLocationDotRedIcon,
  createLocationDotOrangeIcon,
} from '@/components/search/SearchMap/styles/icons';
import locationDotBlue from '@/assets/location-dot-blue.png';
import locationDotRed from '@/assets/location-dot-red.png';
import locationDotOrange from '@/assets/location-dot-orange.png';
import { Icon } from 'ol/style';

describe('Static locationDot icons', () => {
  it('locationDotBlueIcon uses correct settings', () => {
    const icon = locationDotBlueIcon.getImage() as Icon;
    expect(icon).toBeInstanceOf(Icon);
    expect(icon.getSrc()).toBe(locationDotBlue);
    expect(icon.getScale()).toBe(0.5);
  });

  it('locationDotRedIcon uses correct settings', () => {
    const icon = locationDotRedIcon.getImage() as Icon;
    expect(icon.getSrc()).toBe(locationDotRed);
    expect(icon.getScale()).toBe(0.5);
  });

  it('locationDotOrangeIcon uses correct settings', () => {
    const icon = locationDotOrangeIcon.getImage() as Icon;
    expect(icon.getSrc()).toBe(locationDotOrange);
    expect(icon.getScale()).toBe(0.5);
  });
});

describe('createLocationDotIcon factory functions', () => {
  it('createLocationDotBlueIcon creates icon with default options', () => {
    const icon = createLocationDotBlueIcon().getImage() as Icon;
    expect(icon.getSrc()).toBe(locationDotBlue);
    expect(icon.getScale()).toBe(0.5);
    expect(icon.getOpacity()).toBe(1);
  });

  it('createLocationDotRedIcon creates icon with custom options', () => {
    const icon = createLocationDotRedIcon({
      scale: 0.7,
      opacity: 0.8,
    }).getImage() as Icon;
    expect(icon.getSrc()).toBe(locationDotRed);
    expect(icon.getScale()).toBe(0.7);
    expect(icon.getOpacity()).toBe(0.8);
  });

  it('createLocationDotOrangeIcon creates icon with custom scale only', () => {
    const icon = createLocationDotOrangeIcon({ scale: 0.9 }).getImage() as Icon;
    expect(icon.getSrc()).toBe(locationDotOrange);
    expect(icon.getScale()).toBe(0.9);
    expect(icon.getOpacity()).toBe(1);
  });
});
