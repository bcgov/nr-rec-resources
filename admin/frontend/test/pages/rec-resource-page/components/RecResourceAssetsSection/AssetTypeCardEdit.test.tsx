import { AssetTypeCardEdit } from '@/pages/rec-resource-page/components/RecResourceAssetsSection/AssetTypeCardEdit';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

const defaultProps = {
  eventKey: 'group-1',
  description: 'Bridges',
  count: 3,
  totalValue: 15000,
  activeRepairsCount: 2,
  onCancel: vi.fn(),
  onSave: vi.fn(),
};

describe('AssetTypeCardEdit', () => {
  it('renders the group description', () => {
    render(<AssetTypeCardEdit {...defaultProps} />);
    expect(screen.getByText('Bridges')).toBeInTheDocument();
  });

  it('renders the asset count badge', () => {
    render(<AssetTypeCardEdit {...defaultProps} />);
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('renders active repair badge when activeRepairsCount > 0', () => {
    render(<AssetTypeCardEdit {...defaultProps} activeRepairsCount={2} />);
    expect(screen.getByText(/2 repairs/)).toBeInTheDocument();
  });

  it('renders Cancel and Save buttons', () => {
    render(<AssetTypeCardEdit {...defaultProps} />);
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Save changes' }),
    ).toBeInTheDocument();
  });

  it('calls onCancel when Cancel is clicked', async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();
    render(<AssetTypeCardEdit {...defaultProps} onCancel={onCancel} />);
    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('calls onSave when Save changes is clicked', async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();
    render(<AssetTypeCardEdit {...defaultProps} onSave={onSave} />);
    await user.click(screen.getByRole('button', { name: 'Save changes' }));
    expect(onSave).toHaveBeenCalledTimes(1);
  });

  it('disables buttons while isSaving', () => {
    render(<AssetTypeCardEdit {...defaultProps} isSaving={true} />);
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled();
    expect(screen.getByRole('button', { name: /Saving/ })).toBeDisabled();
  });

  it('renders children inside the accordion', () => {
    render(
      <AssetTypeCardEdit {...defaultProps}>
        <div>Child content</div>
      </AssetTypeCardEdit>,
    );
    expect(screen.getByText('Child content')).toBeInTheDocument();
  });
});
