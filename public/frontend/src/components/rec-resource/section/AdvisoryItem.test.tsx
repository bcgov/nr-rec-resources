import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import AdvisoryItem from './AdvisoryItem'; // Adjust the import path if necessary
import { AdvisoryDto } from '@/service/recreation-resource';

// 1. Mock the SVG assets so they resolve safely in the Node environment
vi.mock('@/images/icons/advisories/blue-icon.svg', () => ({
  default: 'blue-icon.svg',
}));
vi.mock('@/images/icons/advisories/yellow-icon.svg', () => ({
  default: 'yellow-icon.svg',
}));
vi.mock('@/images/icons/advisories/red-icon.svg', () => ({
  default: 'red-icon.svg',
}));

// 2. Mock the SafeHtml component to isolate the test and avoid testing its internals
vi.mock('@shared/components/safe-html', () => ({
  SafeHtml: ({ html }: { html: string }) => (
    <div data-testid="safe-html">{html}</div>
  ),
}));

// 3. Mock FontAwesomeIcon to easily assert which icon is being rendered
vi.mock('@fortawesome/react-fontawesome', () => ({
  FontAwesomeIcon: ({ icon }: { icon: { iconName: string } }) => (
    <span data-testid="fa-icon">{icon.iconName}</span>
  ),
}));

describe('AdvisoryItem', () => {
  const mockOnToggle = vi.fn();

  // A standard piece of mock data to use as a baseline
  const defaultAdvisory: AdvisoryDto = {
    urgency: 'Low',
    title: 'Trail Closed',
    description: '<p>Due to flooding.</p>',
    // Using a predictable date format to avoid timezone test flakiness
    advisory_date: new Date('2026-06-04T12:00:00Z'),
    advisory_number: 0,
    submitted_by: '',
    access_status_grouplabel: '',
    access_status_name: '',
    access_status_description: '',
    event_type: '',
    advisory_status: '',
    is_reservations_affected: false,
    is_advisory_date_displayed: true,
    is_effective_date_displayed: false,
    is_end_date_displayed: false,
    is_updated_date_displayed: false,
    listing_rank: 0,
    urgency_sequence: 0,
    access_status_precedence: 0,
    event_type_precedence: 0,
  };

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Urgency Icons (switch statement coverage)', () => {
    it.each([
      ['Low', 'blue-icon.svg'],
      ['Medium', 'yellow-icon.svg'],
      ['High', 'red-icon.svg'],
      ['Unknown', 'red-icon.svg'], // Covers the default fallback case
    ])('renders the correct icon for %s urgency', (urgency, expectedIcon) => {
      render(
        <AdvisoryItem
          advisory={{ ...defaultAdvisory, urgency }}
          isCollapsed={false}
          onToggle={mockOnToggle}
        />,
      );
      const img = screen.getByAltText('Advisory Icon');
      expect(img).toHaveAttribute('src', expectedIcon);
    });
  });

  describe('Conditional Classes & Rendering', () => {
    it('applies the advisory-item--last class when isLast is true', () => {
      const { container } = render(
        <AdvisoryItem
          advisory={defaultAdvisory}
          isCollapsed={false}
          onToggle={mockOnToggle}
          isLast={true}
        />,
      );
      expect(container.firstChild).toHaveClass('advisory-item--last');
    });

    it('does not apply the advisory-item--last class when isLast is false/undefined', () => {
      const { container } = render(
        <AdvisoryItem
          advisory={defaultAdvisory}
          isCollapsed={false}
          onToggle={mockOnToggle}
        />,
      );
      expect(container.firstChild).not.toHaveClass('advisory-item--last');
    });

    it('handles missing description gracefully', () => {
      render(
        <AdvisoryItem
          advisory={{ ...defaultAdvisory, description: undefined }}
          isCollapsed={false}
          onToggle={mockOnToggle}
        />,
      );
      expect(screen.queryByTestId('safe-html')).not.toBeInTheDocument();
    });

    it('handles missing advisory_date gracefully', () => {
      render(
        <AdvisoryItem
          advisory={{
            ...defaultAdvisory,
            is_advisory_date_displayed: false,
          }}
          isCollapsed={false}
          onToggle={mockOnToggle}
        />,
      );

      const dateText = screen.queryByText(/Posted/i);
      expect(dateText).not.toBeInTheDocument();
    });
  });

  describe('Advisory dates', () => {
    // noon Pacific, so the rendered calendar date is unambiguous
    const JUN_4 = new Date('2026-06-04T19:00:00Z');
    const JUN_8 = new Date('2026-06-08T19:00:00Z');
    const JUN_9 = new Date('2026-06-09T19:00:00Z');

    const renderDate = (overrides: Partial<AdvisoryDto>) => {
      const { container } = render(
        <AdvisoryItem
          advisory={{ ...defaultAdvisory, ...overrides }}
          isCollapsed={false}
          onToggle={mockOnToggle}
        />,
      );
      return container.querySelector('.advisory-date')?.textContent ?? null;
    };

    // the five shapes the ACT staff form can write
    it('renders the posting date', () => {
      expect(
        renderDate({
          is_advisory_date_displayed: true,
          advisory_date: JUN_4,
        }),
      ).toBe('Posted: June 4, 2026');
    });

    it('renders the updated date', () => {
      expect(
        renderDate({
          is_advisory_date_displayed: false,
          is_updated_date_displayed: true,
          updated_date: JUN_9,
        }),
      ).toBe('Updated: June 9, 2026');
    });

    it('renders the start date on its own', () => {
      expect(
        renderDate({
          is_advisory_date_displayed: false,
          is_effective_date_displayed: true,
          effective_date: JUN_4,
        }),
      ).toBe('Starts: June 4, 2026');
    });

    it('renders an effective range', () => {
      expect(
        renderDate({
          is_advisory_date_displayed: false,
          is_effective_date_displayed: true,
          is_end_date_displayed: true,
          effective_date: JUN_4,
          end_date: JUN_8,
        }),
      ).toBe('In effect: June 4, 2026 to June 8, 2026');
    });

    it('renders nothing when no date is flagged for display', () => {
      expect(renderDate({ is_advisory_date_displayed: false })).toBeNull();
    });

    // a flag on with no date behind it must not render a dangling label
    it('renders nothing when the flagged date is missing', () => {
      expect(renderDate({ advisory_date: undefined })).toBeNull();
    });

    it('shows the date once when the range starts and ends the same day', () => {
      expect(
        renderDate({
          is_advisory_date_displayed: false,
          is_effective_date_displayed: true,
          is_end_date_displayed: true,
          effective_date: new Date('2026-06-04T08:00:00Z'), // 1am Pacific
          end_date: new Date('2026-06-05T06:00:00Z'), // 11pm Pacific, same day
        }),
      ).toBe('In effect: June 4, 2026');
    });

    it('never shows the end date without the effective date', () => {
      expect(
        renderDate({
          is_advisory_date_displayed: false,
          is_effective_date_displayed: false,
          is_end_date_displayed: true,
          effective_date: JUN_4,
          end_date: JUN_8,
        }),
      ).toBeNull();
    });

    it('formats in Pacific time regardless of the viewer timezone', () => {
      // 11pm Pacific on Jun 4, which is Jun 5 in UTC
      expect(
        renderDate({
          is_advisory_date_displayed: true,
          advisory_date: new Date('2026-06-05T06:00:00Z'),
        }),
      ).toBe('Posted: June 4, 2026');
    });

    describe('precedence when several flags are on', () => {
      it('prefers the posting date over everything else', () => {
        expect(
          renderDate({
            is_advisory_date_displayed: true,
            is_updated_date_displayed: true,
            is_effective_date_displayed: true,
            is_end_date_displayed: true,
            advisory_date: JUN_4,
            updated_date: JUN_9,
            effective_date: JUN_4,
            end_date: JUN_8,
          }),
        ).toBe('Posted: June 4, 2026');
      });

      it('prefers the updated date over the effective range', () => {
        expect(
          renderDate({
            is_advisory_date_displayed: false,
            is_updated_date_displayed: true,
            is_effective_date_displayed: true,
            is_end_date_displayed: true,
            updated_date: JUN_9,
            effective_date: JUN_4,
            end_date: JUN_8,
          }),
        ).toBe('Updated: June 9, 2026');
      });

      it('falls through to the next date when the preferred one is missing', () => {
        expect(
          renderDate({
            is_advisory_date_displayed: true,
            is_updated_date_displayed: true,
            advisory_date: undefined,
            updated_date: JUN_9,
          }),
        ).toBe('Updated: June 9, 2026');
      });
    });
  });

  describe('Interactions & Toggle State', () => {
    it('renders expanded state correctly (isCollapsed = false)', () => {
      const { container } = render(
        <AdvisoryItem
          advisory={defaultAdvisory}
          isCollapsed={false}
          onToggle={mockOnToggle}
        />,
      );

      // Verify the title and description are rendered
      expect(screen.getByText('Trail Closed')).toBeInTheDocument();
      expect(screen.getByTestId('safe-html')).toHaveTextContent(
        '<p>Due to flooding.</p>',
      );

      // Verify date formatted string contains the year
      expect(screen.getByText(/2026/)).toBeInTheDocument();

      // Ensure the chevron-up icon is shown
      expect(screen.getByTestId('fa-icon')).toHaveTextContent('chevron-up');

      // The hidden attribute should be false
      const contentDiv = container.querySelector('div[hidden]');
      expect(contentDiv).toBeNull();
    });

    it('renders collapsed state correctly (isCollapsed = true)', () => {
      const { container } = render(
        <AdvisoryItem
          advisory={{ ...defaultAdvisory, is_advisory_date_displayed: true }}
          isCollapsed={true}
          onToggle={mockOnToggle}
        />,
      );

      // Header should have the collapsed class
      const header = container.querySelector('.advisory-header');
      expect(header).toHaveClass('collapsed');

      // Ensure the chevron-down icon is shown
      expect(screen.getByTestId('fa-icon')).toHaveTextContent('chevron-down');

      // The content wrapper should have the hidden attribute
      const contentDiv = container.querySelector('div[hidden]');
      expect(contentDiv).toBeInTheDocument();
    });

    it('calls onToggle when the arrow area is clicked', () => {
      const { container } = render(
        <AdvisoryItem
          advisory={defaultAdvisory}
          isCollapsed={true}
          onToggle={mockOnToggle}
        />,
      );

      const arrowSpan = container.querySelector('.advisory-arrow');
      fireEvent.click(arrowSpan!);

      expect(mockOnToggle).toHaveBeenCalledTimes(1);
    });
  });
});
