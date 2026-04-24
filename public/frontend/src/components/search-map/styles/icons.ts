import { Icon, Style } from 'ol/style';
import locationDotOrange from '@/assets/location-dot-orange.png';
import SIT_ICON from '@shared/assets/icons/recreation_site.svg';
import RTE_ICON from '@shared/assets/icons/recreation_trail.svg';
import IF_ICON from '@shared/assets/icons/interpretive_forest.svg';
import SIT_ICON_CLOSED from '@shared/assets/icons/recreation_site_closed.svg';
import RTE_ICON_CLOSED from '@shared/assets/icons/recreation_trail_closed.svg';
import IF_ICON_CLOSED from '@shared/assets/icons/interpretive_forest_closed.svg';
import SIT_ICON_SELECTED from '@shared/assets/icons/recreation_site_selected.svg';
import RTE_ICON_SELECTED from '@shared/assets/icons/recreation_trail_selected.svg';
import IF_ICON_SELECTED from '@shared/assets/icons/interpretive_forest_selected.svg';
import WILDFIRE_ICON_UNDER_BOLD from '@shared/assets/icons/wildfire/under_control_bold.svg';
import WILDFIRE_ICON_OUT_BOLD from '@shared/assets/icons/wildfire/out_of_control_bold.svg';
import WILDFIRE_ICON_HELD_BOLD from '@shared/assets/icons/wildfire/being_held_bold.svg';

const FIRE_STATUS_BOLD_ICONS: Record<string, string> = {
  'Out of Control': WILDFIRE_ICON_OUT_BOLD,
  'Being Held': WILDFIRE_ICON_HELD_BOLD,
  'Under Control': WILDFIRE_ICON_UNDER_BOLD,
};

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

export const selectedWildfireIcon = (type: string) => {
  console.log('Selected wildfire status:', type); // Debug log to check the fire status value
  const iconSrc = FIRE_STATUS_BOLD_ICONS[type] || WILDFIRE_ICON_OUT_BOLD;
  return new Style({
    image: new Icon({ src: iconSrc, scale: 1 }),
    zIndex: 10,
  });
};

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

export const createRTEIcon = (options?: IconOptions) => {
  const variant = options?.variant || 'default';
  let iconSrc = RTE_ICON;

  if (variant === 'selected') {
    iconSrc = RTE_ICON_SELECTED;
  } else if (variant === 'closed') {
    iconSrc = RTE_ICON_CLOSED;
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
