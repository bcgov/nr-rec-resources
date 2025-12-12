import { MultiSelectField } from '@/components';
import { ROUTE_PATHS } from '@/constants/routes';
import { LinkWithQueryParams } from '@shared/components/link-with-query-params';
import { useLoaderData, useParams } from '@tanstack/react-router';
import { Button, Col, Form, Row, Stack } from 'react-bootstrap';
import { useActivitiesOptions } from './hooks/useActivitiesOptions';
import { useEditActivitiesForm } from './hooks/useEditActivitiesForm';
import { EditActivitiesFormData } from './schemas/editActivities';

/**
 * Edit section for recreation resource activities
 * Allows editing of activities using multi-select
 */
export const RecResourceActivitiesEditSection = () => {
  const { activities } = useLoaderData({
    from: '/rec-resource/$id/activities/edit',
  });
  const { id: rec_resource_id } = useParams({ from: '/rec-resource/$id' });

  const { options, isLoading: optionsLoading } = useActivitiesOptions();

  const { handleSubmit, control, errors, isDirty, updateMutation, onSubmit } =
    useEditActivitiesForm(activities || [], rec_resource_id);

  return (
    <Stack direction="vertical" gap={4}>
      <div className="d-flex justify-content-between align-items-center">
        <h2>Edit Activities</h2>
        <Stack direction="horizontal" gap={2}>
          <LinkWithQueryParams
            to={ROUTE_PATHS.REC_RESOURCE_ACTIVITIES}
            params={{ id: rec_resource_id }}
            className="btn btn-outline-primary"
          >
            Cancel
          </LinkWithQueryParams>
          <Button
            variant="primary"
            onClick={handleSubmit(onSubmit as any)}
            disabled={!isDirty || updateMutation.isPending || optionsLoading}
          >
            {updateMutation.isPending ? 'Saving...' : 'Save'}
          </Button>
        </Stack>
      </div>

      <Form onSubmit={handleSubmit(onSubmit as any)}>
        <Stack direction="vertical" gap={4}>
          <Row className="gy-3">
            <Col xs={12}>
              <MultiSelectField<EditActivitiesFormData>
                name="activity_codes"
                label="Activities"
                options={options}
                placeholder="Search and select activities..."
                control={control}
                errors={errors}
                disabled={optionsLoading}
              />
            </Col>
          </Row>
        </Stack>
      </Form>
    </Stack>
  );
};
