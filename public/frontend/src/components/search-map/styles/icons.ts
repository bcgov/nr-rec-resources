import { Icon, Style } from 'ol/style';
import locationDotOrange from '@/assets/location-dot-orange.png';
import SIT_ICON from '@shared/assets/icons/recreation_site.svg';
import RTR_ICON from '@shared/assets/icons/recreation_trail.svg';
import IF_ICON from '@shared/assets/icons/interpretive_forest.svg';
import SIT_ICON_CLOSED from '@shared/assets/icons/recreation_site_closed.svg';
import RTR_ICON_CLOSED from '@shared/assets/icons/recreation_trail_closed.svg';
import IF_ICON_CLOSED from '@shared/assets/icons/interpretive_forest_closed.svg';
import SIT_ICON_SELECTED from '@shared/assets/icons/recreation_site_selected.svg';
import RTR_ICON_SELECTED from '@shared/assets/icons/recreation_trail_selected.svg';
import IF_ICON_SELECTED from '@shared/assets/icons/interpretive_forest_selected.svg';

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

export const createLocationDotOrangeIcon = (options?: LocationDotIconOptions) =>
  createLocationDotIcon(locationDotOrange, options);

export const locationDotOrangeIcon = new Style({
  image: new Icon({ src: locationDotOrange, scale: 0.5 }),
  zIndex: 10,
});

export type IconVariant = 'default' | 'closed' | 'selected';

interface IconOptions {
  opacity?: number;
  scale?: number;
  variant?: IconVariant;
}

function createIcon(
  src: string,
  { opacity = 1, scale = 0.8 }: IconOptions = {},
): Style {
  return new Style({
    image: new Icon({
      src,
      scale,
      opacity,
    }),
  });
}

export const createSITIcon = (options?: IconOptions) => {
  const variant = options?.variant || 'default';
  let iconSrc = SIT_ICON;

  if (variant === 'selected') {
    iconSrc = SIT_ICON_SELECTED;
  } else if (variant === 'closed') {
    iconSrc = SIT_ICON_CLOSED;
  }

  return createIcon(iconSrc, options);
};

export const createRTRIcon = (options?: IconOptions) => {
  const variant = options?.variant || 'default';
  let iconSrc = RTR_ICON;

  if (variant === 'selected') {
    iconSrc = RTR_ICON_SELECTED;
  } else if (variant === 'closed') {
    iconSrc = RTR_ICON_CLOSED;
  }

  return createIcon(iconSrc, options);
};

export const createIFIcon = (options?: IconOptions) => {
  const variant = options?.variant || 'default';
  let iconSrc = IF_ICON;

  if (variant === 'selected') {
    iconSrc = IF_ICON_SELECTED;
  } else if (variant === 'closed') {
    iconSrc = IF_ICON_CLOSED;
  }

  return createIcon(iconSrc, options);
};
