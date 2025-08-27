import { ResourceHeaderSection } from "@/pages/rec-resource-page/components/";
import { useRecResource } from "@/pages/rec-resource-page/hooks/useRecResource";
import { Breadcrumbs, useBreadcrumbs } from "@shared/index";
import { Spinner, Stack } from "react-bootstrap";
import { Outlet } from "react-router-dom";
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

  useBreadcrumbs({
    context: {
      resourceName: recResource?.name,
      resourceId: recResource?.rec_resource_id,
    },
  });

  if (error) {
    return null;
  }

  if (isLoading || !recResource) {
    return <LoadingSpinner />;
  }

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
      <Outlet />
    </Stack>
  );
};
