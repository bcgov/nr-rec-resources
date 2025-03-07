import { forwardRef } from 'react';
import { RecreationResourceDto } from '@/service/recreation-resource';
import { RecreationResourceMap } from '@/components/rec-resource/RecreationResourceMap';

interface MapsAndLocationProps {
  accessTypes?: string[];
  recResource?: RecreationResourceDto;
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
          mapComponentCssStyles={{ position: 'relative', height: '500px' }}
        />
      </section>
    );
  },
);

export default MapsAndLocation;
