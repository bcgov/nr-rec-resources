import { AssetCard } from '@/pages/rec-resource-page/components/RecResourceAssetsSection/AssetCard';
import type { Asset } from '@/pages/rec-resource-page/components/RecResourceAssetsSection/types';
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

  it('renders populated fields', () => {
    render(
      <AssetCard
        asset={buildAsset({
          asset_tag: 'TAG-1',
          asset_length: 10,
          asset_width: 5,
          asset_area: 50,
          default_value: 1000,
          actual_value: 900,
          installation_date: '2024-01-15',
          legacy_structure_id: 'LEG-1',
          asset_comment: 'Needs paint',
        })}
        repairCodes={[]}
      />,
    );

    expect(screen.getByText('TAG-1')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('50')).toBeInTheDocument();
    expect(screen.getByText('$1,000')).toBeInTheDocument();
    expect(screen.getByText('$900')).toBeInTheDocument();
    expect(screen.getByText('LEG-1')).toBeInTheDocument();
    expect(screen.getByText('Needs paint')).toBeInTheDocument();
    expect(screen.getByText(/Jan 15, 2024/)).toBeInTheDocument();
  });

  it('omits fields with no value', () => {
    render(<AssetCard asset={buildAsset()} repairCodes={[]} />);

    expect(screen.queryByText('Asset tag:')).not.toBeInTheDocument();
    expect(screen.queryByText('Comment:')).not.toBeInTheDocument();
  });

  it('renders default_value of 0 (falsy but valid)', () => {
    render(
      <AssetCard asset={buildAsset({ default_value: 0 })} repairCodes={[]} />,
    );

    expect(screen.getByText('Default value:')).toBeInTheDocument();
    expect(screen.getByText('$0')).toBeInTheDocument();
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
          recreation_asset_repair: [
            {
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
            },
          ],
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
