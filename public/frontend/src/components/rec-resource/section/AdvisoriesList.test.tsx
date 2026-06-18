import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import AdvisoriesList from './AdvisoriesList'; // Adjust path if needed
import { AdvisoryDto } from '@/service/recreation-resource';

// 1. Mock FontAwesomeIcon to prevent SVG rendering issues in tests
vi.mock('@fortawesome/react-fontawesome', () => ({
  FontAwesomeIcon: ({ icon }: { icon: { iconName: string } }) => (
    <span data-testid="fa-icon">{icon.iconName}</span>
  ),
}));

// 2. Mock AdvisoryItem to isolate parent state testing
vi.mock('./AdvisoryItem', () => ({
  default: ({ advisory, isCollapsed, onToggle, isLast }: any) => (
    <div data-testid={`mock-advisory-${advisory.advisory_number}`}>
      <span data-testid={`state-${advisory.advisory_number}`}>
        {isCollapsed ? 'collapsed' : 'expanded'}
      </span>
      <span data-testid={`is-last-${advisory.advisory_number}`}>
        {isLast ? 'last' : 'not-last'}
      </span>
      <button
        onClick={onToggle}
        data-testid={`toggle-${advisory.advisory_number}`}
      >
        Toggle
      </button>
    </div>
  ),
}));

describe('AdvisoriesList', () => {
  const mockAdvisories: AdvisoryDto[] = [
    { advisory_number: 1, title: 'Advisory 1', urgency: 'Low' } as AdvisoryDto,
    { advisory_number: 2, title: 'Advisory 2', urgency: 'High' } as AdvisoryDto,
  ];

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Early Return (Null/Empty states)', () => {
    it('returns null if advisories array is empty', () => {
      const { container } = render(<AdvisoriesList advisories={[]} />);
      expect(container).toBeEmptyDOMElement();
    });

    it('returns null if advisories prop is falsy', () => {
      // @ts-expect-error Testing undefined behavior
      const { container } = render(<AdvisoriesList advisories={undefined} />);
      expect(container).toBeEmptyDOMElement();
    });
  });

  describe('Initial State Render', () => {
    it('defaults to OPEN if there is exactly ONE advisory', () => {
      render(<AdvisoriesList advisories={[mockAdvisories[0]]} />);

      // The single item should be expanded automatically
      expect(screen.getByTestId('state-1')).toHaveTextContent('expanded');
      // The toggle all button should say "Collapse" since all (1) are expanded
      expect(screen.getByText(/Collapse all Advisories/i)).toBeInTheDocument();
      expect(screen.getByTestId('fa-icon')).toHaveTextContent('chevron-up');
    });

    it('defaults to COLLAPSED if there are MULTIPLE advisories', () => {
      render(<AdvisoriesList advisories={mockAdvisories} />);

      // All items should be collapsed automatically
      expect(screen.getByTestId('state-1')).toHaveTextContent('collapsed');
      expect(screen.getByTestId('state-2')).toHaveTextContent('collapsed');
      // The toggle all button should say "Expand"
      expect(screen.getByText(/Expand all Advisories/i)).toBeInTheDocument();
      expect(screen.getByTestId('fa-icon')).toHaveTextContent('chevron-down');
    });

    it('passes the isLast prop correctly to the last item', () => {
      render(<AdvisoriesList advisories={mockAdvisories} />);

      expect(screen.getByTestId('is-last-1')).toHaveTextContent('not-last');
      expect(screen.getByTestId('is-last-2')).toHaveTextContent('last');
    });
  });

  describe('Interactions: toggleItem', () => {
    it('toggles an individual advisory open and closed', () => {
      render(<AdvisoriesList advisories={mockAdvisories} />);

      const toggleBtn = screen.getByTestId('toggle-1');

      // Starts collapsed
      expect(screen.getByTestId('state-1')).toHaveTextContent('collapsed');

      // Click to open
      fireEvent.click(toggleBtn);
      expect(screen.getByTestId('state-1')).toHaveTextContent('expanded');

      // Click to close
      fireEvent.click(toggleBtn);
      expect(screen.getByTestId('state-1')).toHaveTextContent('collapsed');
    });
  });

  describe('Interactions: toggleAll', () => {
    it('expands all when "Expand all" is clicked, and collapses all on second click', () => {
      render(<AdvisoriesList advisories={mockAdvisories} />);

      const toggleAllBtn = screen.getByRole('button', {
        name: /Expand all Advisories/i,
      });

      // Action 1: Click "Expand all"
      fireEvent.click(toggleAllBtn);

      // Verify all are expanded
      expect(screen.getByTestId('state-1')).toHaveTextContent('expanded');
      expect(screen.getByTestId('state-2')).toHaveTextContent('expanded');

      // Button text should have updated
      expect(screen.getByText(/Collapse all Advisories/i)).toBeInTheDocument();

      // Action 2: Click "Collapse all"
      fireEvent.click(toggleAllBtn);

      // Verify all are collapsed
      expect(screen.getByTestId('state-1')).toHaveTextContent('collapsed');
      expect(screen.getByTestId('state-2')).toHaveTextContent('collapsed');

      // Button text should revert
      expect(screen.getByText(/Expand all Advisories/i)).toBeInTheDocument();
    });

    it('collapses all if items were individually opened', () => {
      render(<AdvisoriesList advisories={mockAdvisories} />);

      // Manually open both items one by one
      fireEvent.click(screen.getByTestId('toggle-1'));
      fireEvent.click(screen.getByTestId('toggle-2'));

      // The global button should now say "Collapse all"
      const toggleAllBtn = screen.getByRole('button', {
        name: /Collapse all Advisories/i,
      });

      // Click "Collapse all"
      fireEvent.click(toggleAllBtn);

      // Verify both are shut
      expect(screen.getByTestId('state-1')).toHaveTextContent('collapsed');
      expect(screen.getByTestId('state-2')).toHaveTextContent('collapsed');
    });
  });
});
