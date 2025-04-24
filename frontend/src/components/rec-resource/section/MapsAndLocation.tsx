import { forwardRef } from 'react';
import parse from 'html-react-parser';
import { RecreationResourceMap } from '@/components/rec-resource/RecreationResourceMap';
import { RecreationResourceDetailModel } from '@/service/custom-models';
import { RecreationResourceDocsList } from '@/components/rec-resource/RecreationResourceDocsList';
import { SectionIds, SectionTitles } from '@/components/rec-resource/enum';

interface MapsAndLocationProps {
  accessTypes?: string[];
  recResource?: RecreationResourceDetailModel;
}

const MapsAndLocation = forwardRef<HTMLElement, MapsAndLocationProps>(
  ({ accessTypes, recResource }, ref) => {
    const { driving_directions } = recResource || {};
    return (
      <section
        id={SectionIds.MAPS_AND_LOCATION}
        className="rec-resource-section"
        ref={ref}
      >
        <h2 className="section-heading">{SectionTitles.MAPS_AND_LOCATION}</h2>

        {recResource && (
          <section className="mb-4">
            <RecreationResourceDocsList recResource={recResource} />
          </section>
        )}

        <RecreationResourceMap
          recResource={recResource}
          mapComponentCssStyles={{
            position: 'relative',
            height: '40vh',
            marginBottom: '4rem',
          }}
        />

        {driving_directions && (
          <article className="mb-4">
            <h3>Getting there</h3>
            <p>{parse(driving_directions)}</p>
          </article>
        )}

        {accessTypes && accessTypes?.length > 0 && (
          <section className="mb-4">
            <h3>Access type{accessTypes.length > 1 && 's'}</h3>
            <ul className="list-unstyled">
              {accessTypes.map((type) => (
                <li key={type}>{type}</li>
              ))}
            </ul>
          </section>
        )}
      </section>
    );
  },
);

export default MapsAndLocation;
