import { Prisma } from "@prisma/client";
import { getRecreationResourceSelect } from "src/recreation-resource/service/recreation-resource.service";

export type RecreationResourceGetPayload =
  Prisma.recreation_resourceGetPayload<{
    select: ReturnType<typeof getRecreationResourceSelect>;
  }>;
