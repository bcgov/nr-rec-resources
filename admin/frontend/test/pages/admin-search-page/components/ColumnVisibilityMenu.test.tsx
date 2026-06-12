import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ColumnVisibilityMenu } from '@/pages/search/components/ColumnVisibilityMenu';

const mockUseAuthorizations = vi.fn();

vi.mock('@/hooks/useAuthorizations', () => ({
  useAuthorizations: () => mockUseAuthorizations(),
}));

describe('ColumnVisibilityMenu', () => {
  beforeEach(() => {
    mockUseAuthorizations.mockReturnValue({ canViewFeatureFlag: false });
  });

  it('stays open while toggling columns and closes on outside click', async () => {
    const user = userEvent.setup();
    const onToggle = vi.fn();

    render(
      <div>
        <ColumnVisibilityMenu
          visibleColumns={['rec_resource_id', 'name']}
          onToggle={onToggle}
        />
        <button type="button">Outside</button>
      </div>,
    );

    const toggle = screen.getByRole('button', { name: 'Columns' });
    await user.click(toggle);
    expect(toggle).toHaveAttribute('aria-expanded', 'true');

    const nameToggle = screen.getByRole('button', {
      name: /name/i,
    });
    await user.click(nameToggle);

    expect(onToggle).toHaveBeenCalledWith('name');
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    expect(nameToggle).toBeVisible();

    await user.click(screen.getByRole('button', { name: 'Outside' }));

    await waitFor(() => {
      expect(toggle).toHaveAttribute('aria-expanded', 'false');
    });
  });

  it('does not render a last updated option', async () => {
    const user = userEvent.setup();

    render(
      <ColumnVisibilityMenu
        visibleColumns={['rec_resource_id', 'name']}
        onToggle={vi.fn()}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Columns' }));

    expect(
      screen.queryByRole('button', { name: /last updated/i }),
    ).not.toBeInTheDocument();
  });

  it('does not render the required Rec # option', async () => {
    const user = userEvent.setup();

    render(
      <ColumnVisibilityMenu
        visibleColumns={['rec_resource_id', 'name']}
        onToggle={vi.fn()}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Columns' }));

    expect(
      screen.queryByRole('button', { name: /rec #/i }),
    ).not.toBeInTheDocument();
  });

  it('hides the public access status column when canViewFeatureFlag is false', async () => {
    const user = userEvent.setup();

    render(
      <ColumnVisibilityMenu
        visibleColumns={['rec_resource_id', 'name']}
        onToggle={vi.fn()}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Columns' }));

    expect(
      screen.queryByRole('button', { name: /public access status/i }),
    ).not.toBeInTheDocument();
  });

  it('shows the public access status column when canViewFeatureFlag is true', async () => {
    mockUseAuthorizations.mockReturnValue({ canViewFeatureFlag: true });
    const user = userEvent.setup();

    render(
      <ColumnVisibilityMenu
        visibleColumns={['rec_resource_id', 'name']}
        onToggle={vi.fn()}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Columns' }));

    expect(
      screen.getByRole('button', { name: /public access status/i }),
    ).toBeInTheDocument();
  });
});
