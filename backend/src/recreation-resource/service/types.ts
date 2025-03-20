import { Prisma } from "@prisma/client";
import { getSearchRecreationResourceSelect } from "src/recreation-resource/service/search.service";
import { getRecreationResourceSelect } from "src/recreation-resource/service/recreation-resource.service";

export type RecreationResourceGetPayload =
  Prisma.recreation_resourceGetPayload<{
    select: ReturnType<typeof getRecreationResourceSelect>;
  }>;

export type SearchRecreationResourceGetPayload =
  Prisma.recreation_resourceGetPayload<{
    select: ReturnType<typeof getSearchRecreationResourceSelect>;
  }>;
