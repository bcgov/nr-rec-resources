import { RecResourceActivitiesSection } from '@/pages/rec-resource-page/components/RecResourceActivitiesSection';
import { useLoaderData } from '@tanstack/react-router';

export const RecResourceActivitiesPage = () => {
  const { activities } = useLoaderData({
    from: '/rec-resource/$id/activities/',
  });

  return <RecResourceActivitiesSection recreationActivities={activities} />;
};
