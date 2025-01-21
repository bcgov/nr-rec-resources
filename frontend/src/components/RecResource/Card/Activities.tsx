import activityIconMap from '@/data/activityIconMap';
import { Activity } from '@/components/RecResource/types';

import '@/styles/components/Activities.scss';

interface ActivityProps {
  activities: Activity[];
}

const Activities = ({ activities }: ActivityProps) => {
  return (
    <ul className="activities-list">
      {activities.map((activity) => {
        const { description, recreation_activity_code } = activity;
        const activityIcon = activityIconMap?.[recreation_activity_code];
        if (!activityIcon) return null;
        return (
          <li key={description} className="activity-icon">
            <img alt={description} src={activityIcon} height={32} width={32} />
          </li>
        );
      })}
    </ul>
  );
};

export default Activities;
