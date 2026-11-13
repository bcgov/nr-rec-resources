import { RecreationActivityDto } from '@/services/recreation-resource-admin/models';
import { InfoBanner } from '@/pages/rec-resource-page/components/shared/InfoBanner';
import { NotVisibleOnPublicSiteBadge } from '@/pages/rec-resource-page/components/shared/NotVisibleOnPublicSiteBadge';
import {
  BETA_FEATURES_BANNER_TEXT,
  BETA_FEATURES_BANNER_TITLE,
} from '@/utils/helpText';
import { Stack } from 'react-bootstrap';
import { AdaptiveActivityList } from './AdaptiveActivityList';

type RecResourceAdaptiveActivitiesSectionProps = {
  recResourceId: string;
  recreationActivities: RecreationActivityDto[];
};

export const RecResourceAdaptiveActivitiesSection = ({
  recResourceId,
  recreationActivities,
}: RecResourceAdaptiveActivitiesSectionProps) => {
  return (
    <Stack direction="vertical" gap={4}>
      <InfoBanner variant="beta" title={BETA_FEATURES_BANNER_TITLE}>
        {BETA_FEATURES_BANNER_TEXT}
      </InfoBanner>

      <div className="d-flex align-items-center gap-2">
        <h2 className="mb-0">Accessible activities</h2>
        <NotVisibleOnPublicSiteBadge />
      </div>

      {!recreationActivities || recreationActivities.length === 0 ? (
        <div className="text-secondary">No accessible activities assigned.</div>
      ) : (
        <AdaptiveActivityList
          recResourceId={recResourceId}
          recreationActivities={recreationActivities}
        />
      )}
    </Stack>
  );
};
