import { AssetCard } from '@/pages/rec-resource-page/components/RecResourceAssetsSection/AssetCard';
import type {
  Asset,
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
          default_value: 1000,
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
      'Latitude',
      'Longitude',
    ]);

    expect(screen.getByText('50')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
    // actual_value takes precedence over default_value
    expect(screen.getByText('$900')).toBeInTheDocument();
    // repair spend sums actual_repair_cost across all repairs
    expect(screen.getByText('$300')).toBeInTheDocument();
    // outstanding estimate sums estimated_repair_cost for repairs with no completion date
    expect(screen.getByText('$50')).toBeInTheDocument();
    expect(screen.getByText('49.1')).toBeInTheDocument();
    expect(screen.getByText('-123.1')).toBeInTheDocument();
  });

  it('falls back to default_value when actual_value is missing', () => {
    render(
      <AssetCard
        asset={buildAsset({ default_value: 1000 })}
        repairCodes={[]}
      />,
    );

    expect(screen.getByText('$1,000')).toBeInTheDocument();
  });

  it('shows a dash for every field with no value', () => {
    render(<AssetCard asset={buildAsset()} repairCodes={[]} />);

    expect(screen.getAllByText('—')).toHaveLength(8);
  });

  it('shows a dash for repair spend and outstanding estimate when there are no repairs', () => {
    render(
      <AssetCard
        asset={buildAsset({ recreation_asset_repair: [] })}
        repairCodes={[]}
      />,
    );

    expect(screen.getAllByText('—')).toHaveLength(8);
  });

  it('renders $0 repair spend when repairs exist but none have an actual cost', () => {
    render(
      <AssetCard
        asset={buildAsset({
          recreation_asset_repair: [
            buildRepair({
              actual_repair_cost: null,
              estimated_repair_cost: 25,
            }),
          ],
        })}
        repairCodes={[]}
      />,
    );

    expect(screen.getByText('$0')).toBeInTheDocument();
    expect(screen.getByText('$25')).toBeInTheDocument();
  });

  it('only shows value, repair spend, latitude, and longitude for campsites', () => {
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
    expect(labels).toEqual(['Value', 'Repair spend', 'Latitude', 'Longitude']);

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
