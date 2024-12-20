import { forwardRef } from 'react';

const MapsAndLocation = forwardRef<HTMLElement>((_, ref) => {
  return (
    <section id="maps-and-location" ref={ref}>
      <h2 className="section-heading">Maps and Location</h2>
      <p>Placeholder</p>
    </section>
  );
});

export default MapsAndLocation;
