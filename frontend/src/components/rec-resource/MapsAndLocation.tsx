import { forwardRef } from 'react';
import { RecreationResourceMap } from '@/components/rec-resource/RecreationResourceMap';
import { RecreationResourceDetailModel } from '@/service/custom-models';

interface MapsAndLocationProps {
  accessTypes?: string[];
  recResource?: RecreationResourceDetailModel;
}

const MapsAndLocation = forwardRef<HTMLElement, MapsAndLocationProps>(
  ({ accessTypes, recResource }, ref) => {
    return (
      <section
        id="maps-and-location"
        className="rec-resource-section"
        ref={ref}
      >
        <h2 className="section-heading">Maps and Location</h2>
        {accessTypes && (
          <>
            <h3>Access Type{accessTypes.length > 1 && 's'}</h3>
            <ul className="list-unstyled">
              {accessTypes.map((type) => (
                <li key={type}>{type}</li>
              ))}
            </ul>
          </>
        )}

        <RecreationResourceMap
          recResource={recResource}
          mapComponentCssStyles={{
            position: 'relative',
            height: '40vh',
          }}
        />
      </section>
    );
  },
);

export default MapsAndLocation;
