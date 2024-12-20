import { forwardRef } from 'react';

const Camping = forwardRef<HTMLElement>((_, ref) => {
  return (
    <section className="anchor-link" id="camping" ref={ref}>
      <h2 className="section-heading">Camping</h2>
      <p>Placeholder</p>
    </section>
  );
});

export default Camping;
