import { forwardRef } from 'react';

interface CampingProps {
  campsite_count: number;
}

const Camping = forwardRef<HTMLElement, CampingProps>(
  ({ campsite_count }, ref) => {
    return (
      <section className="anchor-link" id="camping" ref={ref}>
        <h2 className="section-heading">Camping</h2>
        <p>Number of Campsites: {campsite_count}</p>
      </section>
    );
  },
);
export default Camping;
