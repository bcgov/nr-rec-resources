import { Icon, Style } from 'ol/style';
import locationDotBlue from '@/assets/location-dot-blue.png';
import locationDotRed from '@/assets/location-dot-red.png';
import locationDotOrange from '@/assets/location-dot-orange.png';

export const locationDotBlueIcon = new Style({
  image: new Icon({ src: locationDotBlue, scale: 0.5 }),
});

export const locationDotRedIcon = new Style({
  image: new Icon({ src: locationDotRed, scale: 0.5 }),
});

export const locationDotOrangeIcon = new Style({
  image: new Icon({ src: locationDotOrange, scale: 0.5 }),
  zIndex: 10,
});

interface LocationDotIconOptions {
  opacity?: number;
  scale?: number;
}

function createLocationDotIcon(
  src: string,
  { opacity = 1, scale = 0.5 }: LocationDotIconOptions = {},
): Style {
  return new Style({
    image: new Icon({
      src,
      scale,
      opacity,
    }),
  });
}

export const createLocationDotBlueIcon = (options?: LocationDotIconOptions) =>
  createLocationDotIcon(locationDotBlue, options);

export const createLocationDotRedIcon = (options?: LocationDotIconOptions) =>
  createLocationDotIcon(locationDotRed, options);

export const createLocationDotOrangeIcon = (options?: LocationDotIconOptions) =>
  createLocationDotIcon(locationDotOrange, options);
