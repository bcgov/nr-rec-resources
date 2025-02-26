import { forwardRef } from 'react';

interface MapsAndLocationProps {
  accessTypes?: string[];
}

const MapsAndLocation = forwardRef<HTMLElement, MapsAndLocationProps>(
  ({ accessTypes }, ref) => {
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
      </section>
    );
  },
);

export default MapsAndLocation;
