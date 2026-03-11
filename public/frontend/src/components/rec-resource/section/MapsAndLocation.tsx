import { forwardRef } from 'react';
import { SafeHtml } from '@shared/components/safe-html';
import { RecreationResourceMap } from '@/components/rec-resource/RecreationResourceMap';
import { RecreationResourceDetailModel } from '@/service/custom-models';
import { RecreationResourceDocsList } from '@/components/rec-resource/RecreationResourceDocsList';
import { SectionIds, SectionTitles } from '@/components/rec-resource/enum';
import { Stack } from 'react-bootstrap';

interface MapsAndLocationProps {
  accessTypes?: string[];
  recResource?: RecreationResourceDetailModel;
}

const MapsAndLocation = forwardRef<HTMLElement, MapsAndLocationProps>(
  ({ accessTypes, recResource }, ref) => {
    const { driving_directions } = recResource || {};
    const showDocsList =
      recResource && Boolean(recResource.recreation_resource_docs?.length);
    return (
      <section
        id={SectionIds.MAPS_AND_LOCATION}
        className="rec-resource-section"
        ref={ref}
      >
        <h2 className="section-heading">{SectionTitles.MAPS_AND_LOCATION}</h2>

        <Stack gap={5} direction="vertical">
          {showDocsList && (
            <div>
              <RecreationResourceDocsList recResource={recResource} />
            </div>
          )}

          {recResource && <RecreationResourceMap recResource={recResource} />}

          {driving_directions && (
            <article>
              <h3>Getting there</h3>
              <SafeHtml html={driving_directions} className="rich-text mb-0" />
            </article>
          )}

          {accessTypes && accessTypes?.length > 0 && (
            <article>
              <h3>Access type{accessTypes.length > 1 && 's'}</h3>
              <ul className="list-unstyled">
                {accessTypes.map((type) => (
                  <li key={type}>{type}</li>
                ))}
              </ul>
            </article>
          )}
        </Stack>
      </section>
    );
  },
);

export default MapsAndLocation;
