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
  SIT: SIT_ICON,
  RR: RR_ICON,
  // Trail type icons
  RTR: RTR_ICON,
  RTE: RTE_ICON,
  TBL: TBL_ICON,
  TRB: TRB_ICON,
  // Interpretive forest type icons:
  IF: IF_ICON,
  IFT: IFT_ICON,
  NO_TYPE_ICON: ARCHIVED_ICON,
};

export const RESOURCE_STATUS_TYPE: Record<string, string> = {
  EE: 'EE',
  AR: 'AR',
  CL: 'CL',
  DD: 'DD',
  DE: 'DE',
  HI: 'HI',
  HX: 'HX',
  NC: 'NC',
  PE: 'PE',
  PI: 'PI',
};

export const IS_RESERVE = (recreation_resource_type_code: string): boolean => {
  return (
    recreation_resource_type_code === 'RR' ||
    recreation_resource_type_code === 'RTR'
  );
};
