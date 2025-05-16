import beachActivitiesIcon from '@/images/activities/beach-activities.svg';
import boatLaunchIcon from '@/images/activities/boat-launch.svg';
import campingIcon from '@/images/activities/frontcountry-camping.svg';
import canoeingIcon from '@/images/activities/canoeing.svg';
import cavingIcon from '@/images/activities/caving.svg';
import climbingIcon from '@/images/activities/climbing.svg';
import fishingIcon from '@/images/activities/fishing.svg';
import fourWheelDrivingIcon from '@/images/activities/four-wheel-driving.svg';
import hikingIcon from '@/images/activities/hiking.svg';
import horsebackRidingIcon from '@/images/activities/horseback-riding.svg';
import icefishingIcon from '@/images/activities/ice-fishing.svg';
import kayakingIcon from '@/images/activities/kayaking.svg';
import mountainBikingIcon from '@/images/activities/mountain-biking.svg';
import mountaineeringIcon from '@/images/activities/mountaineering.svg';
import natureStudyIcon from '@/images/activities/nature-study.svg';
import orienteeringIcon from '@/images/activities/orienteering.svg';
import picnicAreaIcon from '@/images/activities/picnic-area.svg';
import raftingIcon from '@/images/activities/rafting.svg';
import sailingIcon from '@/images/activities/sailing.svg';
import scubaDivingIcon from '@/images/activities/scuba-diving.svg';
import skiingIcon from '@/images/activities/skiing.svg';
import skiTouringIcon from '@/images/activities/ski-touring.svg';
import snowmobilingIcon from '@/images/activities/snowmobiling.svg';
import snowshoeingIcon from '@/images/activities/snowshoeing.svg';
import swimmingIcon from '@/images/activities/swimming.svg';
import trailBikeRidingIcon from '@/images/activities/trail-bike-motorized.svg';
import viewpointIcon from '@/images/activities/viewpoint.svg';
import waterskiingIcon from '@/images/activities/waterskiing.svg';
import wildlifeViewingIcon from '@/images/activities/wildlife-viewing.svg';
import windSurfingIcon from '@/images/activities/wind-surfing.svg';

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
  '8': beachActivitiesIcon,
  '9': picnicAreaIcon,
  // '10': huntingIcon,
  '11': cavingIcon,
  '12': hikingIcon,
  '13': mountaineeringIcon,
  '14': natureStudyIcon,
  '15': orienteeringIcon,
  '16': viewpointIcon,
  '17': wildlifeViewingIcon,
  // '18': gatheringAndCollectingIcon,
  '19': horsebackRidingIcon,
  '20': trailBikeRidingIcon,
  '21': fourWheelDrivingIcon,
  '22': snowmobilingIcon,
  '23': snowshoeingIcon,
  '24': skiingIcon,
  '25': icefishingIcon,
  // '26': otherIcon,
  '27': mountainBikingIcon,
  '28': climbingIcon,
  '29': sailingIcon,
  '30': windSurfingIcon,
  '31': raftingIcon,
  '32': campingIcon,
  '33': skiTouringIcon,
};

export default activityMap;
