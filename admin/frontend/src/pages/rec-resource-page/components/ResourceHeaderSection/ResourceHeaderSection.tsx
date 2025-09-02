import { CustomBadge } from '@/components';
import { ClampLines } from '@/components/clamp-lines';
import { RecreationResourceDetailUIModel } from '@/services';
import {
  COLOR_BLUE,
  COLOR_BLUE_LIGHT,
  COLOR_GREEN,
  COLOR_WHITE,
} from '@/styles/colors';
import { FC } from 'react';
import { Stack } from 'react-bootstrap';
import './ResourceHeaderSection.scss';

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
            <ClampLines
              text={recResource.name}
              as="h1"
              className="resource-header-section__title-text"
            />
          </div>
          <CustomBadge
            label={recResource.rec_resource_id}
            bgColor={COLOR_BLUE_LIGHT}
            textColor={COLOR_BLUE}
          />
          {recResource.recreation_status_description && (
            <CustomBadge
              label={recResource.recreation_status_description!}
              bgColor={COLOR_GREEN}
              textColor={COLOR_WHITE}
            />
          )}
        </Stack>
      </Stack>
      <span className="fw-bold">{recResource.rec_resource_type}</span>
    </Stack>
  );
};
