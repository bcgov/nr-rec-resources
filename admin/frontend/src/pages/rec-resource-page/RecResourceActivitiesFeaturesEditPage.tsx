import { ROUTE_PATHS } from '@/constants/routes';
import { HelpIcon } from '@/components';
import { InfoBanner } from '@/pages/rec-resource-page/components/shared/InfoBanner';
import { NotVisibleOnPublicSiteBadge } from '@/pages/rec-resource-page/components/shared/NotVisibleOnPublicSiteBadge';
import {
  ACTIVITIES_EDIT_HELP_TEXT,
  BETA_FEATURES_BANNER_TEXT,
  BETA_FEATURES_BANNER_TITLE,
  FEATURES_EDIT_HELP_TEXT,
} from '@/utils/helpText';
import {
  RecResourceFeatureEditSection,
  useEditFeaturesForm,
  useFeatureOptions,
} from '@/pages/rec-resource-page/components/RecResourceFeatureSection';
import {
  RecResourceActivitiesEditSection,
  RecResourceAdaptiveActivitiesEditSection,
  RecResourceLowMobilityEditSection,
} from '@/pages/rec-resource-page/components/RecResourceActivitiesSection';
import { useActivitiesOptions } from '@/pages/rec-resource-page/components/RecResourceActivitiesSection/EditSection/hooks/useActivitiesOptions';
import { useAdaptiveActivitiesOptions } from '@/pages/rec-resource-page/components/RecResourceActivitiesSection/EditSection/hooks/useAdaptiveActivitiesOptions';
import { useEditActivitiesForm } from '@/pages/rec-resource-page/components/RecResourceActivitiesSection/EditSection/hooks/useEditActivitiesForm';
import {
  Link,
  useLoaderData,
  useNavigate,
  useParams,
} from '@tanstack/react-router';
import { Button, Col, Form, Row, Stack } from 'react-bootstrap';

export const RecResourceActivitiesFeaturesEditPage = () => {
  const { activities, features } = useLoaderData({
    from: '/rec-resource/$id/activities-features/edit',
  });
  const { id: rec_resource_id } = useParams({ from: '/rec-resource/$id' });
  const navigate = useNavigate();

  const { options: activityOptions, isLoading: activityOptionsLoading } =
    useActivitiesOptions();
  const {
    options: adaptiveOptions,
    lowMobilityOptions,
    isLoading: adaptiveOptionsLoading,
  } = useAdaptiveActivitiesOptions();
  const { options: featureOptions, isLoading: featureOptionsLoading } =
    useFeatureOptions();

  const {
    control: activitiesFormControl,
    errors: activitiesFormErrors,
    isDirty: isActivitiesDirty,
    updateMutation: updateActivitiesMutation,
    handleSubmit: handleSubmitActivities,
    onSubmit: onSubmitActivities,
  } = useEditActivitiesForm(activities || [], rec_resource_id);

  const {
    control: featuresControl,
    errors: featuresErrors,
    isDirty: isFeaturesDirty,
    updateMutation: updateFeaturesMutation,
    handleSubmit: handleSubmitFeatures,
    onSubmit: onSubmitFeatures,
  } = useEditFeaturesForm(features || [], rec_resource_id);

  const onSave = async () => {
    if (isActivitiesDirty) {
      let success = false;
      await handleSubmitActivities(async (data) => {
        success = await onSubmitActivities(data);
      })();
      if (!success) return;
    }

    if (isFeaturesDirty) {
      let success = false;
      await handleSubmitFeatures(async (data) => {
        success = await onSubmitFeatures(data);
      })();
      if (!success) return;
    }

    if (isActivitiesDirty || isFeaturesDirty) {
      navigate({
        to: ROUTE_PATHS.REC_RESOURCE_ACTIVITIES_FEATURES,
        params: { id: rec_resource_id },
      });
    }
  };

  const isSaving =
    updateActivitiesMutation.isPending || updateFeaturesMutation.isPending;
  const hasChanges = isActivitiesDirty || isFeaturesDirty;
  const isLoadingOptions =
    (isActivitiesDirty && (activityOptionsLoading || adaptiveOptionsLoading)) ||
    (isFeaturesDirty && featureOptionsLoading);
  const isSaveDisabled = isSaving || !hasChanges || isLoadingOptions;

  return (
    <Form
      onSubmit={(e) => {
        e.preventDefault();
        void onSave();
      }}
    >
      <Stack direction="vertical" gap={5}>
        <Stack direction="vertical" gap={4}>
          <div className="d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center gap-2">
              <h2 className="mb-0">Activities</h2>
              <HelpIcon id="activities-help" text={ACTIVITIES_EDIT_HELP_TEXT} />
            </div>
            <Stack direction="horizontal" gap={2}>
              <Link
                to={ROUTE_PATHS.REC_RESOURCE_ACTIVITIES_FEATURES}
                params={{ id: rec_resource_id }}
                className="btn btn-outline-primary"
              >
                Cancel
              </Link>
              <Button
                variant="primary"
                onClick={() => void onSave()}
                disabled={isSaveDisabled}
              >
                {isSaving ? 'Saving...' : 'Save'}
              </Button>
            </Stack>
          </div>
          <RecResourceActivitiesEditSection
            control={activitiesFormControl}
            errors={activitiesFormErrors}
            options={activityOptions}
            optionsLoading={activityOptionsLoading}
          />
        </Stack>

        <Stack direction="vertical" gap={4}>
          <div className="d-flex align-items-center gap-2">
            <h2 className="mb-0">Significant resource features</h2>
            <HelpIcon id="features-help" text={FEATURES_EDIT_HELP_TEXT} />
          </div>
          <Row className="gy-2">
            <Col xs={12}>
              <RecResourceFeatureEditSection
                control={featuresControl}
                errors={featuresErrors}
                options={featureOptions}
                optionsLoading={featureOptionsLoading}
              />
            </Col>
          </Row>
        </Stack>

        <Stack direction="vertical" gap={4}>
          <InfoBanner variant="beta" title={BETA_FEATURES_BANNER_TITLE}>
            {BETA_FEATURES_BANNER_TEXT}
          </InfoBanner>
          <div className="d-flex align-items-center gap-2">
            <h2 className="mb-0">Accessible activities</h2>
            <NotVisibleOnPublicSiteBadge />
          </div>
          <RecResourceAdaptiveActivitiesEditSection
            control={activitiesFormControl}
            errors={activitiesFormErrors}
            options={adaptiveOptions}
            optionsLoading={adaptiveOptionsLoading}
          />
        </Stack>

        <Stack direction="vertical" gap={4}>
          <div className="d-flex align-items-center gap-2">
            <h2 className="mb-0">Low mobility access</h2>
            <NotVisibleOnPublicSiteBadge />
          </div>
          <RecResourceLowMobilityEditSection
            control={activitiesFormControl}
            errors={activitiesFormErrors}
            options={lowMobilityOptions}
            optionsLoading={adaptiveOptionsLoading}
          />
        </Stack>
      </Stack>
    </Form>
  );
};
