import { ResourceHeaderSection } from "@/pages/rec-resource-page/components/";
import {
  REC_RESOURCE_PAGE_TABS,
  RecResourceTabKey,
} from "@/pages/rec-resource-page/constants";
import { useRecResource } from "@/pages/rec-resource-page/hooks/useRecResource";
import {
  RecResourcePageRouteHandle,
  RecResourceRouteContext,
} from "@/routes/types";
import { Breadcrumbs, useBreadcrumbs } from "@shared/index";
import { useEffect, useState } from "react";
import { Spinner, Stack, Tab, Tabs } from "react-bootstrap";
import {
  Outlet,
  UIMatch,
  useMatches,
  useNavigate,
  useParams,
} from "react-router-dom";
import "./RecResourcePage.scss";

const LoadingSpinner = () => (
  <div className="rec-resource-page__loading-container">
    <Spinner
      animation="border"
      className="rec-resource-page__loading-spinner"
      role="status"
      aria-label="Loading recreation resource"
    />
  </div>
);

export const RecResourceLayout = () => {
  const { recResource, isLoading, error } = useRecResource();
  const { id: rec_resource_id } = useParams();
  const navigate = useNavigate();
  const matches = useMatches() as UIMatch<
    unknown,
    RecResourcePageRouteHandle<RecResourceRouteContext>
  >[];
  const [activeTab, setActiveTab] = useState<RecResourceTabKey>(
    RecResourceTabKey.OVERVIEW,
  );

  // Update store based on current route handle
  useEffect(() => {
    const currentMatch = matches[matches.length - 1];
    const tabFromRoute = currentMatch.handle.tab;
    setActiveTab(tabFromRoute);
  }, [matches]);

  useBreadcrumbs({
    context: {
      resourceName: recResource?.name,
      resourceId: recResource?.rec_resource_id,
    } as RecResourceRouteContext,
  });

  if (!rec_resource_id || error) {
    return null;
  }

  if (isLoading || !recResource) {
    return <LoadingSpinner />;
  }

  // Handle tab change and navigate to corresponding route
  const handleTabSelect = (key: string | null) => {
    const tabKey = key as RecResourceTabKey;
    const route = REC_RESOURCE_PAGE_TABS[tabKey].route(rec_resource_id);
    navigate(route);
  };

  return (
    <Stack
      direction="vertical"
      gap={4}
      className="rec-resource-page"
      role="main"
      aria-label="Recreation resource content"
    >
      <Breadcrumbs />
      <ResourceHeaderSection recResource={recResource} />

      <Tabs activeKey={activeTab} onSelect={handleTabSelect}>
        {Object.entries(REC_RESOURCE_PAGE_TABS).map(([key, { title }]) => (
          <Tab key={key} eventKey={key} title={title} />
        ))}
      </Tabs>

      <Outlet />
    </Stack>
  );
};
