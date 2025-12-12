import { RecResourceOverviewEditSection } from '@/pages/rec-resource-page/components/RecResourceOverviewSection/EditSection/RecResourceOverviewEditSection';
import {
  useEditResourceForm,
  useResourceOptions,
} from '@/pages/rec-resource-page/components/RecResourceOverviewSection/EditSection/hooks';
import { useRecResource } from '@/pages/rec-resource-page/hooks/useRecResource';
import { RecreationResourceDetailUIModel } from '@/services';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/pages/rec-resource-page/hooks/useRecResource');
vi.mock(
  '@/pages/rec-resource-page/components/RecResourceOverviewSection/EditSection/hooks/useEditResourceForm',
);
vi.mock(
  '@/pages/rec-resource-page/components/RecResourceOverviewSection/EditSection/hooks/useResourceOptions',
);

const { mockUseWatch } = vi.hoisted(() => ({
  mockUseWatch: vi.fn<() => string | null>(() => null),
}));

vi.mock('react-hook-form', async () => {
  const actual = await vi.importActual('react-hook-form');
  return {
    ...(actual as any),
    useWatch: mockUseWatch,
    Controller: ({ render }: any) => {
      const field = {
        value: false,
        onChange: vi.fn(),
        onBlur: vi.fn(),
        name: 'display_on_public_site',
      };
      return render({ field });
    },
  };
});

vi.mock('@/components/RecResourceOverviewLink', () => ({
  RecResourceOverviewLink: ({ children, rec_resource_id }: any) => (
    <a href={`/rec-resource/${rec_resource_id}/overview`}>{children}</a>
  ),
}));

vi.mock('@/components/form', () => ({
  SelectField: ({ label, name, helperText }: any) => (
    <div data-testid={`select-field-${name}`}>
      <label>{label}</label>
      <select name={name} />
      {helperText && (
        <div data-testid={`helper-text-${name}`}>{helperText}</div>
      )}
    </div>
  ),
  GroupedMultiSelectField: ({ label, name, helperText }: any) => (
    <div data-testid={`grouped-multi-select-field-${name}`}>
      <label>{label}</label>
      {helperText && <div data-testid="helper-text">{helperText}</div>}
      <select multiple name={name} />
    </div>
  ),
  DateInputField: ({ label, name }: any) => (
    <div data-testid={`date-field-${name}`}>
      <label>{label}</label>
      <input name={name} />
    </div>
  ),
  TextField: ({ label, name }: any) => (
    <div data-testid={`text-field-${name}`}>
      <label>{label}</label>
      <input name={name} />
    </div>
  ),
  RichTextEditor: ({ name, label }: any) => (
    <div data-testid={`rich-text-${name}`}>
      <label>{label}</label>
      <div>Rich Text Editor</div>
    </div>
  ),
}));

vi.mock(
  '@/pages/rec-resource-page/components/RecResourceOverviewSection/EditSection/components',
  () => ({
    FormErrorBanner: ({ errors }: any) => {
      const errorMessages = Object.entries(errors || {})
        .filter(([, error]: any) => error?.message)
        .map(([field, error]: any) => `${field}: ${error.message}`);
      if (errorMessages.length === 0) return null;
      return (
        <div data-testid="form-error-banner">
          <div>Please review and correct the following errors:</div>
          <ul>
            {errorMessages.map((msg: string, idx: number) => (
              <li key={idx}>{msg}</li>
            ))}
          </ul>
        </div>
      );
    },
  }),
);

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
      description: 'Access Type 1',
      code: 'AC1',
      sub_access_codes: [
        { code: 'SUB1', description: 'Sub Access 1' },
        { code: 'SUB2', description: 'Sub Access 2' },
      ],
    },
  ],
} as RecreationResourceDetailUIModel;

const mockResourceOptions = {
  maintenanceOptions: [
    { id: 'U', label: 'Unmanaged' },
    { id: 'M', label: 'Managed' },
  ],
  controlAccessCodeTypeOptions: [
    { id: 'CA1', label: 'Control Access 1' },
    { id: 'CA2', label: 'Control Access 2' },
  ],
  riskRatingCodeTypeOptions: [
    { id: 'R1', label: 'Low' },
    { id: 'R2', label: 'High' },
  ],
  recreationStatusOptions: [
    { id: '1', label: 'Open' },
    { id: '2', label: 'Closed' },
  ],
  groupedAccessOptions: [
    {
      label: 'Access Type 1',
      options: [
        {
          value: 'SUB1',
          label: 'Sub Access 1',
          group: 'AC1',
          groupLabel: 'Access Type 1',
        },
        {
          value: 'SUB2',
          label: 'Sub Access 2',
          group: 'AC1',
          groupLabel: 'Access Type 1',
        },
      ],
    },
  ],
  districtOptions: [
    { id: null, label: 'None' },
    { id: 'RDCK', label: 'Chilliwack' },
    { id: 'RDVAN', label: 'Vancouver' },
  ],
  accessOptions: [],
  isLoading: false,
};

const createMockFormReturn = (overrides = {}) => ({
  handleSubmit: vi.fn((callback) => (e?: any) => {
    e?.preventDefault?.();
    return callback();
  }),
  control: {} as any,
  register: vi.fn(() => ({
    onChange: vi.fn(),
    onBlur: vi.fn(),
    name: 'test',
    ref: vi.fn(),
  })),
  errors: {},
  isDirty: false,
  updateMutation: {
    isPending: false,
    mutate: vi.fn(),
  },
  onSubmit: vi.fn(),
  selectedAccessOptions: [],
  ...overrides,
});

describe('RecResourceOverviewEditSection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseWatch.mockReturnValue(null);

    vi.mocked(useRecResource).mockReturnValue({
      rec_resource_id: '123',
      recResource: mockRecResource,
      isLoading: false,
      error: null,
    });

    vi.mocked(useResourceOptions).mockReturnValue(mockResourceOptions);
    vi.mocked(useEditResourceForm).mockReturnValue(
      createMockFormReturn() as any,
    );
  });

  describe('rendering', () => {
    it('should render the edit section with title and action buttons', () => {
      render(<RecResourceOverviewEditSection />);

      expect(screen.getByText('Edit Overview')).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'Cancel' }),
      ).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument();
    });

    const formFields = [
      { label: 'Status', testId: 'select-field-status_code' },
      {
        label: 'Maintenance Standard',
        testId: 'select-field-maintenance_standard_code',
      },
      {
        label: 'Controlled Access Type',
        testId: 'select-field-control_access_code',
      },
      { label: 'Risk Rating', testId: 'select-field-risk_rating_code' },
      {
        label: 'Project Established Date',
        testId: 'date-field-project_established_date',
      },
      {
        label: 'Access and Sub-Access',
        testId: 'grouped-multi-select-field-selected_access_options',
      },
      { label: 'Recreation District', testId: 'select-field-district_code' },
    ];

    it.each(formFields)('should render $label field', ({ label, testId }) => {
      render(<RecResourceOverviewEditSection />);

      expect(screen.getByText(label)).toBeInTheDocument();
      expect(screen.getByTestId(testId)).toBeInTheDocument();
    });

    it('should render VisibleOnPublicSite component and helper text', () => {
      render(<RecResourceOverviewEditSection />);

      expect(screen.getByText('Displayed on public site')).toBeInTheDocument();
      expect(screen.getByTestId('helper-text')).toHaveTextContent(
        'Access types are grouped with their available sub-options below them.',
      );
    });
  });

  describe('button states', () => {
    const buttonStateTests = [
      {
        isDirty: false,
        isPending: false,
        expectedText: 'Save',
        shouldBeDisabled: true,
      },
      {
        isDirty: true,
        isPending: false,
        expectedText: 'Save',
        shouldBeDisabled: false,
      },
      {
        isDirty: true,
        isPending: true,
        expectedText: 'Saving...',
        shouldBeDisabled: true,
      },
      {
        isDirty: false,
        isPending: true,
        expectedText: 'Saving...',
        shouldBeDisabled: true,
      },
    ];

    it.each(buttonStateTests)(
      'should render Save button as "$expectedText" and disabled=$shouldBeDisabled when isDirty=$isDirty and isPending=$isPending',
      ({ isDirty, isPending, expectedText, shouldBeDisabled }) => {
        vi.mocked(useEditResourceForm).mockReturnValue(
          createMockFormReturn({
            isDirty,
            updateMutation: { isPending, mutate: vi.fn() },
          }) as any,
        );

        render(<RecResourceOverviewEditSection />);

        const saveButton = screen.getByRole('button', { name: expectedText });
        if (shouldBeDisabled) {
          expect(saveButton).toBeDisabled();
        } else {
          expect(saveButton).not.toBeDisabled();
        }
      },
    );
  });

  describe('form submission', () => {
    it('should call handleSubmit and onSubmit when Save button is clicked', async () => {
      const mockHandleSubmit = vi.fn((callback) => (e?: any) => {
        e?.preventDefault?.();
        return callback();
      });
      const mockOnSubmit = vi.fn();

      vi.mocked(useEditResourceForm).mockReturnValue(
        createMockFormReturn({
          isDirty: true,
          handleSubmit: mockHandleSubmit,
          onSubmit: mockOnSubmit,
        }) as any,
      );

      render(<RecResourceOverviewEditSection />);

      const saveButton = screen.getByRole('button', { name: 'Save' });
      await userEvent.click(saveButton);

      await waitFor(() => {
        expect(mockHandleSubmit).toHaveBeenCalled();
        expect(mockOnSubmit).toHaveBeenCalled();
      });
    });
  });

  describe('navigation', () => {
    it('should link Cancel button to overview page', () => {
      render(<RecResourceOverviewEditSection />);

      const cancelButton = screen.getByRole('button', { name: 'Cancel' });
      const link = cancelButton.closest('a');

      expect(link).toHaveAttribute('href', '/rec-resource/123/overview');
    });
  });

  describe('FormErrorBanner', () => {
    const errorBannerTests = [
      { errors: {}, shouldRender: false, description: 'no errors' },
      {
        errors: {
          district_code: {
            type: 'custom',
            message:
              'Cannot save with an archived district. Please select an active district.',
          },
        },
        shouldRender: true,
        description: 'single error',
        expectedTexts: [
          'Please review and correct the following errors:',
          'Cannot save with an archived district. Please select an active district.',
        ],
      },
      {
        errors: {
          district_code: {
            type: 'custom',
            message: 'Cannot save with an archived district.',
          },
          status_code: {
            type: 'required',
            message: 'Status is required',
          },
        },
        shouldRender: true,
        description: 'multiple errors',
        expectedTexts: [
          'Cannot save with an archived district',
          'Status is required',
        ],
      },
    ];

    it.each(errorBannerTests)(
      'should $description and render=$shouldRender',
      ({ errors, shouldRender, expectedTexts }) => {
        vi.mocked(useEditResourceForm).mockReturnValue(
          createMockFormReturn({ errors }) as any,
        );

        render(<RecResourceOverviewEditSection />);

        const banner = screen.queryByTestId('form-error-banner');
        if (shouldRender) {
          expect(banner).toBeInTheDocument();
          expectedTexts!.forEach((text) => {
            expect(screen.getByText(new RegExp(text))).toBeInTheDocument();
          });
        } else {
          expect(banner).not.toBeInTheDocument();
        }
      },
    );
  });

  describe('Archived District Warning', () => {
    const archivedDistrictTests = [
      {
        description: 'archived district is selected',
        districtOptions: [
          { id: '1', label: 'Active District', is_archived: false },
          { id: '2', label: 'Archived District', is_archived: true },
        ],
        selectedDistrict: '2',
        shouldShowWarning: true,
      },
      {
        description: 'active district is selected',
        districtOptions: [
          { id: '1', label: 'Active District', is_archived: false },
          { id: '2', label: 'Archived District', is_archived: true },
        ],
        selectedDistrict: '1',
        shouldShowWarning: false,
      },
      {
        description: 'no district is selected',
        districtOptions: [
          { id: '1', label: 'Active District', is_archived: false },
        ],
        selectedDistrict: null,
        shouldShowWarning: false,
      },
      {
        description: 'selected option is not found',
        districtOptions: [
          { id: '1', label: 'Active District', is_archived: false },
        ],
        selectedDistrict: '999',
        shouldShowWarning: false,
      },
    ];

    it.each(archivedDistrictTests)(
      'should display warning=$shouldShowWarning when $description',
      ({ districtOptions, selectedDistrict, shouldShowWarning }) => {
        vi.mocked(useResourceOptions).mockReturnValue({
          ...mockResourceOptions,
          districtOptions,
        });

        mockUseWatch.mockReturnValue(selectedDistrict);

        render(<RecResourceOverviewEditSection />);

        const warningText =
          /The district currently assigned to this resource has been archived/;

        if (shouldShowWarning) {
          const helperTextContainer = screen.getByTestId(
            'helper-text-district_code',
          );
          expect(helperTextContainer).toBeInTheDocument();
          expect(screen.getByText(warningText)).toBeInTheDocument();
          expect(
            screen.getByText(/Please select an active district from the list/),
          ).toBeInTheDocument();
        } else {
          expect(screen.queryByText(warningText)).not.toBeInTheDocument();
        }
      },
    );
  });

  describe('useResourceOptions integration', () => {
    const districtCodeTests = [
      {
        scenario: 'recreation_district exists with district_code',
        recreation_district: {
          district_code: 'CHWK',
          description: 'Chilliwack',
        },
        expectedCode: 'CHWK',
      },
      {
        scenario: 'recreation_district is missing',
        recreation_district: undefined,
        expectedCode: undefined,
      },
      {
        scenario: 'recreation_district.district_code is missing',
        recreation_district: {
          district_code: undefined as any,
          description: 'District',
        },
        expectedCode: undefined,
      },
    ];

    it.each(districtCodeTests)(
      'should pass currentDistrictCode when $scenario',
      ({ recreation_district, expectedCode }) => {
        vi.mocked(useRecResource).mockReturnValue({
          rec_resource_id: '123',
          recResource: {
            ...mockRecResource,
            recreation_district,
          },
          isLoading: false,
          error: null,
        });

        render(<RecResourceOverviewEditSection />);

        expect(useResourceOptions).toHaveBeenCalledWith({
          currentDistrictCode: expectedCode,
        });
      },
    );
  });
});
