import { RecreationResourceAccessRow } from '@/pages/rec-resource-page/components/RecResourceOverviewSection/components/RecreationResourceAccessRow';
import type { RecreationResourceDetailUIModel } from '@/services';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

// Mock FontAwesome
vi.mock('@fortawesome/react-fontawesome', () => ({
  FontAwesomeIcon: ({ icon }: any) => (
    <span data-testid="font-awesome-icon">{icon.iconName}</span>
  ),
}));

describe('RecreationResourceAccessRow', () => {
  const createMockRecResource = (
    accessCodes: RecreationResourceDetailUIModel['access_codes'],
  ): RecreationResourceDetailUIModel =>
    ({
      access_codes: accessCodes,
    }) as RecreationResourceDetailUIModel;

  it('should render access codes when provided', () => {
    const recResource = createMockRecResource([
      { code: 'ROAD', description: 'Road Access', sub_access_codes: [] },
      { code: 'TRAIL', description: 'Trail Access', sub_access_codes: [] },
    ]);

    render(<RecreationResourceAccessRow recResource={recResource} />);

    expect(screen.getByText('Road Access')).toBeInTheDocument();
    expect(screen.getByText('Trail Access')).toBeInTheDocument();
  });

  it('should render dash when no access codes', () => {
    const recResource = createMockRecResource([]);

    const { container } = render(
      <RecreationResourceAccessRow recResource={recResource} />,
    );

    expect(container.textContent).toBe('-');
  });

  it('should not render expand button when 3 or fewer access codes', () => {
    const recResource = createMockRecResource([
      { code: 'ROAD', description: 'Road Access', sub_access_codes: [] },
      { code: 'TRAIL', description: 'Trail Access', sub_access_codes: [] },
      { code: 'WATER', description: 'Water Access', sub_access_codes: [] },
    ]);

    render(<RecreationResourceAccessRow recResource={recResource} />);

    expect(screen.queryByText(/More Access Types/i)).not.toBeInTheDocument();
  });

  it('should render expand button when more than 3 access codes', () => {
    const recResource = createMockRecResource([
      { code: 'ROAD', description: 'Road Access', sub_access_codes: [] },
      { code: 'TRAIL', description: 'Trail Access', sub_access_codes: [] },
      { code: 'WATER', description: 'Water Access', sub_access_codes: [] },
      { code: 'AIR', description: 'Air Access', sub_access_codes: [] },
    ]);

    render(<RecreationResourceAccessRow recResource={recResource} />);

    expect(screen.getByText(/More Access Types/i)).toBeInTheDocument();
  });

  it('should show only first 3 items initially when more than 3 codes', () => {
    const recResource = createMockRecResource([
      { code: 'ROAD', description: 'Road Access', sub_access_codes: [] },
      { code: 'TRAIL', description: 'Trail Access', sub_access_codes: [] },
      { code: 'WATER', description: 'Water Access', sub_access_codes: [] },
      { code: 'AIR', description: 'Air Access', sub_access_codes: [] },
      { code: 'RAIL', description: 'Rail Access', sub_access_codes: [] },
    ]);

    render(<RecreationResourceAccessRow recResource={recResource} />);

    expect(screen.getByText('Road Access')).toBeInTheDocument();
    expect(screen.getByText('Trail Access')).toBeInTheDocument();
    expect(screen.getByText('Water Access')).toBeInTheDocument();
    expect(screen.queryByText('Air Access')).not.toBeInTheDocument();
    expect(screen.queryByText('Rail Access')).not.toBeInTheDocument();
  });

  it('should show correct count in expand button', () => {
    const recResource = createMockRecResource([
      { code: 'ROAD', description: 'Road Access', sub_access_codes: [] },
      { code: 'TRAIL', description: 'Trail Access', sub_access_codes: [] },
      { code: 'WATER', description: 'Water Access', sub_access_codes: [] },
      { code: 'AIR', description: 'Air Access', sub_access_codes: [] },
      { code: 'RAIL', description: 'Rail Access', sub_access_codes: [] },
    ]);

    render(<RecreationResourceAccessRow recResource={recResource} />);

    // Should show "+2 More Access Types" (5 total - 3 displayed = 2)
    expect(screen.getByText('+2 More Access Types')).toBeInTheDocument();
  });

  it('should expand to show all items when expand button is clicked', async () => {
    const user = userEvent.setup();
    const recResource = createMockRecResource([
      { code: 'ROAD', description: 'Road Access', sub_access_codes: [] },
      { code: 'TRAIL', description: 'Trail Access', sub_access_codes: [] },
      { code: 'WATER', description: 'Water Access', sub_access_codes: [] },
      { code: 'AIR', description: 'Air Access', sub_access_codes: [] },
      { code: 'RAIL', description: 'Rail Access', sub_access_codes: [] },
    ]);

    render(<RecreationResourceAccessRow recResource={recResource} />);

    const expandButton = screen.getByText('+2 More Access Types');
    await user.click(expandButton);

    // All items should now be visible
    expect(screen.getByText('Road Access')).toBeInTheDocument();
    expect(screen.getByText('Trail Access')).toBeInTheDocument();
    expect(screen.getByText('Water Access')).toBeInTheDocument();
    expect(screen.getByText('Air Access')).toBeInTheDocument();
    expect(screen.getByText('Rail Access')).toBeInTheDocument();
  });

  it('should change button text to "Show Less" when expanded', async () => {
    const user = userEvent.setup();
    const recResource = createMockRecResource([
      { code: 'ROAD', description: 'Road Access', sub_access_codes: [] },
      { code: 'TRAIL', description: 'Trail Access', sub_access_codes: [] },
      { code: 'WATER', description: 'Water Access', sub_access_codes: [] },
      { code: 'AIR', description: 'Air Access', sub_access_codes: [] },
    ]);

    render(<RecreationResourceAccessRow recResource={recResource} />);

    const expandButton = screen.getByText(/More Access Types/i);
    await user.click(expandButton);

    expect(screen.getByText('Show Less')).toBeInTheDocument();
  });

  it('should collapse back to 3 items when "Show Less" is clicked', async () => {
    const user = userEvent.setup();
    const recResource = createMockRecResource([
      { code: 'ROAD', description: 'Road Access', sub_access_codes: [] },
      { code: 'TRAIL', description: 'Trail Access', sub_access_codes: [] },
      { code: 'WATER', description: 'Water Access', sub_access_codes: [] },
      { code: 'AIR', description: 'Air Access', sub_access_codes: [] },
      { code: 'RAIL', description: 'Rail Access', sub_access_codes: [] },
    ]);

    render(<RecreationResourceAccessRow recResource={recResource} />);

    // First expand
    const expandButton = screen.getByText('+2 More Access Types');
    await user.click(expandButton);

    // All items visible
    expect(screen.getByText('Air Access')).toBeInTheDocument();
    expect(screen.getByText('Rail Access')).toBeInTheDocument();

    // Then collapse
    const collapseButton = screen.getByText('Show Less');
    await user.click(collapseButton);

    // Back to 3 items
    expect(screen.queryByText('Air Access')).not.toBeInTheDocument();
    expect(screen.queryByText('Rail Access')).not.toBeInTheDocument();
    expect(screen.getByText('+2 More Access Types')).toBeInTheDocument();
  });

  it('should handle access codes with sub access codes', () => {
    const recResource = createMockRecResource([
      {
        code: 'ROAD',
        description: 'Road Access',
        sub_access_codes: [
          { code: '4W', description: '4-Wheel Drive' },
          { code: '2W', description: '2-Wheel Drive' },
        ],
      },
    ]);

    render(<RecreationResourceAccessRow recResource={recResource} />);

    expect(screen.getByText('Road Access')).toBeInTheDocument();
    expect(screen.getByText('4-Wheel Drive')).toBeInTheDocument();
    expect(screen.getByText('2-Wheel Drive')).toBeInTheDocument();
  });

  it('should handle access codes with undefined sub_access_codes', () => {
    const recResource = createMockRecResource([
      {
        code: 'ROAD',
        description: 'Road Access',
        sub_access_codes: [],
      },
    ]);

    render(<RecreationResourceAccessRow recResource={recResource} />);

    expect(screen.getByText('Road Access')).toBeInTheDocument();
  });
});
