import { forwardRef } from 'react';
import { RecreationResourceDto } from '@/service/recreation-resource';
import { TrailMap2 } from '@/components/rec-resource/TrailMap/TrailMap2';

interface MapsAndLocationProps {
  accessTypes?: string[];
  recResource: RecreationResourceDto;
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

        <TrailMap2
          recResource={recResource}
          style={{ position: 'relative', height: '500px' }}
        />
      </section>
    );
  },
);

export default MapsAndLocation;
