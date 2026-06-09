import * as sharedUtils from '@shared/utils';
import { AdvisoryCard } from '@/pages/rec-resource-page/components/RecResourceAdvisoriesSection/AdvisoryCard';
import { RecreationResourceAdvisoryDto } from '@/services/recreation-resource-admin';
import { render, screen } from '@testing-library/react';
import { Mock, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/assets/icons/red-alert.svg', () => ({
  default: 'mock-red-alert.svg',
}));

vi.mock('@fortawesome/react-fontawesome', () => ({
  FontAwesomeIcon: ({ icon, ...props }: any) => (
    <span
      data-testid="font-awesome-icon"
      data-icon={icon?.iconName ?? String(icon)}
      {...props}
    />
  ),
}));

vi.mock('@/components/custom-badge', () => ({
  CustomBadge: ({ label, bgColor, textColor, fontWeight }: any) => (
    <span
      data-testid="custom-badge"
      data-bg={bgColor}
      data-text-color={textColor}
      data-font-weight={String(fontWeight)}
    >
      {label}
    </span>
  ),
}));

vi.mock('@shared/utils', () => ({
  formatDateFull: vi.fn(),
  formatDateReadable: vi.fn(),
}));

const mockFormatDateFull = sharedUtils.formatDateFull as Mock;
const mockFormatDateReadable = sharedUtils.formatDateReadable as Mock;

const STAFF_ADMIN_URL = 'https://alpha-test-staff.bcparks.ca';

const baseAdvisory: RecreationResourceAdvisoryDto = {
  advisory_number: 3189,
  event_type: 'General Public Safety',
  access_status_name: 'Closure',
  advisory_status: 'Published',
  urgency: 'High',
  advisory_date: new Date('2027-01-01T00:00:00Z'),
  effective_date: new Date('2027-01-01T00:00:00Z'),
  end_date: null,
  expiry_date: null,
  updated_date: new Date('2027-01-15T00:00:00Z'),
  published_at: new Date('2027-01-01T00:00:00Z'),
  submitted_by: 'Jane Doe',
  is_advisory_date_displayed: true,
  is_effective_date_displayed: true,
  is_end_date_displayed: false,
  is_updated_date_displayed: true,
};

describe('AdvisoryCard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Use a distinct value so date-full and date-readable outputs don't clash in queries
    mockFormatDateFull.mockReturnValue('January 15, 2027');
    mockFormatDateReadable.mockReturnValue('Jan 1, 2027');
  });

  const renderCard = (advisory: RecreationResourceAdvisoryDto = baseAdvisory) =>
    render(
      <AdvisoryCard advisory={advisory} staffAdminUrl={STAFF_ADMIN_URL} />,
    );

  describe('header', () => {
    it('renders event type and access status name', () => {
      renderCard();
      expect(
        screen.getByText('General Public Safety - Closure'),
      ).toBeInTheDocument();
    });

    it('renders Published status badge', () => {
      renderCard();
      const badge = screen.getByTestId('custom-badge');
      expect(badge).toHaveTextContent('Published');
    });

    it('renders Scheduled status badge', () => {
      renderCard({ ...baseAdvisory, advisory_status: 'Scheduled' });
      expect(screen.getByTestId('custom-badge')).toHaveTextContent('Scheduled');
    });

    it('uses light-blue background for Published status', () => {
      renderCard({ ...baseAdvisory, advisory_status: 'Published' });
      expect(screen.getByTestId('custom-badge')).toHaveAttribute(
        'data-bg',
        '#c7e3fd',
      );
    });

    it('uses light-green background for Scheduled status', () => {
      renderCard({ ...baseAdvisory, advisory_status: 'Scheduled' });
      expect(screen.getByTestId('custom-badge')).toHaveAttribute(
        'data-bg',
        '#e0eddb',
      );
    });

    it('renders urgency text', () => {
      renderCard();
      expect(screen.getByText('High')).toBeInTheDocument();
    });
  });

  describe('urgency icons', () => {
    it('renders img element with red-alert SVG for High urgency', () => {
      renderCard({ ...baseAdvisory, urgency: 'High' });
      const img = document.querySelector('img');
      expect(img).toBeInTheDocument();
      expect(img).toHaveAttribute('src', 'mock-red-alert.svg');
    });

    it('does not render an img for Medium urgency', () => {
      renderCard({ ...baseAdvisory, urgency: 'Medium' });
      expect(document.querySelector('img')).not.toBeInTheDocument();
    });

    it('renders triangle-exclamation icon for Medium urgency', () => {
      renderCard({ ...baseAdvisory, urgency: 'Medium' });
      const icons = screen.getAllByTestId('font-awesome-icon');
      const triangleIcon = icons.find(
        (el) => el.getAttribute('data-icon') === 'triangle-exclamation',
      );
      expect(triangleIcon).toBeInTheDocument();
    });

    it('renders circle-exclamation icon for Low urgency', () => {
      renderCard({ ...baseAdvisory, urgency: 'Low' });
      const icons = screen.getAllByTestId('font-awesome-icon');
      const circleIcon = icons.find(
        (el) => el.getAttribute('data-icon') === 'circle-exclamation',
      );
      expect(circleIcon).toBeInTheDocument();
    });

    it('falls back to circle-exclamation icon for unrecognized urgency', () => {
      renderCard({ ...baseAdvisory, urgency: 'Unknown' });
      const icons = screen.getAllByTestId('font-awesome-icon');
      const circleIcon = icons.find(
        (el) => el.getAttribute('data-icon') === 'circle-exclamation',
      );
      expect(circleIcon).toBeInTheDocument();
    });
  });

  describe('event dates', () => {
    it('does not render event dates when is_effective_date_displayed is false', () => {
      renderCard({ ...baseAdvisory, is_effective_date_displayed: false });
      expect(screen.queryByText('Event dates')).not.toBeInTheDocument();
    });

    it('does not render event dates when formatDateReadable returns null', () => {
      mockFormatDateReadable.mockReturnValueOnce(null);
      renderCard({ ...baseAdvisory, is_effective_date_displayed: true });
      expect(screen.queryByText('Event dates')).not.toBeInTheDocument();
    });

    it('renders only start date when is_end_date_displayed is false', () => {
      mockFormatDateReadable.mockReturnValueOnce('Jan 1, 2027');
      renderCard({
        ...baseAdvisory,
        is_effective_date_displayed: true,
        is_end_date_displayed: false,
        end_date: null,
      });
      const eventDatesLabel = screen.getByText('Event dates');
      expect(eventDatesLabel).toBeInTheDocument();
      expect(eventDatesLabel.parentElement?.textContent).toContain(
        'Jan 1, 2027',
      );
    });

    it('renders only start date when end_date is null even if is_end_date_displayed is true', () => {
      mockFormatDateReadable.mockReturnValueOnce('Jan 1, 2027');
      renderCard({
        ...baseAdvisory,
        is_effective_date_displayed: true,
        is_end_date_displayed: true,
        end_date: null,
      });
      expect(screen.getByText('Event dates')).toBeInTheDocument();
    });

    it('omits year from start date when both dates are in the same year', () => {
      mockFormatDateReadable
        .mockReturnValueOnce('Jan 1, 2027') // validity check (start)
        .mockReturnValueOnce('Jan 31, 2027') // end date
        .mockReturnValueOnce('Jan 1'); // start without year
      renderCard({
        ...baseAdvisory,
        is_effective_date_displayed: true,
        is_end_date_displayed: true,
        effective_date: new Date('2027-01-01T00:00:00Z'),
        end_date: new Date('2027-01-31T00:00:00Z'),
      });
      const eventDatesLabel = screen.getByText('Event dates');
      expect(eventDatesLabel.parentElement?.textContent).toContain(
        'Jan 1 – Jan 31, 2027',
      );
    });

    it('calls formatDateReadable with { year: undefined } for start when years match', () => {
      mockFormatDateReadable
        .mockReturnValueOnce('Jan 1, 2027')
        .mockReturnValueOnce('Jan 31, 2027')
        .mockReturnValueOnce('Jan 1');
      const effectiveDate = new Date('2027-01-01T00:00:00Z');
      renderCard({
        ...baseAdvisory,
        is_effective_date_displayed: true,
        is_end_date_displayed: true,
        effective_date: effectiveDate,
        end_date: new Date('2027-01-31T00:00:00Z'),
      });
      expect(mockFormatDateReadable).toHaveBeenCalledWith(effectiveDate, {
        year: undefined,
      });
    });

    it('includes year on both dates when they span different years', () => {
      mockFormatDateReadable
        .mockReturnValueOnce('Dec 15, 2026') // start
        .mockReturnValueOnce('Jan 15, 2027'); // end
      renderCard({
        ...baseAdvisory,
        is_effective_date_displayed: true,
        is_end_date_displayed: true,
        effective_date: new Date('2026-12-15T00:00:00Z'),
        end_date: new Date('2027-01-15T00:00:00Z'),
      });
      const eventDatesLabel = screen.getByText('Event dates');
      expect(eventDatesLabel.parentElement?.textContent).toContain(
        'Dec 15, 2026 – Jan 15, 2027',
      );
    });

    it('does not call formatDateReadable with year:undefined when years differ', () => {
      mockFormatDateReadable
        .mockReturnValueOnce('Dec 15, 2026')
        .mockReturnValueOnce('Jan 15, 2027');
      renderCard({
        ...baseAdvisory,
        is_effective_date_displayed: true,
        is_end_date_displayed: true,
        effective_date: new Date('2026-12-15T00:00:00Z'),
        end_date: new Date('2027-01-15T00:00:00Z'),
      });
      expect(mockFormatDateReadable).not.toHaveBeenCalledWith(
        expect.anything(),
        { year: undefined },
      );
    });
  });

  describe('metadata fields', () => {
    it('renders Posted label', () => {
      renderCard();
      expect(screen.getByText('Posted')).toBeInTheDocument();
    });

    it('renders Expiry label', () => {
      renderCard();
      expect(screen.getByText('Expiry')).toBeInTheDocument();
    });

    it('renders Last updated label', () => {
      renderCard();
      expect(screen.getByText('Last updated')).toBeInTheDocument();
    });

    it('renders Published by label', () => {
      renderCard();
      expect(screen.getByText('Published by')).toBeInTheDocument();
    });

    it('renders submitted_by value', () => {
      renderCard();
      expect(screen.getByText('Jane Doe')).toBeInTheDocument();
    });

    it('renders dash when expiry_date is null', () => {
      mockFormatDateFull.mockReturnValue(null);
      renderCard({ ...baseAdvisory, expiry_date: null });
      const dashes = screen.getAllByText('-');
      expect(dashes.length).toBeGreaterThan(0);
    });

    it('renders dash when published_at is null', () => {
      mockFormatDateFull.mockReturnValue(null);
      renderCard({ ...baseAdvisory, published_at: null });
      const dashes = screen.getAllByText('-');
      expect(dashes.length).toBeGreaterThan(0);
    });

    it('renders formatted date from formatDateFull for Posted field', () => {
      mockFormatDateFull.mockReturnValue('January 1, 2027');
      renderCard();
      expect(screen.getAllByText('January 1, 2027').length).toBeGreaterThan(0);
    });
  });

  describe('edit advisory link', () => {
    it('renders link with correct href including advisory number', () => {
      renderCard();
      const link = screen.getByRole('link', { name: /edit advisory/i });
      expect(link).toHaveAttribute(
        'href',
        `${STAFF_ADMIN_URL}/advisory-link/3189?idp=idir`,
      );
    });

    it('includes staffAdminUrl in the edit link', () => {
      const customUrl = 'https://custom-staff.example.com';
      render(
        <AdvisoryCard advisory={baseAdvisory} staffAdminUrl={customUrl} />,
      );
      const link = screen.getByRole('link', { name: /edit advisory/i });
      expect(link).toHaveAttribute(
        'href',
        `${customUrl}/advisory-link/3189?idp=idir`,
      );
    });

    it('opens edit link in a new tab', () => {
      renderCard();
      const link = screen.getByRole('link', { name: /edit advisory/i });
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    });
  });
});
