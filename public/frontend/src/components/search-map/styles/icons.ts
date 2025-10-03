import { Icon, Style } from 'ol/style';
import locationDotBlue from '@/assets/location-dot-blue.png';
import locationDotRed from '@/assets/location-dot-red.png';
import locationDotOrange from '@/assets/location-dot-orange.png';
import SIT_ICON from '@shared/assets/icons/recreation_site.svg';
import RTR_ICON from '@shared/assets/icons/recreation_trail.svg';
import IF_ICON from '@shared/assets/icons/interpretive_forest.svg';
import SIT_ICON_CLOSED from '@shared/assets/icons/recreation_site_closed.svg';
import RTR_ICON_CLOSED from '@shared/assets/icons/recreation_trail_closed.svg';
import IF_ICON_CLOSED from '@shared/assets/icons/interpretive_forest_closed.svg';

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
  isClosed?: boolean;
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

export const createSITIcon = (options?: LocationDotIconOptions) => {
  const iconSrc = options?.isClosed ? SIT_ICON_CLOSED : SIT_ICON;
  return createLocationDotIcon(iconSrc, { ...options, scale: 0.8 });
};

export const createRTRIcon = (options?: LocationDotIconOptions) => {
  const iconSrc = options?.isClosed ? RTR_ICON_CLOSED : RTR_ICON;
  return createLocationDotIcon(iconSrc, { ...options, scale: 0.8 });
};

export const createIFIcon = (options?: LocationDotIconOptions) => {
  const iconSrc = options?.isClosed ? IF_ICON_CLOSED : IF_ICON;
  return createLocationDotIcon(iconSrc, { ...options, scale: 0.8 });
};
