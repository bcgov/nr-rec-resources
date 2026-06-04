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
    is_advisory_date_displayed: false,
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
      ['Unknown', 'blue-icon.svg'], // Covers the default fallback case
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
          advisory={{ ...defaultAdvisory, advisory_date: undefined }}
          isCollapsed={false}
          onToggle={mockOnToggle}
        />,
      );

      const dateText = screen.getByText(/Posted/i);
      expect(dateText).toBeInTheDocument();
      // The strong tag rendering the date string should not be present
      expect(dateText.querySelector('strong')).not.toBeInTheDocument();
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
          advisory={defaultAdvisory}
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
