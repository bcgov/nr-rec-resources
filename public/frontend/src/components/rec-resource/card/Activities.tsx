import activityIconMap from '@/data/activityIconMap';
import { MAX_ACTIVITIES_TO_DISPLAY } from '@/components/rec-resource/card/constants';
import { Activity } from '@/components/rec-resource/types';

import '@/components/rec-resource/card/Activities.scss';

interface ActivityProps {
  activities: Activity[];
}

const Activities = ({ activities }: ActivityProps) => {
  return (
    <ul className="activities-list">
      {activities.slice(0, MAX_ACTIVITIES_TO_DISPLAY).map((activity) => {
        const { description, recreation_activity_code } = activity;
        const activityIcon = activityIconMap?.[recreation_activity_code];
        if (!activityIcon) return null;
        return (
          <li key={description} className="activity-icon">
            <img
              alt={`${description} icon`}
              src={activityIcon}
              height={32}
              width={32}
            />
          </li>
        );
      })}
    </ul>
  );
};

export default Activities;
