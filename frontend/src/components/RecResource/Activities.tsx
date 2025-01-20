import fishingIcon from '@/images/activities/fishing.svg';
import boatLaunchIcon from '@/images/activities/boat-launch.svg';
import canoeingIcon from '@/images/activities/canoeing.svg';
import kayakingIcon from '@/images/activities/kayaking.svg';
import scubaDivingIcon from '@/images/activities/scuba-diving.svg';
import waterskiingIcon from '@/images/activities/waterskiing.svg';
import swimmingIcon from '@/images/activities/swimming.svg';
import picnicAreaIcon from '@/images/activities/picnic-area.svg';
import huntingIcon from '@/images/activities/hunting.svg';
import cavingIcon from '@/images/activities/caving.svg';
import hikingIcon from '@/images/activities/hiking.svg';
import wildlifeViewingIcon from '@/images/activities/wildlife-viewing.svg';
import snowmobilingIcon from '@/images/activities/snowmobiling.svg';
import mountainBikingIcon from '@/images/activities/mountain-biking.svg';
import climbingIcon from '@/images/activities/climbing.svg';
import sailingIcon from '@/images/activities/sailing.svg';
import campingIcon from '@/images/activities/frontcountry-camping.svg';
import viewpointIcon from '@/images/activities/viewpoint.svg';
import horsebackRidingIcon from '@/images/activities/horseback-riding.svg';

import '@/styles/components/activities.scss';

interface ActivityProps {
  activities: { recreation_activity_code: string }[];
}

interface ActivityMap {
  [key: string]: {
    icon: string;
    description: string;
  };
}

const activityMap: ActivityMap = {
  '01': { icon: fishingIcon, description: 'Angling' },
  '02': { icon: boatLaunchIcon, description: 'Boating' },
  '03': { icon: canoeingIcon, description: 'Canoeing' },
  '04': { icon: kayakingIcon, description: 'Kayaking' },
  '05': { icon: scubaDivingIcon, description: 'Scuba Diving or Skin Diving' },
  '06': { icon: waterskiingIcon, description: 'Waterskiing' },
  '07': { icon: swimmingIcon, description: 'Swimming & Bathing' },
  // '08': { icon: beachActivitiesIcon, description: 'Beach Activities' },
  '09': { icon: picnicAreaIcon, description: 'Picnicking' },
  '10': { icon: huntingIcon, description: 'Hunting' },
  '11': { icon: cavingIcon, description: 'Caving' },
  '12': { icon: hikingIcon, description: 'Hiking' },
  // '13': { icon: 'mountaineering', description: 'Mountaineering' },
  // '14': { icon: 'nature-study', description: 'Nature Study' }, -- is this correct?
  // '15': { icon: 'orienteering', description: 'Orienteering' },
  '16': { icon: viewpointIcon, description: 'Viewing' },
  '17': { icon: wildlifeViewingIcon, description: 'Wildlife Viewing' },
  // '18': { icon: 'gathering-and-collecting', description: 'Gathering and Collecting' },
  '19': { icon: horsebackRidingIcon, description: 'Horseback Riding' },
  // '20': { icon: 'atv', description: 'Trailbike Riding (Motorized)' }, -- is this correct?
  // '21': { icon: '4-wheel-driving', description: '4-Wheel Driving' },
  '22': { icon: snowmobilingIcon, description: 'Snowmobiling' },
  // '23': { icon: 'snowshoeing', description: 'Snowshoeing' },
  // '24': { icon: 'skiing', description: 'Skiing' },
  // '25': { icon: 'icefishing', description: 'Icefishing' },
  // '26': { icon: 'other', description: 'Other' },
  '27': { icon: mountainBikingIcon, description: 'Mountain Biking' },
  '28': { icon: climbingIcon, description: 'Climbing' },
  '29': { icon: sailingIcon, description: 'Sailing' },
  // '30': { icon: 'wind-surfing', description: 'Wind Surfing' },
  // '31': { icon: 'rafting', description: 'Rafting' },
  '32': { icon: campingIcon, description: 'Camping' }, // is this correct?
  // '33': { icon: 'ski-touring', description: 'Ski Touring' },
};

const Activities = ({ activities }: ActivityProps) => {
  return (
    <ul className="activities-list">
      {activities.map((activityCode, index: number) => {
        const { recreation_activity_code } = activityCode;
        const activity = activityMap?.[recreation_activity_code];
        if (!activity) return null;
        return (
          <li key={index}>
            <img
              key={index}
              alt={activity.description}
              src={activity.icon}
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
