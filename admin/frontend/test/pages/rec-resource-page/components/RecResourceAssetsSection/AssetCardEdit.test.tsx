import { AssetCardEdit } from '@/pages/rec-resource-page/components/RecResourceAssetsSection/AssetCardEdit';
import type {
  Asset,
  AssetRepair,
  RepairCode,
} from '@/pages/rec-resource-page/components/RecResourceAssetsSection/types';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock(
  '@/services/hooks/recreation-resource-admin/useUpdateAssetRepair',
  () => ({ useUpdateAssetRepair: vi.fn() }),
);
vi.mock(
  '@/services/hooks/recreation-resource-admin/useCreateAssetRepair',
  () => ({ useCreateAssetRepair: vi.fn() }),
);

import * as useUpdateAssetRepairModule from '@/services/hooks/recreation-resource-admin/useUpdateAssetRepair';
import * as useCreateAssetRepairModule from '@/services/hooks/recreation-resource-admin/useCreateAssetRepair';

const buildAsset = (overrides: Partial<Asset> = {}): Asset => ({
  asset_id: 1,
  parent_id: null,
  rec_resource_id: 'REC001',
  asset_code: 100,
  asset_name: 'My Bridge',
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

const buildRepair = (overrides: Partial<AssetRepair> = {}): AssetRepair => ({
  repair_id: 1,
  asset_id: 1,
  recreation_remed_repair_code: 'R1',
  estimated_repair_cost: null,
  actual_repair_cost: null,
  repair_completed_date: null,
  urgency: null,
  trail_segment_start: null,
  trail_segment_end: null,
  created_by: null,
  created_at: null,
  updated_by: null,
  updated_at: null,
  ...overrides,
});

const repairCodes: RepairCode[] = [
  { recreation_remed_repair_code: 'R1', description: 'Paint touch-up' },
];

const defaultProps = {
  asset: buildAsset(),
  repairCodes,
  recResourceId: 'REC001',
  onChange: vi.fn(),
};

describe('AssetCardEdit', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useUpdateAssetRepairModule.useUpdateAssetRepair).mockReturnValue({
      mutate: vi.fn(),
    } as any);
    vi.mocked(useCreateAssetRepairModule.useCreateAssetRepair).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as any);
  });

  it('renders the asset name in the card title', () => {
    render(<AssetCardEdit {...defaultProps} />);
    expect(screen.getByText('My Bridge')).toBeInTheDocument();
  });

  it('renders edit form fields', () => {
    render(<AssetCardEdit {...defaultProps} />);
    expect(screen.getByLabelText('Asset description')).toBeInTheDocument();
    expect(screen.getByLabelText('Longitude')).toBeInTheDocument();
    expect(screen.getByLabelText('Latitude')).toBeInTheDocument();
  });

  it('hides dimension fields for campsite assets', () => {
    render(
      <AssetCardEdit
        {...defaultProps}
        asset={buildAsset({ asset_code: 227 })}
      />,
    );
    expect(screen.queryByLabelText('Length')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Width')).not.toBeInTheDocument();
  });

  it('calls onChange with the asset id and form values when a field changes', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<AssetCardEdit {...defaultProps} onChange={onChange} />);

    const nameInput = screen.getByLabelText('Asset description');
    await user.clear(nameInput);
    await user.type(nameInput, 'New Name');

    expect(onChange).toHaveBeenCalledWith(1, expect.any(Object));
  });

  it('renders the Show repairs toggle from AssetCardRepairsEdit', () => {
    render(
      <AssetCardEdit
        {...defaultProps}
        asset={buildAsset({ recreation_asset_repair: [buildRepair()] })}
      />,
    );
    expect(
      screen.getByRole('button', { name: 'Show repairs' }),
    ).toBeInTheDocument();
  });

  it('uses empty repairs array when recreation_asset_repair is null', () => {
    render(
      <AssetCardEdit
        {...defaultProps}
        asset={buildAsset({ recreation_asset_repair: null })}
      />,
    );
    expect(
      screen.getByRole('button', { name: 'Show repairs' }),
    ).toBeInTheDocument();
  });

  it('applies custom className to the card', () => {
    const { container } = render(
      <AssetCardEdit {...defaultProps} className="my-custom-class" />,
    );
    expect(container.querySelector('.my-custom-class')).toBeTruthy();
  });
});
