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

vi.mock('react-hook-form', async () => {
  const actual = await vi.importActual('react-hook-form');
  return {
    ...actual,
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

vi.mock(
  '@/pages/rec-resource-page/components/RecResourceOverviewSection/EditSection/components',
  () => ({
    SelectField: ({ label, name }: any) => (
      <div data-testid={`select-field-${name}`}>
        <label>{label}</label>
        <select name={name} />
      </div>
    ),
    GroupedMultiSelectField: ({ label, name, helperText }: any) => (
      <div data-testid={`grouped-multi-select-field-${name}`}>
        <label>{label}</label>
        {helperText && <div data-testid="helper-text">{helperText}</div>}
        <select multiple name={name} />
      </div>
    ),
  }),
);

vi.mock('@/components/date-input-field', () => ({
  DateInputField: ({ label, name }: any) => (
    <div data-testid={`date-field-${name}`}>
      <label>{label}</label>
      <input name={name} />
    </div>
  ),
}));

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

    it.each([
      {
        label: 'Status',
        testId: 'select-field-status_code',
      },
      {
        label: 'Maintenance Standard',
        testId: 'select-field-maintenance_standard_code',
      },
      {
        label: 'Controlled Access Type',
        testId: 'select-field-control_access_code',
      },
      {
        label: 'Risk Rating',
        testId: 'select-field-risk_rating_code',
      },
      {
        label: 'Project Established Date',
        testId: 'date-field-project_established_date',
      },
      {
        label: 'Access and Sub-Access',
        testId: 'grouped-multi-select-field-selected_access_options',
      },
      {
        label: 'Recreation District',
        testId: 'select-field-district_code',
      },
    ])('should render $label field', ({ label, testId }) => {
      render(<RecResourceOverviewEditSection />);

      expect(screen.getByText(label)).toBeInTheDocument();
      expect(screen.getByTestId(testId)).toBeInTheDocument();
    });

    it('should render VisibleOnPublicSite component', () => {
      render(<RecResourceOverviewEditSection />);

      expect(screen.getByText('Displayed on public site')).toBeInTheDocument();
    });

    it('should render helper text for Access and Sub-Access field', () => {
      render(<RecResourceOverviewEditSection />);

      expect(screen.getByTestId('helper-text')).toHaveTextContent(
        'Access types are grouped with their available sub-options below them.',
      );
    });
  });

  describe('button states', () => {
    it.each([
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
    ])(
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
});
