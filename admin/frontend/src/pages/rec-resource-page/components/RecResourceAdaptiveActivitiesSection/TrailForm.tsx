import { SelectField } from '@/components/form';
import { RecreationTrailDto } from '@/services/recreation-resource-admin/models';
import { Button, Form, Stack } from 'react-bootstrap';
import { Controller } from 'react-hook-form';
import { useTrailForm } from './hooks/useTrailForm';
import { TRAIL_TYPE_OPTIONS, TrailFormData } from './schemas/trailForm';

type TrailFormMode = 'create' | 'edit';

export const TrailForm = ({
  recResourceId,
  activityCode,
  mode,
  initialTrail,
  onDone,
}: {
  recResourceId: string;
  activityCode: number;
  mode: TrailFormMode;
  initialTrail?: RecreationTrailDto;
  onDone: () => void;
}) => {
  const { control, handleSubmit, errors, isDirty, mutation, onSubmit } =
    useTrailForm({ recResourceId, activityCode, mode, initialTrail, onDone });

  const submitLabel =
    mode === 'create'
      ? mutation.isPending
        ? 'Adding trail...'
        : 'Add trail'
      : mutation.isPending
        ? 'Saving...'
        : 'Save changes';

  return (
    <Form onSubmit={handleSubmit(onSubmit)}>
      <Stack direction="vertical" gap={4}>
        <SelectField<TrailFormData>
          name="trail_type"
          label="Trail difficulty"
          placeholder="Select difficulty..."
          options={TRAIL_TYPE_OPTIONS.map((o) => ({
            id: o.id,
            label: o.label,
          }))}
          control={control}
          errors={errors}
        />

        <Form.Group controlId="trail-name">
          <Form.Label>Trail name *</Form.Label>
          <Controller
            name="name"
            control={control}
            render={({ field }) => (
              <Form.Control
                {...field}
                placeholder="e.g. Talladega Knight"
                maxLength={120}
                isInvalid={!!errors.name}
              />
            )}
          />
          <Form.Control.Feedback type="invalid">
            {errors.name?.message}
          </Form.Control.Feedback>
        </Form.Group>

        <Form.Group controlId="trail-description">
          <Form.Label>Description</Form.Label>
          <Controller
            name="description"
            control={control}
            render={({ field }) => (
              <Form.Control
                {...field}
                as="textarea"
                rows={4}
                placeholder="Describe the trail, its features, and any accessibility notes..."
                isInvalid={!!errors.description}
              />
            )}
          />
          <Form.Control.Feedback type="invalid">
            {errors.description?.message}
          </Form.Control.Feedback>
        </Form.Group>

        <div className="d-flex justify-content-end">
          <Button
            variant="primary"
            type="submit"
            disabled={!isDirty || mutation.isPending}
          >
            {submitLabel}
          </Button>
        </div>
      </Stack>
    </Form>
  );
};
