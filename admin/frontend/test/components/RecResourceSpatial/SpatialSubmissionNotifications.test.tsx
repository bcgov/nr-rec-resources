import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { SpatialSubmissionAlerts } from '@/components/RecResourceSpatial/SpatialSubmissionNotifications';
import { ValidationIssue } from '@/components/RecResourceSpatial/spatialSubmission.types';

describe('SpatialSubmissionAlerts', () => {
  describe('validation alerts', () => {
    it('returns null when no validation issues', () => {
      const { container } = render(
        <SpatialSubmissionAlerts
          kind="validation"
          issues={[]}
          hasValidationErrors={false}
        />,
      );
      expect(container.firstChild).toBeNull();
    });

    it('displays validation issues with error variant', () => {
      const issues: ValidationIssue[] = [
        {
          type: 'GEOMETRY',
          severity: 'ERROR',
          message: 'Invalid geometry detected',
        },
        {
          type: 'SECTION_ID',
          severity: 'ERROR',
          message: 'Duplicate section IDs found',
        },
      ];

      render(
        <SpatialSubmissionAlerts
          kind="validation"
          issues={issues}
          hasValidationErrors={true}
        />,
      );

      expect(screen.getByText('Validation Results')).toBeDefined();
      expect(
        screen.getByText('[GEOMETRY] Invalid geometry detected'),
      ).toBeDefined();
      expect(
        screen.getByText('[SECTION_ID] Duplicate section IDs found'),
      ).toBeDefined();
    });

    it('displays validation issues with warning variant', () => {
      const issues: ValidationIssue[] = [
        {
          type: 'TOPOLOGY',
          severity: 'WARNING',
          message: 'Some data may be incomplete',
        },
      ];

      render(
        <SpatialSubmissionAlerts
          kind="validation"
          issues={issues}
          hasValidationErrors={false}
        />,
      );

      expect(screen.getByText('Validation Results')).toBeDefined();
      expect(
        screen.getByText('[TOPOLOGY] Some data may be incomplete'),
      ).toBeDefined();
    });

    it('renders all validation issues in a list', () => {
      const issues: ValidationIssue[] = [
        {
          type: 'GEOMETRY',
          severity: 'ERROR',
          message: 'Invalid polygon ring',
        },
        {
          type: 'GEOMETRY',
          severity: 'ERROR',
          message: 'Zero area polygon detected',
        },
        {
          type: 'SECTION_ID',
          severity: 'ERROR',
          message: 'Missing section ID',
        },
      ];

      const { container } = render(
        <SpatialSubmissionAlerts
          kind="validation"
          issues={issues}
          hasValidationErrors={true}
        />,
      );

      const listItems = container.querySelectorAll('li');
      expect(listItems).toHaveLength(3);
    });

    it('applies danger variant class when hasValidationErrors is true', () => {
      const issues: ValidationIssue[] = [
        {
          type: 'GEOMETRY',
          severity: 'ERROR',
          message: 'Invalid geometry',
        },
      ];

      const { container } = render(
        <SpatialSubmissionAlerts
          kind="validation"
          issues={issues}
          hasValidationErrors={true}
        />,
      );

      const alert = container.querySelector(
        '.spatial-submission-section__validation-alert',
      );
      expect(alert?.className).toContain('danger');
    });

    it('applies warning variant class when hasValidationErrors is false', () => {
      const issues: ValidationIssue[] = [
        {
          type: 'TOPOLOGY',
          severity: 'WARNING',
          message: 'Warning message',
        },
      ];

      const { container } = render(
        <SpatialSubmissionAlerts
          kind="validation"
          issues={issues}
          hasValidationErrors={false}
        />,
      );

      const alert = container.querySelector(
        '.spatial-submission-section__validation-alert',
      );
      expect(alert?.className).toContain('warning');
    });
  });

  describe('notification alerts', () => {
    const mockOnDismissValidationSuccessNotice = vi.fn();
    const mockOnDismissCreateStatus = vi.fn();
    const mockOnDismissDistrictOptionsNotice = vi.fn();

    const defaultNotificationProps = {
      kind: 'notifications' as const,
      hasValidationSuccessNotice: false,
      showValidationSuccessNotice: false,
      onDismissValidationSuccessNotice: mockOnDismissValidationSuccessNotice,
      createStatus: null,
      onDismissCreateStatus: mockOnDismissCreateStatus,
      areDistrictOptionsErrored: false,
      showDistrictOptionsNotice: false,
      onDismissDistrictOptionsNotice: mockOnDismissDistrictOptionsNotice,
    };

    it('returns null when no notifications to show', () => {
      const { container } = render(
        <SpatialSubmissionAlerts {...defaultNotificationProps} />,
      );
      expect(container.firstChild).toBeNull();
    });

    it('displays validation success notification', () => {
      const props = {
        ...defaultNotificationProps,
        hasValidationSuccessNotice: true,
        showValidationSuccessNotice: true,
      };

      render(<SpatialSubmissionAlerts {...props} />);

      expect(
        screen.getByText('Spatial file validated successfully.'),
      ).toBeDefined();
    });

    it('auto-dismisses validation success notification after 5 seconds', () => {
      vi.useFakeTimers();

      const props = {
        ...defaultNotificationProps,
        hasValidationSuccessNotice: true,
        showValidationSuccessNotice: true,
      };

      render(<SpatialSubmissionAlerts {...props} />);

      vi.advanceTimersByTime(5000);

      expect(mockOnDismissValidationSuccessNotice).toHaveBeenCalled();

      vi.useRealTimers();
    });

    it('calls onDismissValidationSuccessNotice when dismissed', () => {
      const props = {
        ...defaultNotificationProps,
        hasValidationSuccessNotice: true,
        showValidationSuccessNotice: true,
      };

      render(<SpatialSubmissionAlerts {...props} />);

      const dismissBtn = screen.getByRole('button', { name: /close/i });
      fireEvent.click(dismissBtn);

      expect(mockOnDismissValidationSuccessNotice).toHaveBeenCalled();
    });

    it('hides validation success notification when showValidationSuccessNotice is false', () => {
      const props = {
        ...defaultNotificationProps,
        hasValidationSuccessNotice: true,
        showValidationSuccessNotice: false,
      };

      const { container } = render(<SpatialSubmissionAlerts {...props} />);
      expect(container.querySelector('.alert-success')).toBeNull();
    });

    it('displays success create status notification', () => {
      const props = {
        ...defaultNotificationProps,
        createStatus: {
          variant: 'success' as const,
          message: 'Request created successfully',
        },
      };

      render(<SpatialSubmissionAlerts {...props} />);

      expect(screen.getByText('Request created successfully')).toBeDefined();
    });

    it('displays error create status notification', () => {
      const props = {
        ...defaultNotificationProps,
        createStatus: {
          variant: 'danger' as const,
          message: 'Failed to create request',
        },
      };

      render(<SpatialSubmissionAlerts {...props} />);

      expect(screen.getByText('Failed to create request')).toBeDefined();
    });

    it('calls onDismissCreateStatus when create status is dismissed', () => {
      const props = {
        ...defaultNotificationProps,
        createStatus: {
          variant: 'success' as const,
          message: 'Request created',
        },
      };

      const { container } = render(<SpatialSubmissionAlerts {...props} />);

      const dismissBtn = container.querySelector('.alert-success button');
      if (dismissBtn) {
        fireEvent.click(dismissBtn);
      }

      expect(mockOnDismissCreateStatus).toHaveBeenCalled();
    });

    it('displays district options error notification', () => {
      const props = {
        ...defaultNotificationProps,
        areDistrictOptionsErrored: true,
        showDistrictOptionsNotice: true,
      };

      render(<SpatialSubmissionAlerts {...props} />);

      expect(
        screen.getByText(
          'Unable to load district/type options. Please refresh and try again.',
        ),
      ).toBeDefined();
    });

    it('calls onDismissDistrictOptionsNotice when district options error is dismissed', () => {
      const props = {
        ...defaultNotificationProps,
        areDistrictOptionsErrored: true,
        showDistrictOptionsNotice: true,
      };

      const { container } = render(<SpatialSubmissionAlerts {...props} />);

      const dismissBtn = container.querySelector('.alert-warning button');
      if (dismissBtn) {
        fireEvent.click(dismissBtn);
      }

      expect(mockOnDismissDistrictOptionsNotice).toHaveBeenCalled();
    });

    it('hides district options error when showDistrictOptionsNotice is false', () => {
      const props = {
        ...defaultNotificationProps,
        areDistrictOptionsErrored: true,
        showDistrictOptionsNotice: false,
      };

      render(<SpatialSubmissionAlerts {...props} />);

      expect(
        screen.queryByText(
          'Unable to load district/type options. Please refresh and try again.',
        ),
      ).toBeNull();
    });

    it('displays multiple notifications together', () => {
      const props = {
        ...defaultNotificationProps,
        hasValidationSuccessNotice: true,
        showValidationSuccessNotice: true,
        createStatus: {
          variant: 'success' as const,
          message: 'Request created',
        },
      };

      render(<SpatialSubmissionAlerts {...props} />);

      expect(
        screen.getByText('Spatial file validated successfully.'),
      ).toBeDefined();
      expect(screen.getByText('Request created')).toBeDefined();
    });

    it('renders container with fixed notification class', () => {
      const props = {
        ...defaultNotificationProps,
        hasValidationSuccessNotice: true,
        showValidationSuccessNotice: true,
      };

      const { container } = render(<SpatialSubmissionAlerts {...props} />);

      const notificationContainer = container.querySelector(
        '.spatial-submission-section__notifications',
      );
      expect(notificationContainer).toBeDefined();
    });

    it('only shows district options error notification when both flags are true', () => {
      const { container: container1 } = render(
        <SpatialSubmissionAlerts
          {...defaultNotificationProps}
          areDistrictOptionsErrored={true}
          showDistrictOptionsNotice={false}
        />,
      );
      expect(container1.querySelector('.alert-warning')).toBeNull();

      const { container: container2 } = render(
        <SpatialSubmissionAlerts
          {...defaultNotificationProps}
          areDistrictOptionsErrored={false}
          showDistrictOptionsNotice={true}
        />,
      );
      expect(container2.querySelector('.alert-warning')).toBeNull();
    });
  });
});
