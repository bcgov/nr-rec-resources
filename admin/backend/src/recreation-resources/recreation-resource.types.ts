import { Prisma } from '@generated/prisma';
import {
  adminSearchSelect,
  recreationResourceSelect,
  recreationResourceSummarySelect,
} from './recreation-resource.select';

export type RecreationResourceGetPayload =
  Prisma.recreation_resourceGetPayload<{
    select: typeof recreationResourceSelect;
  }>;

export type RecreationResourceSummaryGetPayload =
  Prisma.recreation_resourceGetPayload<{
    select: typeof recreationResourceSummarySelect;
  }>;

export type AdminSearchRecreationResourceGetPayload =
  Prisma.recreation_resourceGetPayload<{
    select: typeof adminSearchSelect;
  }>;
