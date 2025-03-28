import { forwardRef } from 'react';
import parse from 'html-react-parser';

interface SiteDescriptionProps {
  description: string;
  maintenanceCode?: string;
}

const getMaintenanceDescription = (maintenanceCode: string) => {
  switch (maintenanceCode) {
    case 'U':
      return 'Limited maintenance services are provided at this site. Please respect the environment and pack out what you pack in.';
    case 'M':
      return 'This site is maintained to Recreation Sites & Trails BC standards by partners or contractors.';
    default:
      return '';
  }
};

const SiteDescription = forwardRef<HTMLElement, SiteDescriptionProps>(
  ({ description, maintenanceCode }, ref) => {
    if (!description && !maintenanceCode) return null;

    const maintenanceDescription =
      maintenanceCode && getMaintenanceDescription(maintenanceCode);

    return (
      <section id="site-description" className="rec-resource-section" ref={ref}>
        <h2 className="section-heading">Site Description</h2>
        <p>{parse(description)}</p>

        {maintenanceDescription && (
          <section className="mb-4">
            <h3>Maintenance Standard</h3>
            <p>{maintenanceDescription}</p>
          </section>
        )}
      </section>
    );
  },
);

export default SiteDescription;
