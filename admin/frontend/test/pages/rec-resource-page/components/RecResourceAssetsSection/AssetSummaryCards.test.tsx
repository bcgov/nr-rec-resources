import { AssetSummaryCards } from '@/pages/rec-resource-page/components/RecResourceAssetsSection/AssetSummaryCards';
import type { AssetSummary } from '@/pages/rec-resource-page/components/RecResourceAssetsSection/types';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

const buildSummary = (overrides: Partial<AssetSummary> = {}): AssetSummary => ({
  total_assets: 10,
  total_campsites: 0,
  total_value: 5000,
  outstanding_repairs: 2,
  spent_to_date: 300,
  last_inspection_date: new Date('2024-09-11'),
  last_hzd_tree_assessment_date: new Date('2024-05-02'),
  ...overrides,
});

describe('AssetSummaryCards', () => {
  it('renders the total asset count', () => {
    render(<AssetSummaryCards summary={buildSummary({ total_assets: 10 })} />);

    expect(screen.getByText('Assets')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
  });

  it('shows a campsite subtitle when there are campsites', () => {
    render(
      <AssetSummaryCards summary={buildSummary({ total_campsites: 3 })} />,
    );

    expect(screen.getByText('3 campsites')).toBeInTheDocument();
  });

  it('omits the campsite subtitle when there are no campsites', () => {
    render(
      <AssetSummaryCards summary={buildSummary({ total_campsites: 0 })} />,
    );

    expect(screen.queryByText(/campsites/)).not.toBeInTheDocument();
  });

  it('renders the formatted total value', () => {
    render(<AssetSummaryCards summary={buildSummary({ total_value: 5000 })} />);

    expect(screen.getByText('$5,000')).toBeInTheDocument();
  });

  it('renders outstanding repairs and amount spent to date', () => {
    render(
      <AssetSummaryCards
        summary={buildSummary({ outstanding_repairs: 4, spent_to_date: 750 })}
      />,
    );

    expect(screen.getByText('Outstanding repairs')).toBeInTheDocument();
    expect(screen.getByText('4')).toBeInTheDocument();
    expect(screen.getByText('$750 spent to date')).toBeInTheDocument();
  });

  it('renders formatted inspection dates', () => {
    render(
      <AssetSummaryCards
        summary={buildSummary({
          last_inspection_date: new Date('2024-09-11'),
          last_hzd_tree_assessment_date: new Date('2024-05-02'),
        })}
      />,
    );

    expect(screen.getByText(/Sep 11, 2024/)).toBeInTheDocument();
    expect(screen.getByText(/May 2, 2024/)).toBeInTheDocument();
  });

  it('shows a fallback message when inspection dates are missing', () => {
    render(
      <AssetSummaryCards
        summary={buildSummary({
          last_inspection_date: null,
          last_hzd_tree_assessment_date: null,
        })}
      />,
    );

    expect(screen.getAllByText('No inspection recorded')).toHaveLength(2);
  });
});
