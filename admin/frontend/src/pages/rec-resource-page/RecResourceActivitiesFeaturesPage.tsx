import { RecResourceActivitiesSection } from '@/pages/rec-resource-page/components/RecResourceActivitiesSection';
import { RecResourceFeatureSection } from '@/pages/rec-resource-page/components/RecResourceFeatureSection';
import { useLoaderData } from '@tanstack/react-router';
import { Stack } from 'react-bootstrap';

export const RecResourceActivitiesFeaturesPage = () => {
  const { activities, features } = useLoaderData({
    from: '/rec-resource/$id/activities-features/',
  });

  return (
    <Stack direction="vertical" gap={5}>
      <RecResourceActivitiesSection recreationActivities={activities} />
      <RecResourceFeatureSection recreationFeatures={features} />
    </Stack>
  );
};
