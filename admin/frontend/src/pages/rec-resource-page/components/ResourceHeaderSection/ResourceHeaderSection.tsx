import {
  AdminStatusBadge,
  CustomBadge,
  FileStatusBadge,
  PUBLIC_ACCESS_STATUS_OPEN,
  PublicAccessStatusBadge,
} from '@/components';
import { useAuthorizations } from '@/hooks/useAuthorizations';
import { RecreationResourceDetailUIModel } from '@/services';
import { COLOR_BLUE, COLOR_BLUE_LIGHT } from '@/styles/colors';
import { FC } from 'react';
import { Stack } from 'react-bootstrap';
import './ResourceHeaderSection.scss';
import { capitalizeWords } from '@shared/utils/capitalizeWords';

interface ResourceHeaderSectionProps {
  recResource: RecreationResourceDetailUIModel;
}

export const ResourceHeaderSection: FC<ResourceHeaderSectionProps> = ({
  recResource,
}) => {
  const { isSuperAdmin } = useAuthorizations();

  // No advisory on file means the resource is open to the public, matching how
  // the search results table resolves a missing label.
  const publicAccessStatus =
    recResource.access_status_grouplabel ?? PUBLIC_ACCESS_STATUS_OPEN;

  // The admin status badge is super-admin only, so only dedupe against it when
  // it is actually rendered; otherwise everyone else would see neither pill.
  const isAdminStatusBadgeVisible = Boolean(
    isSuperAdmin && recResource.recreation_status_description,
  );
  const showPublicAccessStatus =
    !isAdminStatusBadgeVisible ||
    publicAccessStatus !== recResource.recreation_status_description;

  return (
    <Stack direction="vertical" className="resource-header-section" gap={2}>
      {/* section: name, rec id, status */}
      <Stack direction="horizontal" gap={2} className="justify-content-between">
        {/* name, rec id, and badge */}
        <Stack
          direction="horizontal"
          gap={2}
          className="flex-wrap align-items-end"
        >
          <div className="resource-header-section__title-wrapper">
            <h1 className="resource-header-section__title-text">
              {capitalizeWords(recResource.name)}
            </h1>
          </div>
          <CustomBadge
            label={recResource.rec_resource_id}
            bgColor={COLOR_BLUE_LIGHT}
            textColor={COLOR_BLUE}
          />
          {isSuperAdmin && recResource.recreation_status_description && (
            <AdminStatusBadge
              label={recResource.recreation_status_description!}
              statusCode={recResource.recreation_status_code ?? 1}
            />
          )}
          {recResource.rec_status_code && (
            <FileStatusBadge
              code={recResource.rec_status_code}
              label={
                recResource.rec_status_description ??
                recResource.rec_status_code
              }
            />
          )}
          {showPublicAccessStatus && (
            <PublicAccessStatusBadge label={publicAccessStatus} />
          )}
        </Stack>
      </Stack>
      <span className="fw-bold">{recResource.rec_resource_type}</span>
    </Stack>
  );
};
