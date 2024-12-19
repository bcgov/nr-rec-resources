import { forwardRef } from 'react';

interface SiteDescriptionProps {
  description: string;
}

const SiteDescription = forwardRef<HTMLElement, SiteDescriptionProps>(
  ({ description }, ref) => {
    return (
      <section id="site-description" ref={ref}>
        <h2 className="section-heading">Site Description</h2>
        <p>{description}</p>
      </section>
    );
  },
);

export default SiteDescription;
