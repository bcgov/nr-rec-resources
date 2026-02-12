import { Prisma } from '@generated/prisma';
import { getRecreationResourceSelect } from 'src/recreation-resource/utils/getRecreationResourceSelect';

export type RecreationResourceGetPayload =
  Prisma.recreation_resourceGetPayload<{
    select: ReturnType<typeof getRecreationResourceSelect>;
  }>;

export interface FilterTypes {
  isOnlyAccessFilter: boolean;
  isOnlyDistrictFilter: boolean;
  isOnlyTypeFilter: boolean;
  isOnlyStatusFilter: boolean;
  isOnlyFeesFilter: boolean;
}

export interface AggregatedRecordCount {
  type:
    | 'district'
    | 'access'
    | 'type'
    | 'facilities'
    | 'activity'
    | 'status'
    | 'fees';
  code: string;
  description: string;
  count: number;
}
