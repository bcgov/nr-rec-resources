import { RecResourceActivitiesSection } from '@/pages/rec-resource-page/components/RecResourceActivitiesSection';
import { RecResourceAdaptiveActivitiesSection } from '@/pages/rec-resource-page/components/RecResourceAdaptiveActivitiesSection';
import { RecResourceFeatureSection } from '@/pages/rec-resource-page/components/RecResourceFeatureSection';
import { RecreationActivityDto } from '@/services/recreation-resource-admin/models';
import { useLoaderData } from '@tanstack/react-router';
import { useMemo } from 'react';
import { Stack } from 'react-bootstrap';

export const RecResourceActivitiesFeaturesPage = () => {
  const { activities, features } = useLoaderData({
    from: '/rec-resource/$id/activities-features/',
  });

  const regularActivities = useMemo(
    () =>
      (activities as RecreationActivityDto[] | undefined)?.filter(
        (a) => !a.is_accessible,
      ) ?? [],
    [activities],
  );

  const adaptiveActivities = useMemo(
    () =>
      (activities as RecreationActivityDto[] | undefined)?.filter(
        (a) => a.is_accessible,
      ) ?? [],
    [activities],
  );

  return (
    <Stack direction="vertical" gap={5}>
      <RecResourceActivitiesSection recreationActivities={regularActivities} />
      <RecResourceAdaptiveActivitiesSection
        recreationActivities={adaptiveActivities}
      />
      <RecResourceFeatureSection recreationFeatures={features} />
    </Stack>
  );
};
