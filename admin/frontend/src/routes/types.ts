import { RecResourceNavKey } from "@/pages/rec-resource-page";
import { RouteHandle } from "@shared/index";

export interface RecResourcePageRouteHandle<TContext>
  extends RouteHandle<TContext> {
  tab: RecResourceNavKey;
}

export interface RecResourceRouteContext {
  resourceId: string;
  resourceName?: string;
}
