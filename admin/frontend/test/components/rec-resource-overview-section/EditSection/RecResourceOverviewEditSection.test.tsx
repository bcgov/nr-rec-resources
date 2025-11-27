import { RecResourceOverviewEditSection } from '@/pages/rec-resource-page/components/RecResourceOverviewSection/EditSection/RecResourceOverviewEditSection';
import { useRecResource } from '@/pages/rec-resource-page/hooks/useRecResource';
import { RecreationResourceDetailUIModel } from '@/services';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  useEditResourceForm,
  useResourceOptions,
} from '@/pages/rec-resource-page/components/RecResourceOverviewSection/EditSection/hooks';

// Mock dependencies
vi.mock('@/pages/rec-resource-page/hooks/useRecResource');
vi.mock(
  '@/pages/rec-resource-page/components/RecResourceOverviewSection/EditSection/hooks/useEditResourceForm',
);
vi.mock(
  '@/pages/rec-resource-page/components/RecResourceOverviewSection/EditSection/hooks/useResourceOptions',
);

// Mock RecResourceOverviewLink component
vi.mock('@/components/RecResourceOverviewLink', () => ({
  RecResourceOverviewLink: ({ children, rec_resource_id }: any) => (
    <a href={`/rec-resource/${rec_resource_id}/overview`}>{children}</a>
  ),
}));

// Mock the form field components to avoid react-hook-form complexity
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

// Mock the DateInputField which was added separately
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
      code: 'AC1',
      description: 'Access Type 1',
      sub_access_codes: [
        { code: 'SUB1', description: 'Sub Access 1' },
        { code: 'SUB2', description: 'Sub Access 2' },
      ],
    },
  ],
} as RecreationResourceDetailUIModel;

describe('RecResourceOverviewEditSection', () => {
  const mockHandleSubmit = vi.fn((callback) => (e?: any) => {
    e?.preventDefault?.();
    return callback();
  });
  const mockOnSubmit = vi.fn();
  const mockControl = {} as any;
  const mockErrors = {};
  const mockUpdateMutation = {
    isPending: false,
    mutate: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock useRecResource
    vi.mocked(useRecResource).mockReturnValue({
      rec_resource_id: '123',
      recResource: mockRecResource,
      isLoading: false,
      error: null,
    });

    // Mock useResourceOptions
    vi.mocked(useResourceOptions).mockReturnValue({
      maintenanceOptions: [
        { id: 'U', label: 'Unmanaged' },
        { id: 'M', label: 'Managed' },
      ],
      controlAccessCodeTypeOptions: [
        { id: 'CA1', label: 'Control Access 1' },
        { id: 'CA2', label: 'Control Access 2' },
      ],
      // new risk rating options added
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
      regionOptions: [],
      accessOptions: [],
      isLoading: false,
    });

    // Mock useEditResourceForm
    vi.mocked(useEditResourceForm).mockReturnValue({
      handleSubmit: mockHandleSubmit,
      control: mockControl,
      errors: mockErrors,
      isDirty: false,
      updateMutation: mockUpdateMutation,
      onSubmit: mockOnSubmit,
      selectedAccessOptions: [],
    } as any);
  });

  describe('rendering', () => {
    it('should render the edit section with title', () => {
      render(<RecResourceOverviewEditSection />);

      expect(screen.getByText('Edit Overview')).toBeInTheDocument();
    });

    it('should render Cancel button', () => {
      render(<RecResourceOverviewEditSection />);

      expect(
        screen.getByRole('button', { name: 'Cancel' }),
      ).toBeInTheDocument();
    });

    it('should render Save button', () => {
      render(<RecResourceOverviewEditSection />);

      expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument();
    });

    it('should render Status field', () => {
      render(<RecResourceOverviewEditSection />);

      expect(screen.getByText('Status')).toBeInTheDocument();
      expect(
        screen.getByTestId('select-field-status_code'),
      ).toBeInTheDocument();
    });

    it('should render Maintenance Standard field', () => {
      render(<RecResourceOverviewEditSection />);

      expect(screen.getByText('Maintenance Standard')).toBeInTheDocument();
      expect(
        screen.getByTestId('select-field-maintenance_standard_code'),
      ).toBeInTheDocument();
    });

    it('should render Control Access Type field', () => {
      render(<RecResourceOverviewEditSection />);

      expect(screen.getByText('Control Access Type')).toBeInTheDocument();
      expect(
        screen.getByTestId('select-field-control_access_code'),
      ).toBeInTheDocument();
    });

    it('should render Risk Rating field', () => {
      render(<RecResourceOverviewEditSection />);

      expect(screen.getByText('Risk Rating')).toBeInTheDocument();
      expect(
        screen.getByTestId('select-field-risk_rating_code'),
      ).toBeInTheDocument();
    });

    it('should render Project Established Date field', () => {
      render(<RecResourceOverviewEditSection />);

      expect(screen.getByText('Project Established Date')).toBeInTheDocument();
      expect(
        screen.getByTestId('date-field-project_established_date'),
      ).toBeInTheDocument();
    });

    it('should render Access and Sub-Access field', () => {
      render(<RecResourceOverviewEditSection />);

      expect(screen.getByText('Access and Sub-Access')).toBeInTheDocument();
      expect(
        screen.getByTestId(
          'grouped-multi-select-field-selected_access_options',
        ),
      ).toBeInTheDocument();
    });

    it('should render helper text for Access and Sub-Access field', () => {
      render(<RecResourceOverviewEditSection />);

      expect(screen.getByTestId('helper-text')).toHaveTextContent(
        'Access types are grouped with their available sub-options below them.',
      );
    });
  });

  describe('button states', () => {
    it('should disable Save button when form is not dirty', () => {
      vi.mocked(useEditResourceForm).mockReturnValue({
        handleSubmit: mockHandleSubmit,
        control: mockControl,
        errors: mockErrors,
        isDirty: false,
        updateMutation: mockUpdateMutation,
        onSubmit: mockOnSubmit,
        selectedAccessOptions: [],
      } as any);

      render(<RecResourceOverviewEditSection />);

      const saveButton = screen.getByRole('button', { name: 'Save' });
      expect(saveButton).toBeDisabled();
    });

    it('should enable Save button when form is dirty', () => {
      vi.mocked(useEditResourceForm).mockReturnValue({
        handleSubmit: mockHandleSubmit,
        control: mockControl,
        errors: mockErrors,
        isDirty: true,
        updateMutation: mockUpdateMutation,
        onSubmit: mockOnSubmit,
        selectedAccessOptions: [],
      } as any);

      render(<RecResourceOverviewEditSection />);

      const saveButton = screen.getByRole('button', { name: 'Save' });
      expect(saveButton).not.toBeDisabled();
    });

    it('should disable Save button when mutation is pending', () => {
      vi.mocked(useEditResourceForm).mockReturnValue({
        handleSubmit: mockHandleSubmit,
        control: mockControl,
        errors: mockErrors,
        isDirty: true,
        updateMutation: { ...mockUpdateMutation, isPending: true },
        onSubmit: mockOnSubmit,
        selectedAccessOptions: [],
      } as any);

      render(<RecResourceOverviewEditSection />);

      const saveButton = screen.getByRole('button', { name: 'Saving...' });
      expect(saveButton).toBeDisabled();
    });

    it('should show "Saving..." text when mutation is pending', () => {
      vi.mocked(useEditResourceForm).mockReturnValue({
        handleSubmit: mockHandleSubmit,
        control: mockControl,
        errors: mockErrors,
        isDirty: true,
        updateMutation: { ...mockUpdateMutation, isPending: true },
        onSubmit: mockOnSubmit,
        selectedAccessOptions: [],
      } as any);

      render(<RecResourceOverviewEditSection />);

      expect(screen.getByText('Saving...')).toBeInTheDocument();
    });

    it('should disable Save button when both not dirty and pending', () => {
      vi.mocked(useEditResourceForm).mockReturnValue({
        handleSubmit: mockHandleSubmit,
        control: mockControl,
        errors: mockErrors,
        isDirty: false,
        updateMutation: { ...mockUpdateMutation, isPending: true },
        onSubmit: mockOnSubmit,
        selectedAccessOptions: [],
      } as any);

      render(<RecResourceOverviewEditSection />);

      const saveButton = screen.getByRole('button', { name: 'Saving...' });
      expect(saveButton).toBeDisabled();
    });
  });

  describe('form submission', () => {
    it('should call handleSubmit when Save button is clicked', async () => {
      vi.mocked(useEditResourceForm).mockReturnValue({
        handleSubmit: mockHandleSubmit,
        control: mockControl,
        errors: mockErrors,
        isDirty: true,
        updateMutation: mockUpdateMutation,
        onSubmit: mockOnSubmit,
        selectedAccessOptions: [],
      } as any);

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

  describe('hooks integration', () => {
    it('should call useRecResource hook', () => {
      render(<RecResourceOverviewEditSection />);

      expect(useRecResource).toHaveBeenCalled();
    });

    it('should call useResourceOptions hook', () => {
      render(<RecResourceOverviewEditSection />);

      expect(useResourceOptions).toHaveBeenCalled();
    });

    it('should call useEditResourceForm hook with recResource', () => {
      render(<RecResourceOverviewEditSection />);

      expect(useEditResourceForm).toHaveBeenCalledWith(mockRecResource);
    });

    it('should handle empty recResource gracefully', () => {
      vi.mocked(useRecResource).mockReturnValue({
        rec_resource_id: undefined as any,
        recResource: undefined as any,
        isLoading: false,
        error: null,
      });

      render(<RecResourceOverviewEditSection />);

      // Should still render without crashing
      expect(screen.getByText('Edit Overview')).toBeInTheDocument();
    });
  });

  describe('layout and structure', () => {
    it('should render form within container', () => {
      const { container } = render(<RecResourceOverviewEditSection />);

      const form = container.querySelector('form');
      expect(form).toBeInTheDocument();
    });

    it('should have proper spacing between sections', () => {
      render(<RecResourceOverviewEditSection />);

      // Check that main sections are rendered
      expect(screen.getByText('Edit Overview')).toBeInTheDocument();
      expect(screen.getByText('Status')).toBeInTheDocument();
      expect(screen.getByText('Access and Sub-Access')).toBeInTheDocument();
    });

    it('should render all form fields', () => {
      render(<RecResourceOverviewEditSection />);

      expect(
        screen.getByTestId('select-field-status_code'),
      ).toBeInTheDocument();
      expect(
        screen.getByTestId('select-field-maintenance_standard_code'),
      ).toBeInTheDocument();
      expect(
        screen.getByTestId('select-field-control_access_code'),
      ).toBeInTheDocument();
      expect(
        screen.getByTestId(
          'grouped-multi-select-field-selected_access_options',
        ),
      ).toBeInTheDocument();
      expect(
        screen.getByTestId('select-field-risk_rating_code'),
      ).toBeInTheDocument();
      expect(
        screen.getByTestId('date-field-project_established_date'),
      ).toBeInTheDocument();
    });
  });
});
