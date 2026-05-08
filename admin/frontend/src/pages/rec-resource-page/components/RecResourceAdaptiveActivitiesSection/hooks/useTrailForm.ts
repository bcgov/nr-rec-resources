import { useCreateTrail, useUpdateTrail } from '@/services';
import { RecreationTrailDto } from '@/services/recreation-resource-admin/models';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { TrailFormData, trailFormSchema } from '../schemas/trailForm';

type TrailFormMode = 'create' | 'edit';

export function useTrailForm({
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
}) {
  const createMutation = useCreateTrail();
  const updateMutation = useUpdateTrail();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<TrailFormData>({
    resolver: zodResolver(trailFormSchema),
    defaultValues: {
      trail_type:
        (initialTrail?.trail_type as TrailFormData['trail_type']) || undefined,
      name: initialTrail?.name ?? '',
      description: initialTrail?.description ?? '',
    },
    mode: 'onChange',
  });

  const onSubmit = async (data: TrailFormData) => {
    if (mode === 'create') {
      await createMutation.mutateAsync({
        recResourceId,
        recreation_activity_code: activityCode,
        trail_type: data.trail_type ?? null,
        name: data.name,
        description: data.description || undefined,
      });
    } else if (initialTrail) {
      await updateMutation.mutateAsync({
        recResourceId,
        trailId: initialTrail.recreation_activity_code_trails_id,
        trail_type: data.trail_type ?? null,
        name: data.name,
        description: data.description || null,
      });
    }
    reset();
    onDone();
  };

  const mutation = mode === 'create' ? createMutation : updateMutation;

  return { control, handleSubmit, errors, isDirty, mutation, onSubmit };
}
