import { BulkAddCampsitesModal } from '@/pages/rec-resource-page/components/RecResourceAssetsSection/BulkAddCampsitesModal';
import { useCreateBulkAssets } from '@/services/hooks/recreation-resource-admin';
import type { Asset } from '@/pages/rec-resource-page/components/RecResourceAssetsSection/types';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/services/hooks/recreation-resource-admin', () => ({
  useCreateBulkAssets: vi.fn(),
}));

const buildAsset = (overrides: Partial<Asset> = {}): Asset => ({
  asset_id: 1,
  parent_id: null,
  rec_resource_id: 'REC123',
  asset_code: 227,
  asset_name: 'Campsite 1',
  asset_tag: null,
  asset_comment: null,
  legacy_structure_id: null,
  asset_length: null,
  asset_width: null,
  asset_area: null,
  actual_value: null,
  installation_date: null,
  updated_by: null,
  updated_at: null,
  geometry_type_code: null,
  latitude: null,
  longitude: null,
  recreation_asset_repair: null,
  ...overrides,
});

describe('BulkAddCampsitesModal', () => {
  const mockMutateAsync = vi.fn();

  const defaultProps = {
    show: true,
    recResourceId: 'REC123',
    existingAssets: [],
    onCancel: vi.fn(),
    onCreate: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useCreateBulkAssets).mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: false,
    } as any);
  });

  it('renders the modal title', () => {
    render(<BulkAddCampsitesModal {...defaultProps} />);
    expect(screen.getByText('Add campsites')).toBeInTheDocument();
  });

  it('shows 0 campsites currently when existingAssets is empty', () => {
    render(<BulkAddCampsitesModal {...defaultProps} />);
    expect(screen.getByText('0 campsites currently')).toBeInTheDocument();
  });

  it('shows correct count of existing campsites', () => {
    render(
      <BulkAddCampsitesModal
        {...defaultProps}
        existingAssets={[
          buildAsset({ asset_id: 1 }),
          buildAsset({ asset_id: 2 }),
        ]}
      />,
    );
    expect(screen.getByText('2 campsites currently')).toBeInTheDocument();
  });

  it('shows singular "campsite" for 1 existing campsite', () => {
    render(
      <BulkAddCampsitesModal
        {...defaultProps}
        existingAssets={[buildAsset({ asset_id: 1 })]}
      />,
    );
    expect(screen.getByText('1 campsite currently')).toBeInTheDocument();
  });

  it('renders the preview with campsite name and ID for default quantity of 1', () => {
    render(<BulkAddCampsitesModal {...defaultProps} />);
    expect(screen.getByText('Campsite 1')).toBeInTheDocument();
  });

  it('updates preview names when quantity is increased', async () => {
    const user = userEvent.setup();
    render(<BulkAddCampsitesModal {...defaultProps} />);

    await user.click(screen.getByRole('button', { name: 'Increase quantity' }));

    expect(screen.getByText('Creating 2 campsites')).toBeInTheDocument();
    expect(screen.getByText('Campsite 2')).toBeInTheDocument();
  });

  it('calls mutateAsync and onCreate/onCancel when submitted', async () => {
    const user = userEvent.setup();
    mockMutateAsync.mockResolvedValueOnce(undefined);
    const onCreate = vi.fn();
    const onCancel = vi.fn();

    render(
      <BulkAddCampsitesModal
        {...defaultProps}
        onCreate={onCreate}
        onCancel={onCancel}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Create 1 campsite' }));

    expect(mockMutateAsync).toHaveBeenCalledWith(
      expect.objectContaining({
        recResourceId: 'REC123',
        assets: expect.arrayContaining([
          expect.objectContaining({
            asset_name: 'Campsite 1',
            asset_code: 227,
          }),
        ]),
      }),
    );
    expect(onCreate).toHaveBeenCalledTimes(1);
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('calls onCancel when Cancel button is clicked', async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();

    render(<BulkAddCampsitesModal {...defaultProps} onCancel={onCancel} />);

    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(mockMutateAsync).not.toHaveBeenCalled();
  });

  it('numbers new campsites starting from highest existing number + 1', () => {
    render(
      <BulkAddCampsitesModal
        {...defaultProps}
        existingAssets={[
          buildAsset({ asset_id: 1, asset_name: 'Campsite 3' }),
          buildAsset({ asset_id: 2, asset_name: 'Campsite 7' }),
        ]}
      />,
    );

    expect(screen.getByText('Campsite 8')).toBeInTheDocument();
  });

  it('shows "Creating…" label when isPending', () => {
    vi.mocked(useCreateBulkAssets).mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: true,
    } as any);

    render(<BulkAddCampsitesModal {...defaultProps} />);

    expect(screen.getByRole('button', { name: 'Creating…' })).toBeDisabled();
  });
});
