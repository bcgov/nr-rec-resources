import { forwardRef } from 'react';
import '@/components/rec-resource/section/ThingsToDo.scss';
import { SectionIds, SectionTitles } from '@/components/rec-resource/enum';
import blueIcon from '@/images/icons/trails/blue.svg';
import greenIcon from '@/images/icons/trails/green.svg';
import blackIcon from '@/images/icons/trails/black.svg';

interface AccessibleRecreationActivity {
  accessible_recreation_activity: {
    description: string;
    details: string;
    recreation_activity_trails?: {
      description: string;
      name: string;
      trail_type: string;
    }[];
  }[];
}

const getIconForTrailType = (trailType: string) => {
  switch (trailType) {
    case 'GREEN':
      return greenIcon;
    case 'BLUE':
      return blueIcon;
    case 'BLACK':
      return blackIcon;
    default:
      return blueIcon;
  }
};

const AccessibleActivities = forwardRef<
  HTMLElement,
  AccessibleRecreationActivity
>(({ accessible_recreation_activity }, ref) => {
  const headingId = 'accessible-recreation-heading';
  return (
    <section
      id={SectionIds.ACCESSIBLE_RECREATION}
      ref={ref}
      aria-labelledby={headingId}
    >
      <h2 className="section-heading">{SectionTitles.ACCESSIBLE_RECREATION}</h2>
      {accessible_recreation_activity.map((activity) => {
        return (
          <>
            <section className="mb-4">
              <h3>{activity.description}</h3>
              <p>{activity.details}</p>
              {activity.recreation_activity_trails && (
                <div>
                  {activity.recreation_activity_trails.map((trail) => (
                    <div className="row" key={trail.name}>
                      <div className="col-sm-1">
                        <img
                          src={getIconForTrailType(trail.trail_type)}
                          alt="Trail difficulty icon"
                          height={48}
                          width={48}
                        />
                      </div>
                      <div className="col-sm">
                        <h5>{trail.name}</h5>
                        <p>{trail.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </>
        );
      })}
    </section>
  );
});

export default AccessibleActivities;
