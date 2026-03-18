import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { ColumnVisibilityMenu } from '@/pages/admin-search-page/components/ColumnVisibilityMenu';

describe('ColumnVisibilityMenu', () => {
  it('stays open while toggling columns and closes on outside click', async () => {
    const user = userEvent.setup();
    const onToggle = vi.fn();

    render(
      <div>
        <ColumnVisibilityMenu
          visibleColumns={['rec_resource_id', 'project_name']}
          onToggle={onToggle}
        />
        <button type="button">Outside</button>
      </div>,
    );

    const toggle = screen.getByRole('button', { name: 'Columns' });
    await user.click(toggle);
    expect(toggle).toHaveAttribute('aria-expanded', 'true');

    const projectNameToggle = screen.getByRole('button', {
      name: /project name/i,
    });
    await user.click(projectNameToggle);

    expect(onToggle).toHaveBeenCalledWith('project_name');
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    expect(projectNameToggle).toBeVisible();

    await user.click(screen.getByRole('button', { name: 'Outside' }));

    await waitFor(() => {
      expect(toggle).toHaveAttribute('aria-expanded', 'false');
    });
  });

  it('does not render a site type option', async () => {
    const user = userEvent.setup();

    render(
      <ColumnVisibilityMenu
        visibleColumns={['rec_resource_id', 'project_name']}
        onToggle={vi.fn()}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Columns' }));

    expect(
      screen.queryByRole('button', { name: /site type/i }),
    ).not.toBeInTheDocument();
  });

  it('does not render the required Rec # option', async () => {
    const user = userEvent.setup();

    render(
      <ColumnVisibilityMenu
        visibleColumns={['rec_resource_id', 'project_name']}
        onToggle={vi.fn()}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Columns' }));

    expect(
      screen.queryByRole('button', { name: /rec #/i }),
    ).not.toBeInTheDocument();
  });
});
