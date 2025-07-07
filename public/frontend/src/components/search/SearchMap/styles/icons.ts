import { Icon, Style } from 'ol/style';
import locationDotBlue from '@/assets/location-dot-blue.png';
import locationDotRed from '@/assets/location-dot-red.png';
import locationDotOrange from '@/assets/location-dot-orange.png';

export const locationDotBlueIcon = new Style({
  image: new Icon({ src: locationDotBlue, scale: 0.5, anchor: [0.5, 1] }),
});

export const locationDotRedIcon = new Style({
  image: new Icon({ src: locationDotRed, scale: 0.5, anchor: [0.5, 1] }),
});

export const locationDotOrangeIcon = new Style({
  image: new Icon({ src: locationDotOrange, scale: 0.5, anchor: [0.5, 1] }),
});
