import { CustomBadge } from '@/components';
import { COLOR_BACKGROUND_GREY, COLOR_GREY_MED } from '@/styles/colors';
import { faEyeSlash } from '@fortawesome/free-solid-svg-icons';

export const NotVisibleOnPublicSiteBadge = () => (
  <CustomBadge
    label="Not visible on public site"
    icon={faEyeSlash}
    bgColor={COLOR_BACKGROUND_GREY}
    textColor={COLOR_GREY_MED}
  />
);
