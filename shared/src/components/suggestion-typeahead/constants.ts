import SIT_ICON from '@shared/assets/icons/recreation_site.svg';
import RTE_ICON from '@shared/assets/icons/recreation_trail.svg';
import IF_ICON from '@shared/assets/icons/interpretive_forest.svg';
import NO_TYPE_ICON from '@shared/assets/icons/no_type.svg';

export const RESOURCE_TYPE_ICONS: Record<string, string> = {
  // Site type icons:
  SIT: SIT_ICON,
  RR: SIT_ICON,
  // Trail type icons
  RTR: RTE_ICON,
  RTE: RTE_ICON,
  TBL: RTE_ICON,
  TRB: RTE_ICON,
  // Interpretive forest type icons:
  IF: IF_ICON,
  IFT: IF_ICON,
  NO_TYPE_ICON: NO_TYPE_ICON,
};
