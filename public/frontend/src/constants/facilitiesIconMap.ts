import tableIcon from '@/images/facilities/table.svg';
import toiletIcon from '@/images/facilities/toilet.svg';

interface FacilityMap {
  [key: string]: string;
}

export const facilityMap: FacilityMap = {
  '1': tableIcon,
  '2': toiletIcon,
};
