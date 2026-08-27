import { AssetCardEditForm } from '@/pages/rec-resource-page/components/RecResourceAssetsSection/AssetCardEditForm';
import type {
  Asset,
  AssetCode,
} from '@/pages/rec-resource-page/components/RecResourceAssetsSection/types';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

const buildAsset = (overrides: Partial<Asset> = {}): Asset => ({
  asset_id: 1,
  parent_id: null,
  rec_resource_id: 'REC001',
  asset_code: 100,
  asset_name: 'Test Asset',
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

// Asset code that enables all dimension fields for asset_code 100
const assetCodesWithDimensions: AssetCode[] = [
  {
    asset_code: 100,
    description: 'Bridge',
    has_length: true,
    has_width: true,
    has_area: true,
  },
];

describe('AssetCardEditForm', () => {
  it('renders all fields for a non-campsite asset', () => {
    render(
      <AssetCardEditForm
        asset={buildAsset()}
        assetCodes={assetCodesWithDimensions}
        onChange={vi.fn()}
      />,
    );
    expect(screen.getByLabelText('Asset name')).toBeInTheDocument();
    expect(screen.getByLabelText('Length')).toBeInTheDocument();
    expect(screen.getByLabelText('Width')).toBeInTheDocument();
    expect(screen.getByLabelText('Area')).toBeInTheDocument();
    expect(screen.getByLabelText('Longitude')).toBeInTheDocument();
    expect(screen.getByLabelText('Latitude')).toBeInTheDocument();
    expect(screen.getByLabelText('Default Value')).toBeInTheDocument();
    expect(screen.getByLabelText('Actual Value')).toBeInTheDocument();
  });

  it('disables Length/Width/Area when asset code has no dimension flags', () => {
    render(<AssetCardEditForm asset={buildAsset()} onChange={vi.fn()} />);
    expect(screen.getByLabelText('Length')).toBeDisabled();
    expect(screen.getByLabelText('Width')).toBeDisabled();
    expect(screen.getByLabelText('Area')).toBeDisabled();
  });

  it('hides dimension and value fields for campsite assets (code 227)', () => {
    render(
      <AssetCardEditForm
        asset={buildAsset({ asset_code: 227 })}
        onChange={vi.fn()}
      />,
    );
    expect(screen.queryByLabelText('Length')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Width')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Area')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Default Value')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Actual Value')).not.toBeInTheDocument();
    expect(screen.getByLabelText('Longitude')).toBeInTheDocument();
    expect(screen.getByLabelText('Latitude')).toBeInTheDocument();
  });

  it('pre-populates fields from asset values', () => {
    render(
      <AssetCardEditForm
        asset={buildAsset({ asset_name: 'Bridge A', asset_length: 12 })}
        assetCodes={assetCodesWithDimensions}
        onChange={vi.fn()}
      />,
    );
    expect(screen.getByLabelText<HTMLInputElement>('Asset name').value).toBe(
      'Bridge A',
    );
    expect(screen.getByLabelText<HTMLInputElement>('Length').value).toBe('12');
  });

  it('calls onChange with parsed numeric value when a field changes', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <AssetCardEditForm
        asset={buildAsset()}
        assetCodes={assetCodesWithDimensions}
        onChange={onChange}
      />,
    );
    await user.type(screen.getByLabelText('Length'), '20');
    expect(onChange).toHaveBeenLastCalledWith(
      1,
      expect.objectContaining({ asset_length: 20 }),
    );
  });

  it('calls onChange with null for cleared numeric fields', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <AssetCardEditForm
        asset={buildAsset({ asset_length: 10 })}
        assetCodes={assetCodesWithDimensions}
        onChange={onChange}
      />,
    );
    await user.clear(screen.getByLabelText('Length'));
    expect(onChange).toHaveBeenLastCalledWith(
      1,
      expect.objectContaining({ asset_length: null }),
    );
  });

  it('calls onChange with null asset_name when name field is cleared', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <AssetCardEditForm
        asset={buildAsset({ asset_name: 'Old' })}
        onChange={onChange}
      />,
    );
    await user.clear(screen.getByLabelText('Asset name'));
    expect(onChange).toHaveBeenLastCalledWith(
      1,
      expect.objectContaining({ asset_name: null }),
    );
  });

  it('uses the asset id as first onChange argument', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <AssetCardEditForm
        asset={buildAsset({ asset_id: 99 })}
        onChange={onChange}
      />,
    );
    await user.type(screen.getByLabelText('Longitude'), '5');
    expect(onChange).toHaveBeenLastCalledWith(99, expect.any(Object));
  });
});
