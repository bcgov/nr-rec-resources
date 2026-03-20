import { Prisma } from '@generated/prisma';
import {
  adminSearchSelect,
  recreationResourceSelect,
} from './recreation-resource.select';

export type RecreationResourceGetPayload =
  Prisma.recreation_resourceGetPayload<{
    select: typeof recreationResourceSelect;
  }>;

export type AdminSearchRecreationResourceGetPayload =
  Prisma.recreation_resourceGetPayload<{
    select: typeof adminSearchSelect;
  }>;
