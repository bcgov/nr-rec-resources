import { AssetTypeCard } from '@/pages/rec-resource-page/components/RecResourceAssetsSection/AssetTypeCard';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

describe('AssetTypeCard', () => {
  it('renders the description and count', () => {
    render(
      <AssetTypeCard
        eventKey="1"
        description="Bridge"
        count={5}
        totalValue={1000}
        activeRepairsCount={0}
      />,
    );

    expect(screen.getByText('Bridge')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('renders the formatted total value', () => {
    render(
      <AssetTypeCard
        eventKey="1"
        description="Bridge"
        count={5}
        totalValue={1000}
        activeRepairsCount={0}
      />,
    );

    expect(screen.getByText('$1,000 total value')).toBeInTheDocument();
  });

  it('shows an active repairs badge when there are active repairs', () => {
    render(
      <AssetTypeCard
        eventKey="1"
        description="Bridge"
        count={5}
        totalValue={1000}
        activeRepairsCount={3}
      />,
    );

    expect(screen.getByText('3 repairs')).toBeInTheDocument();
  });

  it('renders the singular "repair" label when there is 1 active repair', () => {
    render(
      <AssetTypeCard
        eventKey="1"
        description="Bridge"
        count={5}
        totalValue={1000}
        activeRepairsCount={1}
      />,
    );

    expect(screen.getByText('1 repair')).toBeInTheDocument();
  });

  it('hides the active repairs badge when there are no active repairs', () => {
    render(
      <AssetTypeCard
        eventKey="1"
        description="Bridge"
        count={5}
        totalValue={1000}
        activeRepairsCount={0}
      />,
    );

    expect(screen.queryByText(/repairs$/)).not.toBeInTheDocument();
  });

  it('renders an Edit button', () => {
    render(
      <AssetTypeCard
        eventKey="1"
        description="Bridge"
        count={5}
        totalValue={1000}
        activeRepairsCount={0}
      />,
    );

    expect(screen.getByRole('button', { name: 'Edit' })).toBeInTheDocument();
  });

  it('renders children content', () => {
    render(
      <AssetTypeCard
        eventKey="1"
        description="Bridge"
        count={5}
        totalValue={1000}
        activeRepairsCount={0}
      >
        <div>Child asset card</div>
      </AssetTypeCard>,
    );

    expect(screen.getByText('Child asset card')).toBeInTheDocument();
  });

  it('is collapsed by default', () => {
    render(
      <AssetTypeCard
        eventKey="1"
        description="Bridge"
        count={5}
        totalValue={1000}
        activeRepairsCount={0}
      />,
    );

    expect(screen.getByRole('button', { name: /Bridge/ })).toHaveAttribute(
      'aria-expanded',
      'false',
    );
  });

  it('calls onEdit when Edit button is clicked', async () => {
    const user = userEvent.setup();
    const onEdit = vi.fn();
    render(
      <AssetTypeCard
        eventKey="1"
        description="Bridge"
        count={5}
        totalValue={1000}
        activeRepairsCount={0}
        onEdit={onEdit}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Edit' }));

    expect(onEdit).toHaveBeenCalledTimes(1);
  });

  it('disables the Edit button when isDisabled is true', () => {
    render(
      <AssetTypeCard
        eventKey="1"
        description="Bridge"
        count={5}
        totalValue={1000}
        activeRepairsCount={0}
        isDisabled
      />,
    );

    expect(screen.getByRole('button', { name: 'Edit' })).toBeDisabled();
  });

  it('renders Save/Cancel buttons when isEditing is true', () => {
    render(
      <AssetTypeCard
        eventKey="1"
        description="Bridge"
        count={5}
        totalValue={1000}
        activeRepairsCount={0}
        isEditing
      />,
    );

    expect(
      screen.getByRole('button', { name: 'Save changes' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Edit' }),
    ).not.toBeInTheDocument();
  });

  it('calls onSave when Save changes button is clicked', async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();
    render(
      <AssetTypeCard
        eventKey="1"
        description="Bridge"
        count={5}
        totalValue={1000}
        activeRepairsCount={0}
        isEditing
        onSave={onSave}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Save changes' }));

    expect(onSave).toHaveBeenCalledTimes(1);
  });

  it('calls onCancel when Cancel button is clicked', async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();
    render(
      <AssetTypeCard
        eventKey="1"
        description="Bridge"
        count={5}
        totalValue={1000}
        activeRepairsCount={0}
        isEditing
        onCancel={onCancel}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('shows "Saving…" label and disables buttons when isSaving is true', () => {
    render(
      <AssetTypeCard
        eventKey="1"
        description="Bridge"
        count={5}
        totalValue={1000}
        activeRepairsCount={0}
        isEditing
        isSaving
      />,
    );

    expect(screen.getByRole('button', { name: 'Saving…' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled();
  });
});
