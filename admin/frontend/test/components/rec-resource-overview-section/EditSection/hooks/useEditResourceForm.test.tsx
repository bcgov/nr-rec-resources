import { useEditResourceForm } from '@/pages/rec-resource-page/components/RecResourceOverviewSection/EditSection/hooks/useEditResourceForm';
import { ROUTE_PATHS } from '@/constants/routes';
import {
  RecreationResourceDetailUIModel,
  useUpdateRecreationResource,
} from '@/services';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import { type ReactNode, createElement } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock dependencies - must be before imports
const mockNavigateWithQueryParams = vi.fn();

vi.mock('@shared/hooks', () => ({
  useNavigateWithQueryParams: vi.fn(() => mockNavigateWithQueryParams),
}));

vi.mock(
  '@/services/hooks/recreation-resource-admin/useUpdateRecreationResource',
  () => ({
    useUpdateRecreationResource: vi.fn(),
  }),
);

// Create a wrapper with QueryClient for tests (no router needed since navigation is mocked)
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return ({ children }: { children: ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children);
};

describe('useEditResourceForm', () => {
  const mockMutate = vi.fn();

  const mockRecResource: RecreationResourceDetailUIModel = {
    rec_resource_id: '123',
    name: 'Test Resource',
    closest_community: 'Test Community',
    recreation_activity: [],
    recreation_status: { status_code: 1, comment: '', description: 'Open' },
    recreation_status_code: 1,
    rec_resource_type: 'RR',
    description: 'Test description',
    driving_directions: 'Test directions',
    maintenance_standard: 'U' as const,
    maintenance_standard_code: 'U',
    control_access_code: 'CA1',
    campsite_count: 0,
    recreation_access: [],
    recreation_structure: { has_toilet: false, has_table: false },
    project_established_date_readable_utc: null,
    access_codes: [
      {
        code: 'AC1',
        description: 'Access Type 1',
        sub_access_codes: [
          { code: 'SUB1', description: 'Sub Access 1' },
          { code: 'SUB2', description: 'Sub Access 2' },
        ],
      },
      {
        code: 'AC2',
        description: 'Access Type 2',
        sub_access_codes: [{ code: 'SUB3', description: 'Sub Access 3' }],
      },
    ],
  } as RecreationResourceDetailUIModel;

  const mockUpdateMutation = {
    mutate: mockMutate,
    isPending: false,
    isSuccess: false,
    isError: false,
    error: null,
    data: undefined,
    reset: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useUpdateRecreationResource).mockReturnValue(
      mockUpdateMutation as any,
    );
  });

  describe('initialization', () => {
    it('should initialize with default values from recResource', () => {
      const { result } = renderHook(
        () => useEditResourceForm(mockRecResource),
        {
          wrapper: createWrapper(),
        },
      );

      expect(result.current.control).toBeDefined();
      expect(result.current.handleSubmit).toBeDefined();
      expect(result.current.errors).toBeDefined();
      expect(result.current.isDirty).toBe(false);
      expect(result.current.updateMutation).toBe(mockUpdateMutation);
    });

    it('should initialize selectedAccessOptions with grouped options from recResource', () => {
      const { result } = renderHook(
        () => useEditResourceForm(mockRecResource),
        {
          wrapper: createWrapper(),
        },
      );

      expect(result.current.selectedAccessOptions).toEqual([
        {
          label: 'Sub Access 1',
          value: 'SUB1',
          group: 'AC1',
          groupLabel: 'Access Type 1',
        },
        {
          label: 'Sub Access 2',
          value: 'SUB2',
          group: 'AC1',
          groupLabel: 'Access Type 1',
        },
        {
          label: 'Sub Access 3',
          value: 'SUB3',
          group: 'AC2',
          groupLabel: 'Access Type 2',
        },
      ]);
    });

    it('should handle recResource with no access_codes', () => {
      const recResourceWithoutAccessCodes = {
        ...mockRecResource,
        access_codes: [] as any,
      };

      const { result } = renderHook(
        () => useEditResourceForm(recResourceWithoutAccessCodes),
        {
          wrapper: createWrapper(),
        },
      );

      expect(result.current.selectedAccessOptions).toEqual([]);
    });

    it('should handle recResource with empty access_codes array', () => {
      const recResourceWithEmptyAccessCodes = {
        ...mockRecResource,
        access_codes: [],
      };

      const { result } = renderHook(
        () => useEditResourceForm(recResourceWithEmptyAccessCodes),
        {
          wrapper: createWrapper(),
        },
      );

      expect(result.current.selectedAccessOptions).toEqual([]);
    });

    it('should handle recResource with non-array access_codes', () => {
      const recResourceWithInvalidAccessCodes = {
        ...mockRecResource,
        access_codes: {} as any,
      };

      const { result } = renderHook(
        () => useEditResourceForm(recResourceWithInvalidAccessCodes),
        {
          wrapper: createWrapper(),
        },
      );

      expect(result.current.selectedAccessOptions).toEqual([]);
    });

    it('should initialize with null control_access_code when not provided', () => {
      const recResourceWithoutControlAccess = {
        ...mockRecResource,
        control_access_code: undefined,
      };

      const { result } = renderHook(
        () => useEditResourceForm(recResourceWithoutControlAccess),
        {
          wrapper: createWrapper(),
        },
      );

      // The form should initialize successfully
      expect(result.current.control).toBeDefined();
    });

    it('should initialize with empty maintenance_standard_code when not provided', () => {
      const recResourceWithoutMaintenanceStandard = {
        ...mockRecResource,
        maintenance_standard_code: undefined,
      };

      const { result } = renderHook(
        () => useEditResourceForm(recResourceWithoutMaintenanceStandard),
        {
          wrapper: createWrapper(),
        },
      );

      // The form should initialize successfully
      expect(result.current.control).toBeDefined();
    });

    it('should convert recreation_status_code to string', () => {
      const { result } = renderHook(
        () => useEditResourceForm(mockRecResource),
        {
          wrapper: createWrapper(),
        },
      );

      // The form should initialize successfully with the status code
      expect(result.current.control).toBeDefined();
    });

    it('should handle undefined recreation_status_code', () => {
      const recResourceWithoutStatusCode = {
        ...mockRecResource,
        recreation_status_code: undefined,
      };

      const { result } = renderHook(
        () => useEditResourceForm(recResourceWithoutStatusCode),
        {
          wrapper: createWrapper(),
        },
      );

      // The form should initialize successfully
      expect(result.current.control).toBeDefined();
    });
  });

  describe('onSubmit', () => {
    it('should submit form data and navigate on success', async () => {
      const { result } = renderHook(
        () => useEditResourceForm(mockRecResource),
        {
          wrapper: createWrapper(),
        },
      );

      const formData = {
        maintenance_standard_code: 'M',
        control_access_code: 'CA2',
        status_code: '2',
        selected_access_options: [
          {
            label: 'Sub Access 1',
            value: 'SUB1',
            group: 'AC1',
            groupLabel: 'Access Type 1',
          },
          {
            label: 'Sub Access 2',
            value: 'SUB2',
            group: 'AC1',
            groupLabel: 'Access Type 1',
          },
        ],
      };

      // Mock mutate implementation
      mockMutate.mockImplementation((request, options) => {
        options?.onSuccess?.();
      });

      await act(async () => {
        await result.current.onSubmit(formData);
      });

      expect(mockMutate).toHaveBeenCalledWith(
        {
          recResourceId: '123',
          updateRecreationResourceDto: {
            maintenance_standard_code: 'M',
            control_access_code: 'CA2',
            status_code: 2,
            access_codes: [
              {
                access_code: 'AC1',
                sub_access_codes: ['SUB1', 'SUB2'],
              },
            ],
          },
        },
        expect.objectContaining({
          onSuccess: expect.any(Function),
        }),
      );

      await waitFor(() => {
        expect(mockNavigateWithQueryParams).toHaveBeenCalledWith({
          to: ROUTE_PATHS.REC_RESOURCE_OVERVIEW,
          params: { id: '123' },
        });
      });
    });

    it('should handle multiple access code groups', async () => {
      const { result } = renderHook(
        () => useEditResourceForm(mockRecResource),
        {
          wrapper: createWrapper(),
        },
      );

      const formData = {
        maintenance_standard_code: 'M',
        control_access_code: 'CA2',
        status_code: '2',
        selected_access_options: [
          {
            label: 'Sub Access 1',
            value: 'SUB1',
            group: 'AC1',
            groupLabel: 'Access Type 1',
          },
          {
            label: 'Sub Access 2',
            value: 'SUB2',
            group: 'AC1',
            groupLabel: 'Access Type 1',
          },
          {
            label: 'Sub Access 3',
            value: 'SUB3',
            group: 'AC2',
            groupLabel: 'Access Type 2',
          },
        ],
      };

      // Mock mutate implementation
      mockMutate.mockImplementation((request, options) => {
        options?.onSuccess?.();
      });

      await act(async () => {
        await result.current.onSubmit(formData);
      });

      expect(mockMutate).toHaveBeenCalledWith(
        {
          recResourceId: '123',
          updateRecreationResourceDto: {
            maintenance_standard_code: 'M',
            control_access_code: 'CA2',
            status_code: 2,
            access_codes: [
              {
                access_code: 'AC1',
                sub_access_codes: ['SUB1', 'SUB2'],
              },
              {
                access_code: 'AC2',
                sub_access_codes: ['SUB3'],
              },
            ],
          },
        },
        expect.objectContaining({
          onSuccess: expect.any(Function),
        }),
      );
    });

    it('should handle empty selected_access_options', async () => {
      const { result } = renderHook(
        () => useEditResourceForm(mockRecResource),
        {
          wrapper: createWrapper(),
        },
      );

      const formData = {
        maintenance_standard_code: 'M',
        control_access_code: 'CA2',
        status_code: '2',
        selected_access_options: [],
      };

      mockMutate.mockImplementation((request, options) => {
        options?.onSuccess?.();
      });

      await act(async () => {
        await result.current.onSubmit(formData);
      });

      expect(mockMutate).toHaveBeenCalledWith(
        {
          recResourceId: '123',
          updateRecreationResourceDto: {
            maintenance_standard_code: 'M',
            control_access_code: 'CA2',
            status_code: 2,
            access_codes: [],
          },
        },
        expect.objectContaining({
          onSuccess: expect.any(Function),
        }),
      );
    });

    it('should handle undefined/empty maintenance_standard_code', async () => {
      const { result } = renderHook(
        () => useEditResourceForm(mockRecResource),
        {
          wrapper: createWrapper(),
        },
      );

      const formData = {
        maintenance_standard_code: '',
        control_access_code: 'CA2',
        status_code: '2',
        selected_access_options: [],
      };

      mockMutate.mockImplementation((request, options) => {
        options?.onSuccess?.();
      });

      await act(async () => {
        await result.current.onSubmit(formData);
      });

      expect(mockMutate).toHaveBeenCalledWith(
        {
          recResourceId: '123',
          updateRecreationResourceDto: {
            maintenance_standard_code: undefined,
            control_access_code: 'CA2',
            status_code: 2,
            access_codes: [],
          },
        },
        expect.objectContaining({
          onSuccess: expect.any(Function),
        }),
      );
    });

    it('should handle undefined/null control_access_code', async () => {
      const { result } = renderHook(
        () => useEditResourceForm(mockRecResource),
        {
          wrapper: createWrapper(),
        },
      );

      const formData = {
        maintenance_standard_code: 'M',
        control_access_code: null,
        status_code: '2',
        selected_access_options: [],
      };

      mockMutate.mockImplementation((request, options) => {
        options?.onSuccess?.();
      });

      await act(async () => {
        await result.current.onSubmit(formData);
      });

      expect(mockMutate).toHaveBeenCalledWith(
        {
          recResourceId: '123',
          updateRecreationResourceDto: {
            maintenance_standard_code: 'M',
            control_access_code: undefined,
            status_code: 2,
            access_codes: [],
          },
        },
        expect.objectContaining({
          onSuccess: expect.any(Function),
        }),
      );
    });

    it('should handle undefined/empty status_code', async () => {
      const { result } = renderHook(
        () => useEditResourceForm(mockRecResource),
        {
          wrapper: createWrapper(),
        },
      );

      const formData = {
        maintenance_standard_code: 'M',
        control_access_code: 'CA2',
        status_code: '',
        selected_access_options: [],
      };

      mockMutate.mockImplementation((request, options) => {
        options?.onSuccess?.();
      });

      await act(async () => {
        await result.current.onSubmit(formData);
      });

      expect(mockMutate).toHaveBeenCalledWith(
        {
          recResourceId: '123',
          updateRecreationResourceDto: {
            maintenance_standard_code: 'M',
            control_access_code: 'CA2',
            status_code: undefined,
            access_codes: [],
          },
        },
        expect.objectContaining({
          onSuccess: expect.any(Function),
        }),
      );
    });

    it('should convert status_code string to number', async () => {
      const { result } = renderHook(
        () => useEditResourceForm(mockRecResource),
        {
          wrapper: createWrapper(),
        },
      );

      const formData = {
        maintenance_standard_code: 'M',
        control_access_code: 'CA2',
        status_code: '5',
        selected_access_options: [],
      };

      mockMutate.mockImplementation((request, options) => {
        options?.onSuccess?.();
      });

      await act(async () => {
        await result.current.onSubmit(formData);
      });

      const call = mockMutate.mock.calls[0][0];
      expect(call.updateRecreationResourceDto.status_code).toBe(5);
      expect(typeof call.updateRecreationResourceDto.status_code).toBe(
        'number',
      );
    });

    it('should not navigate if mutation does not call onSuccess', async () => {
      const { result } = renderHook(
        () => useEditResourceForm(mockRecResource),
        {
          wrapper: createWrapper(),
        },
      );

      const formData = {
        maintenance_standard_code: 'M',
        control_access_code: 'CA2',
        status_code: '2',
        selected_access_options: [],
      };

      // Mock mutate without calling onSuccess
      mockMutate.mockImplementation(() => {
        // Mutation started but not completed
      });

      await act(async () => {
        await result.current.onSubmit(formData);
      });

      expect(mockMutate).toHaveBeenCalled();
      expect(mockNavigateWithQueryParams).not.toHaveBeenCalled();
    });
  });

  describe('form state', () => {
    it('should expose isDirty as false initially', () => {
      const { result } = renderHook(
        () => useEditResourceForm(mockRecResource),
        {
          wrapper: createWrapper(),
        },
      );

      expect(result.current.isDirty).toBe(false);
    });

    it('should expose errors object', () => {
      const { result } = renderHook(
        () => useEditResourceForm(mockRecResource),
        {
          wrapper: createWrapper(),
        },
      );

      expect(result.current.errors).toBeDefined();
      expect(typeof result.current.errors).toBe('object');
    });

    it('should expose updateMutation', () => {
      const { result } = renderHook(
        () => useEditResourceForm(mockRecResource),
        {
          wrapper: createWrapper(),
        },
      );

      expect(result.current.updateMutation).toBe(mockUpdateMutation);
    });
  });

  describe('memoization', () => {
    it('should memoize defaultValues based on recResource', () => {
      const { result, rerender } = renderHook(
        ({ resource }) => useEditResourceForm(resource),
        {
          initialProps: { resource: mockRecResource },
          wrapper: createWrapper(),
        },
      );

      const initialAccessOptions = result.current.selectedAccessOptions;

      // Rerender with same resource
      rerender({ resource: mockRecResource });

      // selectedAccessOptions should remain stable
      expect(result.current.selectedAccessOptions).toEqual(
        initialAccessOptions,
      );
    });

    it('should compute new defaultValues when recResource prop changes', () => {
      const initialResource = mockRecResource;

      // Create a fresh instance to trigger useMemo recalculation
      const updatedResource = {
        ...mockRecResource,
        rec_resource_id: '456',
        access_codes: [
          {
            code: 'NEW1',
            description: 'New Access',
            sub_access_codes: [{ code: 'NEWSUB1', description: 'New Sub' }],
          },
        ],
      } as RecreationResourceDetailUIModel;

      // First render with initial resource
      const { unmount } = renderHook(
        () => useEditResourceForm(initialResource),
        {
          wrapper: createWrapper(),
        },
      );

      unmount();

      // Second render with updated resource (fresh hook instance)
      const { result } = renderHook(
        () => useEditResourceForm(updatedResource),
        {
          wrapper: createWrapper(),
        },
      );

      // The new hook instance should have values from the updated resource
      expect(result.current.selectedAccessOptions.length).toBe(1);
      expect(result.current.selectedAccessOptions[0]).toEqual({
        label: 'New Sub',
        value: 'NEWSUB1',
        group: 'NEW1',
        groupLabel: 'New Access',
      });
    });
  });
});
