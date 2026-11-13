import { RecResourceActivitiesSection } from '@/pages/rec-resource-page/components/RecResourceActivitiesSection';
import { RecResourceAdaptiveActivitiesSection } from '@/pages/rec-resource-page/components/RecResourceAdaptiveActivitiesSection';
import { RecResourceFeatureSection } from '@/pages/rec-resource-page/components/RecResourceFeatureSection';
import { RecResourceLowMobilitySection } from '@/pages/rec-resource-page/components/RecResourceLowMobilitySection';
import { isLowMobilityActivity } from '@/pages/rec-resource-page/constants';
import { RecreationActivityDto } from '@/services/recreation-resource-admin/models';
import { useLoaderData, useParams } from '@tanstack/react-router';
import { useMemo } from 'react';
import { Stack } from 'react-bootstrap';

export const RecResourceActivitiesFeaturesPage = () => {
  const { activities, features } = useLoaderData({
    from: '/rec-resource/$id/activities-and-features/',
  });
  const { id: rec_resource_id } = useParams({ from: '/rec-resource/$id' });

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
        (a) =>
          a.is_accessible && !isLowMobilityActivity(a.recreation_activity_code),
      ) ?? [],
    [activities],
  );

  const lowMobilityActivities = useMemo(
    () =>
      (activities as RecreationActivityDto[] | undefined)?.filter((a) =>
        isLowMobilityActivity(a.recreation_activity_code),
      ) ?? [],
    [activities],
  );

  return (
    <Stack direction="vertical" gap={5}>
      <RecResourceActivitiesSection recreationActivities={regularActivities} />
      <RecResourceFeatureSection recreationFeatures={features} />
      <RecResourceAdaptiveActivitiesSection
        recResourceId={rec_resource_id}
        recreationActivities={adaptiveActivities}
      />
      <RecResourceLowMobilitySection
        recreationActivities={lowMobilityActivities}
      />
    </Stack>
  );
};
