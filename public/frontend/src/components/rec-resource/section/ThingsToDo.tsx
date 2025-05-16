import { forwardRef } from 'react';
import activityIconMap from '@/data/activityIconMap';
import { Activity } from '@/components/rec-resource/types';
import { SectionIds, SectionTitles } from '@/components/rec-resource/enum';
import '@/components/rec-resource/section/ThingsToDo.scss';

interface ThingsToDoProps {
  activities: Activity[];
}

const ThingsToDo = forwardRef<HTMLElement, ThingsToDoProps>(
  ({ activities }, ref) => {
    return (
      <section id={SectionIds.THINGS_TO_DO} ref={ref}>
        <h2 className="section-heading">{SectionTitles.THINGS_TO_DO}</h2>
        <ul className="things-to-do-list">
          {activities.map((activity) => {
            const { description, recreation_activity_code } = activity;
            const activityIcon = activityIconMap?.[recreation_activity_code];
            if (!activityIcon) return null;
            return (
              <li key={description}>
                <img
                  alt={`${description} icon`}
                  src={activityIcon}
                  height={36}
                  width={36}
                />
                {description}
              </li>
            );
          })}
        </ul>
      </section>
    );
  },
);

export default ThingsToDo;
