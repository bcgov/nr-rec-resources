import { AssetCard } from '@/pages/rec-resource-page/components/RecResourceAssetsSection/AssetCard';
import type {
  Asset,
  AssetCode,
  AssetRepair,
} from '@/pages/rec-resource-page/components/RecResourceAssetsSection/types';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

const buildAsset = (overrides: Partial<Asset> = {}): Asset => ({
  asset_id: 1,
  parent_id: null,
  rec_resource_id: 'REC123',
  asset_code: 1,
  asset_name: 'Main bridge',
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

describe('AssetCard', () => {
  it('renders the asset name', () => {
    render(
      <AssetCard
        asset={buildAsset({ asset_name: 'Main bridge' })}
        repairCodes={[]}
      />,
    );

    expect(screen.getByText('Main bridge')).toBeInTheDocument();
  });

  it('renders all fields, in order, when populated', () => {
    render(
      <AssetCard
        asset={buildAsset({
          asset_area: 50,
          asset_length: 10,
          asset_width: 5,
          actual_value: 900,
          latitude: 49.1,
          longitude: -123.1,
          recreation_asset_repair: [
            buildRepair({
              repair_id: 1,
              actual_repair_cost: 100,
              estimated_repair_cost: 50,
              repair_completed_date: null,
            }),
            buildRepair({
              repair_id: 2,
              actual_repair_cost: 200,
              estimated_repair_cost: 999,
              repair_completed_date: '2024-01-15',
            }),
          ],
        })}
        repairCodes={[]}
      />,
    );

    const labels = screen
      .getAllByText(/:$/)
      .map((el) => el.textContent?.replace(':', ''));
    expect(labels).toEqual([
      'Area',
      'Length',
      'Width',
      'Value',
      'Repair spend',
      'Outstanding estimate',
      'Location',
    ]);

    expect(screen.getByText('50')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
    // actual_value takes precedence over default_value
    expect(screen.getByText('$900')).toBeInTheDocument();
    // repair spend sums actual_repair_cost for completed repairs only (repair 1
    // is excluded here since it has no completion date)
    expect(screen.getByText('$200')).toBeInTheDocument();
    // outstanding estimate sums estimated_repair_cost for repairs with no completion date
    expect(screen.getByText('$50')).toBeInTheDocument();
    expect(screen.getByText('49.1,-123.1')).toBeInTheDocument();
  });

  it('falls back to default_value from asset code when actual_value is missing', () => {
    const assetCodes: AssetCode[] = [{ asset_code: 1, default_value: 1000 }];
    render(
      <AssetCard
        asset={buildAsset()}
        assetCodes={assetCodes}
        repairCodes={[]}
      />,
    );

    expect(screen.getByText('$1,000')).toBeInTheDocument();
  });

  it('shows a dash for every field with no value', () => {
    render(<AssetCard asset={buildAsset()} repairCodes={[]} />);

    expect(screen.getAllByText('-')).toHaveLength(7);
  });

  it('shows a dash for repair spend and outstanding estimate when there are no repairs', () => {
    render(
      <AssetCard
        asset={buildAsset({ recreation_asset_repair: [] })}
        repairCodes={[]}
      />,
    );

    expect(screen.getAllByText('-')).toHaveLength(7);
  });

  it('shows a dash for location when only one of latitude/longitude is set', () => {
    render(
      <AssetCard
        asset={buildAsset({ latitude: 49.1, longitude: null })}
        repairCodes={[]}
      />,
    );

    expect(screen.getByText('Location:')).toBeInTheDocument();
    expect(screen.queryByText(/^49\.1/)).not.toBeInTheDocument();
    expect(screen.getAllByText('-')).toHaveLength(7);
  });

  it('excludes repairs with no completion date from repair spend', () => {
    render(
      <AssetCard
        asset={buildAsset({
          recreation_asset_repair: [
            buildRepair({
              actual_repair_cost: 100,
              repair_completed_date: null,
            }),
          ],
        })}
        repairCodes={[]}
      />,
    );

    const repairSpendField = screen
      .getByText('Repair spend:')
      .closest('.asset-card__field');
    expect(repairSpendField).toHaveTextContent('$0');
  });

  it('falls back to estimated cost when a completed repair has no actual cost', () => {
    render(
      <AssetCard
        asset={buildAsset({
          recreation_asset_repair: [
            buildRepair({
              actual_repair_cost: null,
              estimated_repair_cost: 25,
              repair_completed_date: '2024-01-15',
            }),
          ],
        })}
        repairCodes={[]}
      />,
    );

    expect(screen.getByText('$25')).toBeInTheDocument();
  });

  it('only shows value, repair spend, and location for campsites', () => {
    render(
      <AssetCard
        asset={buildAsset({
          asset_code: 227,
          asset_area: 50,
          asset_length: 10,
          asset_width: 5,
          actual_value: 900,
          latitude: 49.1,
          longitude: -123.1,
          recreation_asset_repair: [
            buildRepair({
              actual_repair_cost: 100,
              repair_completed_date: null,
            }),
          ],
        })}
        repairCodes={[]}
      />,
    );

    const labels = screen
      .getAllByText(/:$/)
      .map((el) => el.textContent?.replace(':', ''));
    expect(labels).toEqual(['Value', 'Repair spend', 'Location']);

    expect(screen.queryByText('Area:')).not.toBeInTheDocument();
    expect(screen.queryByText('Length:')).not.toBeInTheDocument();
    expect(screen.queryByText('Width:')).not.toBeInTheDocument();
    expect(screen.queryByText('Outstanding estimate:')).not.toBeInTheDocument();
  });

  it('applies an additional className', () => {
    const { container } = render(
      <AssetCard
        asset={buildAsset()}
        repairCodes={[]}
        className="asset-card--campsite"
      />,
    );

    expect(container.querySelector('.asset-card--campsite')).toBeTruthy();
  });

  it('passes repairs and repair codes through to AssetCardRepairs', () => {
    render(
      <AssetCard
        asset={buildAsset({
          recreation_asset_repair: [buildRepair()],
        })}
        repairCodes={[
          { recreation_remed_repair_code: 'R1', description: 'Paint touch-up' },
        ]}
      />,
    );

    expect(
      screen.getByRole('button', { name: /Show repairs/ }),
    ).toBeInTheDocument();
  });
});
