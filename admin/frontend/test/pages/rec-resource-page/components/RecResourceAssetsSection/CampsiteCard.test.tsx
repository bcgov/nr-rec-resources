import { CampsiteCard } from '@/pages/rec-resource-page/components/RecResourceAssetsSection/CampsiteCard';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

describe('CampsiteCard', () => {
  it('renders the description', () => {
    render(
      <CampsiteCard
        eventKey="1"
        description="Campsite A"
        structureCount={2}
        totalValue={1500}
      />,
    );

    expect(screen.getByText('Campsite A')).toBeInTheDocument();
  });

  it('renders the structure count and formatted total value', () => {
    render(
      <CampsiteCard
        eventKey="1"
        description="Campsite A"
        structureCount={2}
        totalValue={1500}
      />,
    );

    expect(screen.getByText('2 assets')).toBeInTheDocument();
    expect(screen.getByText('$1,500 total value')).toBeInTheDocument();
  });

  it('renders the singular "asset" label when the structure count is 1', () => {
    render(
      <CampsiteCard
        eventKey="1"
        description="Campsite A"
        structureCount={1}
        totalValue={1500}
      />,
    );

    expect(screen.getByText('1 asset')).toBeInTheDocument();
  });

  it('renders children content', () => {
    render(
      <CampsiteCard
        eventKey="1"
        description="Campsite A"
        structureCount={2}
        totalValue={1500}
      >
        <div>Child campsite content</div>
      </CampsiteCard>,
    );

    expect(screen.getByText('Child campsite content')).toBeInTheDocument();
  });

  it('is collapsed by default', () => {
    render(
      <CampsiteCard
        eventKey="1"
        description="Campsite A"
        structureCount={2}
        totalValue={1500}
      />,
    );

    expect(screen.getByRole('button', { name: /Campsite A/ })).toHaveAttribute(
      'aria-expanded',
      'false',
    );
  });

  it('renders Edit button when onEdit is provided and handles click', async () => {
    const user = userEvent.setup();
    const onEdit = vi.fn();

    render(
      <CampsiteCard
        eventKey="1"
        description="Campsite A"
        structureCount={2}
        totalValue={1500}
        onEdit={onEdit}
      />,
    );

    const editBtn = screen.getByRole('button', { name: 'Edit' });
    expect(editBtn).toBeInTheDocument();

    await user.click(editBtn);
    expect(onEdit).toHaveBeenCalledTimes(1);
  });

  it('disables Edit button when isDisabled is true', () => {
    const onEdit = vi.fn();

    render(
      <CampsiteCard
        eventKey="1"
        description="Campsite A"
        structureCount={2}
        totalValue={1500}
        isDisabled={true}
        onEdit={onEdit}
      />,
    );

    expect(screen.getByRole('button', { name: 'Edit' })).toBeDisabled();
  });

  it('renders Cancel and Save changes buttons when isEditing is true', async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();
    const onSave = vi.fn();

    render(
      <CampsiteCard
        eventKey="1"
        description="Campsite A"
        structureCount={2}
        totalValue={1500}
        isEditing={true}
        onCancel={onCancel}
        onSave={onSave}
      />,
    );

    const cancelBtn = screen.getByRole('button', { name: 'Cancel' });
    const saveBtn = screen.getByRole('button', { name: 'Save changes' });

    expect(cancelBtn).toBeInTheDocument();
    expect(saveBtn).toBeInTheDocument();

    await user.click(cancelBtn);
    expect(onCancel).toHaveBeenCalledTimes(1);

    await user.click(saveBtn);
    expect(onSave).toHaveBeenCalledTimes(1);
  });

  it('renders Saving... text and disables action buttons when isSaving is true', () => {
    render(
      <CampsiteCard
        eventKey="1"
        description="Campsite A"
        structureCount={2}
        totalValue={1500}
        isEditing={true}
        isSaving={true}
      />,
    );

    const cancelBtn = screen.getByRole('button', { name: 'Cancel' });
    const saveBtn = screen.getByRole('button', { name: 'Saving…' });

    expect(cancelBtn).toBeDisabled();
    expect(saveBtn).toBeDisabled();
  });
});
