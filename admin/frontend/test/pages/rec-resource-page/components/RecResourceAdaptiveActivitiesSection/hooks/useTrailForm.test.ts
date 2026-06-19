import { useTrailForm } from '@/pages/rec-resource-page/components/RecResourceAdaptiveActivitiesSection/hooks/useTrailForm';
import { useCreateTrail, useUpdateTrail } from '@/services';
import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/services', () => ({
  useCreateTrail: vi.fn(),
  useUpdateTrail: vi.fn(),
}));

vi.mock('react-hook-form', () => ({
  useForm: vi.fn(() => ({
    control: { _mock: 'control' },
    handleSubmit: vi.fn((fn) => fn),
    reset: vi.fn(),
    formState: { errors: {}, isDirty: false },
  })),
}));

vi.mock('@hookform/resolvers/zod', () => ({
  zodResolver: vi.fn(() => 'mockResolver'),
}));

describe('useTrailForm', () => {
  const mockCreateMutateAsync = vi.fn();
  const mockUpdateMutateAsync = vi.fn();
  const mockOnDone = vi.fn();

  const mockCreateMutation = {
    mutateAsync: mockCreateMutateAsync,
    isPending: false,
  };
  const mockUpdateMutation = {
    mutateAsync: mockUpdateMutateAsync,
    isPending: false,
  };

  const baseProps = {
    recResourceId: 'REC0001',
    activityCode: 34,
    onDone: mockOnDone,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useCreateTrail).mockReturnValue(mockCreateMutation as any);
    vi.mocked(useUpdateTrail).mockReturnValue(mockUpdateMutation as any);
  });

  it('returns create mutation when mode is create', () => {
    const { result } = renderHook(() =>
      useTrailForm({ ...baseProps, mode: 'create' }),
    );

    expect(result.current.mutation).toBe(mockCreateMutation);
  });

  it('returns update mutation when mode is edit', () => {
    const { result } = renderHook(() =>
      useTrailForm({
        ...baseProps,
        mode: 'edit',
        initialTrail: {
          recreation_activity_code_trails_id: 1,
          recreation_activity_code: 34,
          trail_type: null,
          name: 'Existing Trail',
        },
      }),
    );

    expect(result.current.mutation).toBe(mockUpdateMutation);
  });

  it('calls createMutation and onDone on submit in create mode', async () => {
    mockCreateMutateAsync.mockResolvedValue({});

    const { result } = renderHook(() =>
      useTrailForm({ ...baseProps, mode: 'create' }),
    );

    await result.current.onSubmit({
      name: 'New Trail',
      trail_type: 'BLUE',
      description: 'desc',
    });

    expect(mockCreateMutateAsync).toHaveBeenCalledWith({
      recResourceId: 'REC0001',
      recreation_activity_code: 34,
      trail_type: 'BLUE',
      name: 'New Trail',
      description: 'desc',
    });
    expect(mockOnDone).toHaveBeenCalled();
  });

  it('passes null trail_type when undefined in create mode', async () => {
    mockCreateMutateAsync.mockResolvedValue({});

    const { result } = renderHook(() =>
      useTrailForm({ ...baseProps, mode: 'create' }),
    );

    await result.current.onSubmit({
      name: 'Trail',
      trail_type: undefined,
      description: '',
    });

    expect(mockCreateMutateAsync).toHaveBeenCalledWith(
      expect.objectContaining({ trail_type: null, description: undefined }),
    );
  });

  it('calls updateMutation and onDone on submit in edit mode', async () => {
    mockUpdateMutateAsync.mockResolvedValue({});

    const initialTrail = {
      recreation_activity_code_trails_id: 5,
      recreation_activity_code: 34,
      trail_type: 'GREEN' as const,
      name: 'Old Trail',
    };

    const { result } = renderHook(() =>
      useTrailForm({ ...baseProps, mode: 'edit', initialTrail }),
    );

    await result.current.onSubmit({
      name: 'Updated',
      trail_type: 'BLACK',
      description: 'new desc',
    });

    expect(mockUpdateMutateAsync).toHaveBeenCalledWith({
      recResourceId: 'REC0001',
      trailId: 5,
      trail_type: 'BLACK',
      name: 'Updated',
      description: 'new desc',
    });
    expect(mockOnDone).toHaveBeenCalled();
  });

  it('passes null description when empty string in edit mode', async () => {
    mockUpdateMutateAsync.mockResolvedValue({});

    const initialTrail = {
      recreation_activity_code_trails_id: 5,
      recreation_activity_code: 34,
      trail_type: null,
      name: 'Old Trail',
    };

    const { result } = renderHook(() =>
      useTrailForm({ ...baseProps, mode: 'edit', initialTrail }),
    );

    await result.current.onSubmit({
      name: 'Updated',
      trail_type: undefined,
      description: '',
    });

    expect(mockUpdateMutateAsync).toHaveBeenCalledWith(
      expect.objectContaining({ description: null, trail_type: null }),
    );
  });

  it('does not call updateMutation when mode is edit but initialTrail is missing', async () => {
    const { result } = renderHook(() =>
      useTrailForm({ ...baseProps, mode: 'edit' }),
    );

    await result.current.onSubmit({ name: 'Trail', trail_type: null });

    expect(mockUpdateMutateAsync).not.toHaveBeenCalled();
    expect(mockOnDone).toHaveBeenCalled();
  });

  it('exposes control, handleSubmit, errors, isDirty from the form', () => {
    const { result } = renderHook(() =>
      useTrailForm({ ...baseProps, mode: 'create' }),
    );

    expect(result.current.control).toBeDefined();
    expect(result.current.handleSubmit).toBeDefined();
    expect(result.current.errors).toBeDefined();
    expect(typeof result.current.isDirty).toBe('boolean');
  });
});
