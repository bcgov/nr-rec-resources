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

interface ActivityMap {
  [key: string]: string;
}

const activityMap: ActivityMap = {
  '1': fishingIcon,
  '2': boatLaunchIcon,
  '3': canoeingIcon,
  '4': kayakingIcon,
  '5': scubaDivingIcon,
  '6': waterskiingIcon,
  '7': swimmingIcon,
  // '8': beachActivitiesIcon,
  '9': picnicAreaIcon,
  '10': huntingIcon,
  '11': cavingIcon,
  '12': hikingIcon,
  // '13': mountaineeringIcon,
  // '14': natureStudyIcon,
  // '15': orienteeringIcon,
  '16': viewpointIcon,
  '17': wildlifeViewingIcon,
  // '18': gatheringAndCollectingIcon,
  '19': horsebackRidingIcon,
  // '20': atvIcon, // Trail Bike Riding - Motorized
  // '21': fourWheelDrivingIcon,
  '22': snowmobilingIcon,
  // '23': snowshoeingIcon,
  // '24': skiingIcon,
  // '25': icefishingIcon,
  // '26': otherIcon,
  '27': mountainBikingIcon,
  '28': climbingIcon,
  '29': sailingIcon,
  //'30': windSurfingIcon,
  // '31': raftingIcon,
  '32': campingIcon,
  // '33': skiTouringIcon,
};

export default activityMap;
