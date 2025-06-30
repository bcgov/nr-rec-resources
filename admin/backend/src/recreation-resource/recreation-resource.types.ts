import { Prisma } from "@prisma/client";
import { recreationResourceSelect } from "./recreation-resource.select";

export type RecreationResourceGetPayload =
  Prisma.recreation_resourceGetPayload<{
    select: typeof recreationResourceSelect;
  }>;
