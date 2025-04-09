import { forwardRef } from 'react';
import parse from 'html-react-parser';
import { RecreationResourceDetailDtoMaintenanceStandardCodeEnum } from '@/service/recreation-resource';
import { SectionIds, SectionTitles } from '@/components/rec-resource/enum';

interface SiteDescriptionProps {
  description?: string;
  maintenanceCode?: RecreationResourceDetailDtoMaintenanceStandardCodeEnum;
}

const getMaintenanceDescription = (
  maintenanceCode: RecreationResourceDetailDtoMaintenanceStandardCodeEnum,
) => {
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
      <section
        id={SectionIds.SITE_DESCRIPTION}
        className="rec-resource-section"
        ref={ref}
      >
        <h2 className="section-heading">{SectionTitles.SITE_DESCRIPTION}</h2>
        {description && <p>{parse(description)}</p>}

        {maintenanceDescription && (
          <section className="mb-4">
            <h3>Maintenance type</h3>
            <p>{maintenanceDescription}</p>
          </section>
        )}
      </section>
    );
  },
);

export default SiteDescription;
