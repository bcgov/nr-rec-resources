import { AdminStatusBadge, CustomBadge, FileStatusBadge } from '@/components';
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
          {recResource.recreation_status_description && (
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
        </Stack>
      </Stack>
      <span className="fw-bold">{recResource.rec_resource_type}</span>
    </Stack>
  );
};
