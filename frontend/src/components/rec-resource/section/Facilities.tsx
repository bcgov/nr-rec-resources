import { forwardRef } from 'react';
import '@/components/rec-resource/section/ThingsToDo.scss';
import { facilityMap } from '@/data/facilitiesIconMap';

interface FacilitiesProps {
  recreation_structure: {
    has_toilet: boolean;
    has_table: boolean;
  };
}

const Facilities = forwardRef<HTMLElement, FacilitiesProps>(
  ({ recreation_structure }, ref) => {
    const facilitiesList = [
      {
        name: 'Tables',
        code: '1',
        available: recreation_structure?.has_table,
      },
      {
        name: 'Toilets',
        code: '2',
        available: recreation_structure?.has_toilet,
      },
    ].filter((facility) => facility.available);

    if (facilitiesList.length === 0) return null;

    return (
      <section id="facilities" ref={ref}>
        <h2 className="section-heading">Facilities</h2>
        <ul className="things-to-do-list">
          {facilitiesList.map(({ name, code }) => {
            const facilityIcon = facilityMap?.[code];
            return (
              <li key={code}>
                {facilityIcon && (
                  <img
                    alt={`${name} icon`}
                    src={facilityIcon}
                    height={36}
                    width={36}
                  />
                )}
                {name}
              </li>
            );
          })}
        </ul>
      </section>
    );
  },
);

export default Facilities;
