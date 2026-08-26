import {
  createRepairGroupFormState,
  RepairAssetEntry,
} from '@/pages/rec-resource-page/components/RecResourceAssetsSection/RepairAssetEntry';
import type {
  Asset,
  AssetCode,
} from '@/pages/rec-resource-page/components/RecResourceAssetsSection/types';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

const REC_RESOURCE_ID = 'REC0001';

const baseAsset: Asset = {
  asset_id: 0,
  parent_id: null,
  rec_resource_id: REC_RESOURCE_ID,
  asset_code: 0,
  asset_name: null,
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
};

const assetCodes: AssetCode[] = [
  { asset_code: 1, description: 'Picnic table' },
  { asset_code: 2, description: 'Trail' },
];

describe('RepairAssetEntry', () => {
  it('only offers asset types that have existing assets, sorted alphabetically', async () => {
    const user = userEvent.setup();
    const assetCodesWithExtra: AssetCode[] = [
      { asset_code: 1, description: 'Toilet' },
      { asset_code: 2, description: 'Picnic table' },
      { asset_code: 3, description: 'Not present' },
    ];
    const assets: Asset[] = [
      { ...baseAsset, asset_id: 1, asset_code: 1 },
      { ...baseAsset, asset_id: 2, asset_code: 2 },
    ];

    render(
      <RepairAssetEntry
        entry={createRepairGroupFormState(0)}
        assetCodes={assetCodesWithExtra}
        assets={assets}
        onChange={vi.fn()}
      />,
    );

    await user.click(screen.getByRole('combobox', { name: 'Asset type' }));

    const options = screen.getAllByRole('option');
    expect(options.map((option) => option.textContent)).toEqual([
      'Picnic table',
      'Toilet',
    ]);
  });

  it('calls onChange with a reset selection when an asset type is picked', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const assets: Asset[] = [{ ...baseAsset, asset_id: 1, asset_code: 1 }];

    render(
      <RepairAssetEntry
        entry={createRepairGroupFormState(0)}
        assetCodes={assetCodes}
        assets={assets}
        onChange={onChange}
      />,
    );

    await user.click(screen.getByRole('combobox', { name: 'Asset type' }));
    await user.click(screen.getByRole('option', { name: 'Picnic table' }));

    expect(onChange).toHaveBeenCalledWith({
      assetTypeCode: '1',
      selectedAssetIds: [],
      trailStations: {},
    });
  });

  it('renders no assets section until an asset type is selected', () => {
    render(
      <RepairAssetEntry
        entry={createRepairGroupFormState(0)}
        assetCodes={assetCodes}
        assets={[]}
        onChange={vi.fn()}
      />,
    );

    expect(screen.queryByText(/Select assets/)).not.toBeInTheDocument();
  });

  it('lists matching assets sorted by name and toggles selection via checkbox', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const assets: Asset[] = [
      { ...baseAsset, asset_id: 1, asset_code: 1, asset_name: 'B table' },
      { ...baseAsset, asset_id: 2, asset_code: 1, asset_name: 'A table' },
    ];
    const entry = { ...createRepairGroupFormState(0), assetTypeCode: '1' };

    render(
      <RepairAssetEntry
        entry={entry}
        assetCodes={assetCodes}
        assets={assets}
        onChange={onChange}
      />,
    );

    expect(screen.getByText('Select assets (0 of 2)')).toBeInTheDocument();

    await user.click(screen.getByRole('checkbox', { name: 'A table' }));

    expect(onChange).toHaveBeenCalledWith({ selectedAssetIds: [2] });
  });

  it('unchecks an already-selected asset', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const assets: Asset[] = [
      { ...baseAsset, asset_id: 1, asset_code: 1, asset_name: 'Table 1' },
    ];
    const entry = {
      ...createRepairGroupFormState(0),
      assetTypeCode: '1',
      selectedAssetIds: [1],
    };

    render(
      <RepairAssetEntry
        entry={entry}
        assetCodes={assetCodes}
        assets={assets}
        onChange={onChange}
      />,
    );

    await user.click(screen.getByRole('checkbox', { name: 'Table 1' }));

    expect(onChange).toHaveBeenCalledWith({ selectedAssetIds: [] });
  });

  it('selects every matching asset when "Select all" is clicked', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const assets: Asset[] = [
      { ...baseAsset, asset_id: 1, asset_code: 1, asset_name: 'Table 1' },
      { ...baseAsset, asset_id: 2, asset_code: 1, asset_name: 'Table 2' },
    ];
    const entry = { ...createRepairGroupFormState(0), assetTypeCode: '1' };

    render(
      <RepairAssetEntry
        entry={entry}
        assetCodes={assetCodes}
        assets={assets}
        onChange={onChange}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Select all' }));

    expect(onChange).toHaveBeenCalledWith({ selectedAssetIds: [1, 2] });
  });

  it('shows the remove button only when onRemove is provided, and calls it on click', async () => {
    const user = userEvent.setup();
    const onRemove = vi.fn();
    const { rerender } = render(
      <RepairAssetEntry
        entry={createRepairGroupFormState(0)}
        assetCodes={assetCodes}
        assets={[]}
        onChange={vi.fn()}
      />,
    );

    expect(
      screen.queryByRole('button', { name: /Remove/ }),
    ).not.toBeInTheDocument();

    rerender(
      <RepairAssetEntry
        entry={createRepairGroupFormState(0)}
        assetCodes={assetCodes}
        assets={[]}
        onChange={vi.fn()}
        onRemove={onRemove}
      />,
    );

    await user.click(screen.getByRole('button', { name: /Remove/ }));

    expect(onRemove).toHaveBeenCalledTimes(1);
  });

  it('shows the no-assets-selected error only when showErrors is true and nothing is selected', () => {
    const assets: Asset[] = [
      { ...baseAsset, asset_id: 1, asset_code: 1, asset_name: 'Table 1' },
    ];
    const entry = { ...createRepairGroupFormState(0), assetTypeCode: '1' };

    const { rerender } = render(
      <RepairAssetEntry
        entry={entry}
        assetCodes={assetCodes}
        assets={assets}
        onChange={vi.fn()}
        showErrors={false}
      />,
    );

    expect(
      screen.queryByText('Please select at least 1 asset'),
    ).not.toBeInTheDocument();

    rerender(
      <RepairAssetEntry
        entry={entry}
        assetCodes={assetCodes}
        assets={assets}
        onChange={vi.fn()}
        showErrors
      />,
    );

    expect(
      screen.getByText('Please select at least 1 asset'),
    ).toBeInTheDocument();
  });

  it('shows the estimated-cost error only when showErrors is true and cost is unset', () => {
    const assets: Asset[] = [
      { ...baseAsset, asset_id: 1, asset_code: 1, asset_name: 'Table 1' },
    ];
    const entry = {
      ...createRepairGroupFormState(0),
      assetTypeCode: '1',
      selectedAssetIds: [1],
    };

    render(
      <RepairAssetEntry
        entry={entry}
        assetCodes={assetCodes}
        assets={assets}
        onChange={vi.fn()}
        showErrors
      />,
    );

    expect(
      screen.getByText('Estimated repair cost is required'),
    ).toBeInTheDocument();
  });

  it('shows a combined secondary line for comment and parent campsite name', () => {
    const assets: Asset[] = [
      {
        ...baseAsset,
        asset_id: 100,
        asset_code: 227,
        asset_name: 'Campsite 5',
      },
      {
        ...baseAsset,
        asset_id: 1,
        asset_code: 1,
        asset_name: 'Table 1',
        asset_comment: 'Needs paint',
        parent_id: 100,
      },
    ];
    const entry = { ...createRepairGroupFormState(0), assetTypeCode: '1' };

    render(
      <RepairAssetEntry
        entry={entry}
        assetCodes={assetCodes}
        assets={assets}
        onChange={vi.fn()}
      />,
    );

    expect(screen.getByText('Needs paint - Campsite 5')).toBeInTheDocument();
  });

  it('reveals trail station fields only for trail asset types with a selected asset', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const assets: Asset[] = [
      { ...baseAsset, asset_id: 1, asset_code: 2, asset_name: 'Trail A' },
    ];
    const entryNoSelection = {
      ...createRepairGroupFormState(0),
      assetTypeCode: '2',
    };

    const { rerender } = render(
      <RepairAssetEntry
        entry={entryNoSelection}
        assetCodes={assetCodes}
        assets={assets}
        onChange={onChange}
      />,
    );

    expect(
      screen.getByText('Select a trail above to add repair coordinates.'),
    ).toBeInTheDocument();

    const entrySelected = {
      ...entryNoSelection,
      selectedAssetIds: [1],
    };

    rerender(
      <RepairAssetEntry
        entry={entrySelected}
        assetCodes={assetCodes}
        assets={assets}
        onChange={onChange}
      />,
    );

    expect(screen.getByLabelText('Start station')).toBeInTheDocument();

    await user.type(screen.getByLabelText('Start station'), '4');

    expect(onChange).toHaveBeenCalledWith({
      trailStations: {
        1: { startStation: '4', endStation: '' },
      },
    });
  });

  it('shows a validation error for malformed trail station coordinates', () => {
    const assets: Asset[] = [
      { ...baseAsset, asset_id: 1, asset_code: 2, asset_name: 'Trail A' },
    ];
    const entry = {
      ...createRepairGroupFormState(0),
      assetTypeCode: '2',
      selectedAssetIds: [1],
      trailStations: {
        1: { startStation: 'bad-value', endStation: '' },
      },
    };

    render(
      <RepairAssetEntry
        entry={entry}
        assetCodes={assetCodes}
        assets={assets}
        onChange={vi.fn()}
        showErrors
      />,
    );

    expect(
      screen.getAllByText(
        'Enter coordinates as lat,long (e.g. 49.1232,-128.3030)',
      ).length,
      // one for the malformed start station; end station is blank, which is valid
    ).toBe(1);
  });
});
