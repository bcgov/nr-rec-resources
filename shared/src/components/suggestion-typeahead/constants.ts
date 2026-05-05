import SIT_ICON from '@shared/assets/icons/recreation_site.svg';
import RTE_ICON from '@shared/assets/icons/recreation_trail.svg';
import RTR_ICON from '@shared/assets/icons/recreation_trail_closed.svg';
import IF_ICON from '@shared/assets/icons/interpretive_forest.svg';
import TRB_ICON from '@shared/assets/icons/trail_based_recreation_area.svg';
import RR_ICON from '@shared/assets/icons/recreation_reserve.svg';
import TBL_ICON from '@shared/assets/icons/trail_based_recreation_linear.svg';
import IFT_ICON from '@shared/assets/icons/interpretive_forest_trail.svg';
import ARCHIVED_ICON from '@shared/assets/icons/archived.svg';

export const RESOURCE_TYPE_ICONS: Record<string, string> = {
  // Site type icons:
  SIT: SIT_ICON, // done
  RR: RR_ICON, // done
  // Trail type icons
  RTR: RTR_ICON, // done
  RTE: RTE_ICON, // done
  TBL: TBL_ICON, // done
  TRB: TRB_ICON, // done
  // Interpretive forest type icons:
  IF: IF_ICON, // done
  IFT: IFT_ICON, // done
  NO_TYPE_ICON: ARCHIVED_ICON,
};
