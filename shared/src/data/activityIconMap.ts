import beachActivitiesIcon from '@shared/assets/icons/activities/beach-activities.svg';
import boatLaunchIcon from '@shared/assets/icons/activities/boat-launch.svg';
import campingIcon from '@shared/assets/icons/activities/frontcountry-camping.svg';
import canoeingIcon from '@shared/assets/icons/activities/canoeing.svg';
import cavingIcon from '@shared/assets/icons/activities/caving.svg';
import climbingIcon from '@shared/assets/icons/activities/climbing.svg';
import fishingIcon from '@shared/assets/icons/activities/fishing.svg';
import fourWheelDrivingIcon from '@shared/assets/icons/activities/four-wheel-driving.svg';
import hikingIcon from '@shared/assets/icons/activities/hiking.svg';
import horsebackRidingIcon from '@shared/assets/icons/activities/horseback-riding.svg';
import huntingIcon from '@shared/assets/icons/activities/hunting.svg';
import icefishingIcon from '@shared/assets/icons/activities/ice-fishing.svg';
import kayakingIcon from '@shared/assets/icons/activities/kayaking.svg';
import mountainBikingIcon from '@shared/assets/icons/activities/mountain-biking.svg';
import mountaineeringIcon from '@shared/assets/icons/activities/mountaineering.svg';
import natureStudyIcon from '@shared/assets/icons/activities/nature-study.svg';
import orienteeringIcon from '@shared/assets/icons/activities/orienteering.svg';
import picnicAreaIcon from '@shared/assets/icons/activities/picnic-area.svg';
import raftingIcon from '@shared/assets/icons/activities/rafting.svg';
import sailingIcon from '@shared/assets/icons/activities/sailing.svg';
import scubaDivingIcon from '@shared/assets/icons/activities/scuba-diving.svg';
import skiingIcon from '@shared/assets/icons/activities/skiing.svg';
import skiTouringIcon from '@shared/assets/icons/activities/ski-touring.svg';
import snowmobilingIcon from '@shared/assets/icons/activities/snowmobiling.svg';
import snowshoeingIcon from '@shared/assets/icons/activities/snowshoeing.svg';
import swimmingIcon from '@shared/assets/icons/activities/swimming.svg';
import trailBikeRidingIcon from '@shared/assets/icons/activities/trail-bike-motorized.svg';
import viewpointIcon from '@shared/assets/icons/activities/viewpoint.svg';
import waterskiingIcon from '@shared/assets/icons/activities/waterskiing.svg';
import wildlifeViewingIcon from '@shared/assets/icons/activities/wildlife-viewing.svg';
import windSurfingIcon from '@shared/assets/icons/activities/wind-surfing.svg';
import notFoundIcon from '@shared/assets/icons/activities/not-found.svg';

interface ActivityMap {
  [key: string]: string;
}

const activityIconMap: ActivityMap = {
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

// Includes all activities including ones not for display on public site
const activityIconMapFull: ActivityMap = {
  ...activityIconMap,
  '10': huntingIcon,
  '18': notFoundIcon, // gatheringAndCollectingIcon,
  '26': notFoundIcon, // otherIcon,
};

export { activityIconMap, activityIconMapFull };
