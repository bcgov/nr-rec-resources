import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { AppliedFilterChips } from '@/pages/search/components/AppliedFilterChips';

describe('AppliedFilterChips', () => {
  it('renders all active chip labels', () => {
    render(
      <AppliedFilterChips
        chips={[
          { key: 'query', label: 'Query: tamihi', onClear: vi.fn() },
          { key: 'type', label: 'Site', onClear: vi.fn() },
          { key: 'district', label: 'Chilliwack', onClear: vi.fn() },
        ]}
      />,
    );

    expect(screen.getByText('Query: tamihi')).toBeInTheDocument();
    expect(screen.getByText('Site')).toBeInTheDocument();
    expect(screen.getByText('Chilliwack')).toBeInTheDocument();
  });

  it('calls the matching clear action for a chip', async () => {
    const user = userEvent.setup();
    const onClearQuery = vi.fn();

    render(
      <AppliedFilterChips
        chips={[
          {
            key: 'query',
            label: 'Query: tamihi',
            onClear: onClearQuery,
          },
        ]}
      />,
    );

    await user.click(
      screen.getByRole('button', { name: 'Clear Query: tamihi' }),
    );

    expect(onClearQuery).toHaveBeenCalledTimes(1);
  });

  it('renders nothing when no chips are active', () => {
    const { container } = render(<AppliedFilterChips chips={[]} />);

    expect(container).toBeEmptyDOMElement();
  });
});
