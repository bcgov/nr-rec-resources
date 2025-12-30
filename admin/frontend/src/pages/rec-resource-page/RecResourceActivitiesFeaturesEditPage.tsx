import { ROUTE_PATHS } from '@/constants/routes';
import {
  RecResourceFeatureEditSection,
  useEditFeaturesForm,
  useFeatureOptions,
} from '@/pages/rec-resource-page/components/RecResourceFeatureSection';
import { RecResourceActivitiesEditSection } from '@/pages/rec-resource-page/components/RecResourceActivitiesSection';
import { useActivitiesOptions } from '@/pages/rec-resource-page/components/RecResourceActivitiesSection/EditSection/hooks/useActivitiesOptions';
import { useEditActivitiesForm } from '@/pages/rec-resource-page/components/RecResourceActivitiesSection/EditSection/hooks/useEditActivitiesForm';
import { LinkWithQueryParams } from '@shared/components/link-with-query-params';
import { useNavigateWithQueryParams } from '@shared/hooks';
import { useLoaderData, useParams } from '@tanstack/react-router';
import { Button, Col, Form, Row, Stack } from 'react-bootstrap';

export const RecResourceActivitiesFeaturesEditPage = () => {
  const { activities, features } = useLoaderData({
    from: '/rec-resource/$id/activities-features/edit',
  });
  const { id: rec_resource_id } = useParams({ from: '/rec-resource/$id' });
  const { navigate } = useNavigateWithQueryParams();

  const { options: activityOptions, isLoading: activityOptionsLoading } =
    useActivitiesOptions();
  const { options: featureOptions, isLoading: featureOptionsLoading } =
    useFeatureOptions();

  const {
    control: activitiesControl,
    errors: activitiesErrors,
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
    (isActivitiesDirty && activityOptionsLoading) ||
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
            <h2>Activities</h2>
            <Stack direction="horizontal" gap={2}>
              <LinkWithQueryParams
                to={ROUTE_PATHS.REC_RESOURCE_ACTIVITIES_FEATURES}
                params={{ id: rec_resource_id }}
                className="btn btn-outline-primary"
              >
                Cancel
              </LinkWithQueryParams>
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
            control={activitiesControl}
            errors={activitiesErrors}
            options={activityOptions}
            optionsLoading={activityOptionsLoading}
          />
        </Stack>

        <Stack direction="vertical" gap={4}>
          <div className="d-flex justify-content-between align-items-center">
            <h2>Significant resource features</h2>
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
      </Stack>
    </Form>
  );
};
