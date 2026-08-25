import { BulkAddAssetsModal } from '@/pages/rec-resource-page/components/RecResourceAssetsSection/BulkAddAssetsModal';
import { useCreateBulkAssets } from '@/services/hooks/recreation-resource-admin';
import type {
  Asset,
  AssetCode,
} from '@/pages/rec-resource-page/components/RecResourceAssetsSection/types';
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
  asset_code: 100,
  asset_name: 'Bridge 1',
  asset_tag: null,
  asset_comment: null,
  legacy_structure_id: null,
  asset_length: null,
  asset_width: null,
  asset_area: null,
  default_value: null,
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

const assetCodes: AssetCode[] = [
  {
    asset_code: 100,
    description: 'Bridge',
    has_length: true,
    has_width: true,
    has_area: false,
    default_value: 5000,
  },
  {
    asset_code: 200,
    description: 'Picnic Table',
    has_length: false,
    has_width: false,
    has_area: false,
    default_value: null,
  },
];

describe('BulkAddAssetsModal', () => {
  const mockMutateAsync = vi.fn();

  const defaultProps = {
    show: true,
    recResourceId: 'REC123',
    assetCodes,
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
    render(<BulkAddAssetsModal {...defaultProps} />);
    expect(screen.getByText('Add assets')).toBeInTheDocument();
  });

  it('renders asset type dropdown with all non-campsite options', () => {
    render(<BulkAddAssetsModal {...defaultProps} />);
    expect(screen.getByRole('option', { name: 'Bridge' })).toBeInTheDocument();
    expect(
      screen.getByRole('option', { name: 'Picnic Table' }),
    ).toBeInTheDocument();
  });

  it('submit button is disabled when no asset type is selected', () => {
    render(<BulkAddAssetsModal {...defaultProps} />);
    expect(
      screen.getByRole('button', { name: 'Create 1 asset' }),
    ).toBeDisabled();
  });

  it('enables submit when an asset type is selected', async () => {
    const user = userEvent.setup();
    render(<BulkAddAssetsModal {...defaultProps} />);

    await user.selectOptions(
      screen.getByRole('combobox', { name: 'Asset type' }),
      '100',
    );

    expect(
      screen.getByRole('button', { name: 'Create 1 asset' }),
    ).not.toBeDisabled();
  });

  it('shows preview section after selecting an asset type', async () => {
    const user = userEvent.setup();
    render(<BulkAddAssetsModal {...defaultProps} />);

    await user.selectOptions(
      screen.getByRole('combobox', { name: 'Asset type' }),
      '100',
    );

    expect(screen.getByText('Creating 1 asset')).toBeInTheDocument();
    expect(screen.getByText('Bridge 1')).toBeInTheDocument();
  });

  it('enables length and width fields when asset type has_length and has_width', async () => {
    const user = userEvent.setup();
    render(<BulkAddAssetsModal {...defaultProps} />);

    await user.selectOptions(
      screen.getByRole('combobox', { name: 'Asset type' }),
      '100',
    );

    expect(screen.getByLabelText('Length (m)')).not.toBeDisabled();
    expect(screen.getByLabelText('Width (m)')).not.toBeDisabled();
    expect(screen.getByLabelText('Area (m²)')).toBeDisabled();
  });

  it('pre-fills default value from asset code on type selection', async () => {
    const user = userEvent.setup();
    render(<BulkAddAssetsModal {...defaultProps} />);

    await user.selectOptions(
      screen.getByRole('combobox', { name: 'Asset type' }),
      '100',
    );

    expect(screen.getByLabelText('Default value')).toHaveValue(5000);
  });

  it('updates quantity label when quantity is increased', async () => {
    const user = userEvent.setup();
    render(<BulkAddAssetsModal {...defaultProps} />);

    await user.selectOptions(
      screen.getByRole('combobox', { name: 'Asset type' }),
      '100',
    );
    await user.click(screen.getByRole('button', { name: 'Increase quantity' }));

    expect(
      screen.getByRole('button', { name: 'Create 2 assets' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Creating 2 assets')).toBeInTheDocument();
  });

  it('calls mutateAsync and onCreate/onCancel on submit', async () => {
    const user = userEvent.setup();
    mockMutateAsync.mockResolvedValueOnce(undefined);
    const onCreate = vi.fn();
    const onCancel = vi.fn();

    render(
      <BulkAddAssetsModal
        {...defaultProps}
        onCreate={onCreate}
        onCancel={onCancel}
      />,
    );

    await user.selectOptions(
      screen.getByRole('combobox', { name: 'Asset type' }),
      '100',
    );
    await user.click(screen.getByRole('button', { name: 'Create 1 asset' }));

    expect(mockMutateAsync).toHaveBeenCalledWith(
      expect.objectContaining({
        recResourceId: 'REC123',
        assets: expect.arrayContaining([
          expect.objectContaining({
            asset_code: 100,
            rec_resource_id: 'REC123',
          }),
        ]),
      }),
    );
    expect(onCreate).toHaveBeenCalledTimes(1);
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('calls onCancel when Cancel is clicked without submitting', async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();

    render(<BulkAddAssetsModal {...defaultProps} onCancel={onCancel} />);

    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(mockMutateAsync).not.toHaveBeenCalled();
  });

  it('shows campsite dropdown in the row preview when there are campsites', async () => {
    const user = userEvent.setup();
    const campsite = buildAsset({
      asset_id: 5,
      asset_code: 227,
      asset_name: 'Campsite 1',
    });

    render(
      <BulkAddAssetsModal {...defaultProps} existingAssets={[campsite]} />,
    );

    await user.selectOptions(
      screen.getByRole('combobox', { name: 'Asset type' }),
      '100',
    );

    expect(
      screen.getByRole('option', { name: 'Campsite 1' }),
    ).toBeInTheDocument();
  });

  it('shows "Creating…" label when isPending', () => {
    vi.mocked(useCreateBulkAssets).mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: true,
    } as any);

    render(<BulkAddAssetsModal {...defaultProps} />);

    expect(screen.getByRole('button', { name: 'Creating…' })).toBeDisabled();
  });
});
