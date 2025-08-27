import { RecResourceTabKey } from "@/pages/rec-resource-page/constants";
import { RouteHandle } from "@shared/index";

export interface RecResourcePageRouteHandle<TContext>
  extends RouteHandle<TContext> {
  tab: RecResourceTabKey;
}

export interface RecResourceRouteContext {
  resourceId: string;
  resourceName?: string;
}
