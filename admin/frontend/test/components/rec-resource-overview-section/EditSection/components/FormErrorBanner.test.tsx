import { FormErrorBanner } from '@/pages/rec-resource-page/components/RecResourceOverviewSection/EditSection/components/FormErrorBanner';
import { EditResourceFormData } from '@/pages/rec-resource-page/components/RecResourceOverviewSection/EditSection/schemas';
import { render, screen } from '@testing-library/react';
import { FieldErrors } from 'react-hook-form';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock FontAwesome
vi.mock('@fortawesome/react-fontawesome', () => ({
  FontAwesomeIcon: ({ icon, ariaLabel }: any) => (
    <span data-testid="error-icon" aria-label={ariaLabel}>
      {icon.iconName}
    </span>
  ),
}));

vi.mock('@fortawesome/free-solid-svg-icons', () => ({
  faExclamationTriangle: { iconName: 'exclamation-triangle' },
}));

describe('FormErrorBanner', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should not render when there are no errors', () => {
      const errors: FieldErrors<EditResourceFormData> = {};

      const { container } = render(<FormErrorBanner errors={errors} />);

      expect(container.firstChild).toBeNull();
    });

    it('should render error banner when there are errors', () => {
      const errors: FieldErrors<EditResourceFormData> = {
        district_code: {
          type: 'custom',
          message: 'Cannot save with an archived district.',
        },
      };

      render(<FormErrorBanner errors={errors} />);

      expect(
        screen.getByText('Please review and correct the following errors:'),
      ).toBeInTheDocument();
      expect(
        screen.getByText(/Cannot save with an archived district/),
      ).toBeInTheDocument();
      expect(screen.getByTestId('error-icon')).toBeInTheDocument();
    });

    it('should render with custom className', () => {
      const errors: FieldErrors<EditResourceFormData> = {
        status_code: {
          type: 'required',
          message: 'Status is required',
        },
      };

      const { container } = render(
        <FormErrorBanner errors={errors} className="custom-class" />,
      );

      const alert = container.querySelector('.alert.custom-class');
      expect(alert).toBeInTheDocument();
    });
  });

  describe('Error Message Display', () => {
    it('should display single error message', () => {
      const errors: FieldErrors<EditResourceFormData> = {
        district_code: {
          type: 'custom',
          message: 'Cannot save with an archived district.',
        },
      };

      render(<FormErrorBanner errors={errors} />);

      expect(
        screen.getByText(
          'district_code: Cannot save with an archived district.',
        ),
      ).toBeInTheDocument();
    });

    it('should display multiple error messages', () => {
      const errors: FieldErrors<EditResourceFormData> = {
        district_code: {
          type: 'custom',
          message: 'Cannot save with an archived district.',
        },
        status_code: {
          type: 'required',
          message: 'Status is required',
        },
        project_established_date: {
          type: 'custom',
          message: 'Project established date cannot be in the future',
        },
      };

      render(<FormErrorBanner errors={errors} />);

      expect(
        screen.getByText(
          'district_code: Cannot save with an archived district.',
        ),
      ).toBeInTheDocument();
      expect(
        screen.getByText('status_code: Status is required'),
      ).toBeInTheDocument();
      expect(
        screen.getByText(
          'project_established_date: Project established date cannot be in the future',
        ),
      ).toBeInTheDocument();
    });

    it('should use field label map when provided', () => {
      const errors: FieldErrors<EditResourceFormData> = {
        district_code: {
          type: 'custom',
          message: 'Cannot save with an archived district.',
        },
        status_code: {
          type: 'required',
          message: 'Status is required',
        },
      };

      const fieldLabelMap: Record<string, string> = {
        district_code: 'Recreation District',
        status_code: 'Status',
      };

      render(<FormErrorBanner errors={errors} fieldLabelMap={fieldLabelMap} />);

      expect(
        screen.getByText(
          'Recreation District: Cannot save with an archived district.',
        ),
      ).toBeInTheDocument();
      expect(
        screen.getByText('Status: Status is required'),
      ).toBeInTheDocument();
    });

    it('should fallback to field name when label not in map', () => {
      const errors: FieldErrors<EditResourceFormData> = {
        district_code: {
          type: 'custom',
          message: 'Cannot save with an archived district.',
        },
      };

      const fieldLabelMap: Record<string, string> = {
        status_code: 'Status',
      };

      render(<FormErrorBanner errors={errors} fieldLabelMap={fieldLabelMap} />);

      // Should use field name since district_code is not in the map
      expect(
        screen.getByText(
          'district_code: Cannot save with an archived district.',
        ),
      ).toBeInTheDocument();
    });
  });
});
