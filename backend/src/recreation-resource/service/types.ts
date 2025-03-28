import { Prisma } from "@prisma/client";
import { getRecreationResourceSelect } from "src/recreation-resource/utils/getRecreationResourceSelect";

export type RecreationResourceGetPayload =
  Prisma.recreation_resourceGetPayload<{
    select: ReturnType<typeof getRecreationResourceSelect>;
  }>;

export interface CombinedRecordCount {
  recreation_activity_code: number;
  description: string;
  recreation_activity_count: number;
  total_toilet_count: number;
  total_table_count: number;
  total_count: number;
}

export interface CombinedStaticCount {
  type: "district" | "access" | "type";
  code: string;
  description: string;
  count: number;
}
