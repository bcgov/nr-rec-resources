import { ROUTE_PATHS } from '@/constants/routes';
import { useEditResourceForm } from '@/pages/rec-resource-page/components/RecResourceOverviewSection/EditSection/hooks/useEditResourceForm';
import {
  RecreationResourceDetailUIModel,
  RecreationResourceOptionUIModel,
  useUpdateRecreationResource,
} from '@/services';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import { createElement, type ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock dependencies - must be before imports
const mockNavigateWithQueryParams = vi.fn();

vi.mock('@shared/hooks', () => ({
  useNavigateWithQueryParams: vi.fn(() => ({
    navigate: mockNavigateWithQueryParams,
  })),
}));

vi.mock(
  '@/services/hooks/recreation-resource-admin/useUpdateRecreationResource',
  () => ({
    useUpdateRecreationResource: vi.fn(),
  }),
);

// Mock notifications and error handler
const mockAddSuccessNotification = vi.fn();
const mockAddErrorNotification = vi.fn();
const mockHandleApiError = vi.fn();

vi.mock('@/store/notificationStore', () => ({
  addSuccessNotification: (...args: any[]) =>
    mockAddSuccessNotification(...args),
  addErrorNotification: (...args: any[]) => mockAddErrorNotification(...args),
}));

vi.mock('@/services/utils/errorHandler', () => ({
  handleApiError: (...args: any[]) => mockHandleApiError(...args),
}));

// Create a wrapper with QueryClient for tests
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
  const mockMutateAsync = vi.fn();

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
    risk_rating_code: 'L',
    project_established_date: new Date('2020-01-01T00:00:00.000Z'),
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
    mutateAsync: mockMutateAsync,
    isPending: false,
    isSuccess: false,
    isError: false,
    error: null,
    data: undefined,
    reset: vi.fn(),
  };

  // Helper functions
  const renderHookWithResource = (
    resource: RecreationResourceDetailUIModel = mockRecResource,
    districtOptions: RecreationResourceOptionUIModel[] = [],
  ) => {
    return renderHook(() => useEditResourceForm(resource, districtOptions), {
      wrapper: createWrapper(),
    });
  };

  const createFormData = (overrides: any = {}) => ({
    maintenance_standard_code: 'M',
    control_access_code: 'CA2',
    status_code: '2',
    selected_access_options: [],
    ...overrides,
  });

  const submitFormAndAssert = async (
    result: ReturnType<typeof renderHookWithResource>['result'],
    formData: any,
    expectedDto: any,
  ) => {
    mockMutateAsync.mockResolvedValue(undefined);
    await act(async () => {
      await result.current.onSubmit(formData);
    });
    expect(mockMutateAsync).toHaveBeenCalledWith({
      recResourceId: '123',
      updateRecreationResourceDto: expectedDto,
    });
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useUpdateRecreationResource).mockReturnValue(
      mockUpdateMutation as any,
    );
  });

  describe('initialization', () => {
    it('should initialize with default values and expose all required properties', () => {
      const { result } = renderHookWithResource();

      expect(result.current.control).toBeDefined();
      expect(result.current.handleSubmit).toBeDefined();
      expect(result.current.errors).toBeDefined();
      expect(result.current.isDirty).toBe(false);
      expect(result.current.updateMutation).toBe(mockUpdateMutation);
    });

    it('should initialize selectedAccessOptions with grouped options from recResource', () => {
      const { result } = renderHookWithResource();

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

    it.each([
      ['empty array', []],
      ['null', null],
      ['non-array', {}],
    ])('should handle recResource with %s access_codes', (_, accessCodes) => {
      const resource = {
        ...mockRecResource,
        access_codes: accessCodes as any,
      };
      const { result } = renderHookWithResource(resource);
      expect(result.current.selectedAccessOptions).toEqual([]);
    });

    it.each([
      ['control_access_code', { control_access_code: undefined }],
      ['maintenance_standard_code', { maintenance_standard_code: undefined }],
      ['recreation_status_code', { recreation_status_code: undefined }],
    ])('should initialize when %s is missing', (_, overrides) => {
      const resource = { ...mockRecResource, ...overrides };
      const { result } = renderHookWithResource(resource);
      expect(result.current.control).toBeDefined();
    });

    it('should handle district_code initialization with or without recreation_district', () => {
      const withDistrict = {
        ...mockRecResource,
        recreation_district: {
          district_code: 'CHWK',
          description: 'Chilliwack',
        },
      };
      const withoutDistrict = {
        ...mockRecResource,
        recreation_district: undefined,
      };

      const { result: resultWith } = renderHookWithResource(withDistrict);
      const { result: resultWithout } = renderHookWithResource(withoutDistrict);

      expect(resultWith.current.control).toBeDefined();
      expect(resultWithout.current.control).toBeDefined();
    });
  });

  describe('onSubmit', () => {
    it('should submit form data, navigate, and show success notification', async () => {
      const { result } = renderHookWithResource();

      const formData = createFormData({
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
      });

      await submitFormAndAssert(result, formData, {
        maintenance_standard_code: 'M',
        control_access_code: 'CA2',
        status_code: 2,
        risk_rating_code: null,
        project_established_date: null,
        district_code: null,
        access_codes: [
          {
            access_code: 'AC1',
            sub_access_codes: ['SUB1', 'SUB2'],
          },
        ],
      });

      await waitFor(() => {
        expect(mockNavigateWithQueryParams).toHaveBeenCalledWith({
          to: ROUTE_PATHS.REC_RESOURCE_OVERVIEW,
          params: { id: '123' },
        });
      });

      expect(mockAddSuccessNotification).toHaveBeenCalledWith(
        'Recreation resource updated successfully.',
      );
    });

    it('should handle multiple access code groups', async () => {
      const { result } = renderHookWithResource();

      const formData = createFormData({
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
      });

      await submitFormAndAssert(result, formData, {
        maintenance_standard_code: 'M',
        control_access_code: 'CA2',
        status_code: 2,
        risk_rating_code: null,
        project_established_date: null,
        district_code: null,
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
      });
    });

    it.each([
      [
        'empty maintenance_standard_code',
        { maintenance_standard_code: '' },
        { maintenance_standard_code: undefined },
      ],
      [
        'null control_access_code',
        { control_access_code: null },
        { control_access_code: null },
      ],
      ['empty status_code', { status_code: '' }, { status_code: undefined }],
      [
        'empty selected_access_options',
        { selected_access_options: [] },
        { access_codes: [] },
      ],
    ])('should handle %s', async (_, formOverrides, expectedOverrides) => {
      const { result } = renderHookWithResource();
      const formData = createFormData(formOverrides);
      const expectedDto = {
        maintenance_standard_code: 'M',
        control_access_code: 'CA2',
        status_code: 2,
        risk_rating_code: null,
        project_established_date: null,
        district_code: null,
        access_codes: [],
        ...expectedOverrides,
      };

      await submitFormAndAssert(result, formData, expectedDto);
    });

    it('should convert status_code string to number', async () => {
      const { result } = renderHookWithResource();
      const formData = createFormData({ status_code: '5' });

      mockMutateAsync.mockResolvedValue(undefined);
      await act(async () => {
        await result.current.onSubmit(formData);
      });

      const call = mockMutateAsync.mock.calls[0][0];
      expect(call.updateRecreationResourceDto.status_code).toBe(5);
      expect(typeof call.updateRecreationResourceDto.status_code).toBe(
        'number',
      );
    });

    it.each([
      ['provided', 'CHWK', 'CHWK'],
      ['empty string', '', null],
      ['null', null, null],
    ])('should handle district_code when %s', async (_, input, expected) => {
      const { result } = renderHookWithResource();
      const formData = createFormData({ district_code: input });

      await submitFormAndAssert(result, formData, {
        maintenance_standard_code: 'M',
        control_access_code: 'CA2',
        status_code: 2,
        risk_rating_code: null,
        project_established_date: null,
        district_code: expected,
        access_codes: [],
      });
    });

    it('should include risk_rating_code and project_established_date in update payload', async () => {
      const { result } = renderHookWithResource();
      const formData = createFormData({
        risk_rating_code: 'H',
        project_established_date: '2021-12-01',
      } as any);

      await submitFormAndAssert(result, formData, {
        maintenance_standard_code: 'M',
        control_access_code: 'CA2',
        risk_rating_code: 'H',
        project_established_date: '2021-12-01',
        status_code: 2,
        district_code: null,
        access_codes: [],
      });
    });

    it('should show error notification when mutation errors', async () => {
      const { result } = renderHookWithResource();
      const formData = createFormData();
      const mockError = new Error('something went wrong');

      mockHandleApiError.mockResolvedValue({ message: 'API error' });
      mockMutateAsync.mockRejectedValue(mockError);

      await act(async () => {
        await result.current.onSubmit(formData);
      });

      expect(mockHandleApiError).toHaveBeenCalledWith(mockError);
      expect(mockAddErrorNotification).toHaveBeenCalledWith(
        expect.stringContaining(
          'Failed to update recreation resource: API error',
        ),
      );
    });
  });

  describe('form state', () => {
    it.each([
      ['isDirty', (r: any) => r.isDirty, false],
      ['errors', (r: any) => r.errors, expect.objectContaining({})],
      ['updateMutation', (r: any) => r.updateMutation, mockUpdateMutation],
    ])('should expose %s', (_, getter, expected) => {
      const { result } = renderHookWithResource();
      const value = getter(result.current);
      if (typeof expected === 'object' && expected !== null) {
        expect(value).toMatchObject(expected);
      } else {
        expect(value).toBe(expected);
      }
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
      rerender({ resource: mockRecResource });

      expect(result.current.selectedAccessOptions).toEqual(
        initialAccessOptions,
      );
    });

    it('should compute new defaultValues when recResource prop changes', () => {
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

      const { result } = renderHookWithResource(updatedResource);

      expect(result.current.selectedAccessOptions).toEqual([
        {
          label: 'New Sub',
          value: 'NEWSUB1',
          group: 'NEW1',
          groupLabel: 'New Access',
        },
      ]);
    });
  });

  describe('archived district validation', () => {
    const districtOptions: RecreationResourceOptionUIModel[] = [
      { id: null, label: 'None' },
      { id: 'CHWK', label: 'Chilliwack', is_archived: false },
      { id: 'VAN', label: 'Vancouver', is_archived: true },
    ];

    it.each([
      ['non-archived district', 'CHWK', 'CHWK'],
      ['null district_code', null, null],
    ])(
      'should accept %s in form submission',
      async (_, districtCode, expected) => {
        const { result } = renderHookWithResource(
          mockRecResource,
          districtOptions,
        );
        const formData = createFormData({ district_code: districtCode });

        await submitFormAndAssert(result, formData, {
          maintenance_standard_code: 'M',
          control_access_code: 'CA2',
          status_code: 2,
          risk_rating_code: null,
          project_established_date: null,
          district_code: expected,
          access_codes: [],
        });
      },
    );

    it.each([
      ['with districtOptions', districtOptions],
      ['with empty array', []],
      ['without parameter', undefined],
    ])('should initialize form %s', (_, options) => {
      const { result } = renderHookWithResource(
        mockRecResource,
        options as any,
      );
      expect(result.current.control).toBeDefined();
      expect(result.current.errors).toBeDefined();
      expect(result.current.handleSubmit).toBeDefined();
    });
  });
});
