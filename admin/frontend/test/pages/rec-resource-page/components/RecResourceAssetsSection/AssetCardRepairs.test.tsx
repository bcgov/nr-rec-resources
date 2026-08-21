import { AssetCardRepairs } from '@/pages/rec-resource-page/components/RecResourceAssetsSection/AssetCardRepairs';
import type {
  AssetRepair,
  RepairCode,
} from '@/pages/rec-resource-page/components/RecResourceAssetsSection/types';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

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

describe('AssetCardRepairs', () => {
  it('starts collapsed, showing "Show repairs"', () => {
    render(<AssetCardRepairs repairs={[]} repairCodes={[]} />);

    expect(
      screen.getByRole('button', { name: 'Show repairs' }),
    ).toBeInTheDocument();
    expect(
      screen.queryByText('This asset has no repairs'),
    ).not.toBeInTheDocument();
  });

  it('expands to show repairs on click', async () => {
    const user = userEvent.setup();
    render(<AssetCardRepairs repairs={[]} repairCodes={[]} />);

    await user.click(screen.getByRole('button', { name: 'Show repairs' }));

    expect(
      screen.getByRole('button', { name: 'Hide repairs' }),
    ).toBeInTheDocument();
    expect(screen.getByText('This asset has no repairs')).toBeInTheDocument();
  });

  it('collapses again on second click', async () => {
    const user = userEvent.setup();
    render(<AssetCardRepairs repairs={[]} repairCodes={[]} />);

    const toggle = screen.getByRole('button', { name: 'Show repairs' });
    await user.click(toggle);
    await user.click(screen.getByRole('button', { name: 'Hide repairs' }));

    expect(
      screen.getByRole('button', { name: 'Show repairs' }),
    ).toBeInTheDocument();
    expect(
      screen.queryByText('This asset has no repairs'),
    ).not.toBeInTheDocument();
  });

  it('renders repairs whose code resolves to a known description', async () => {
    const user = userEvent.setup();
    render(
      <AssetCardRepairs
        repairs={[buildRepair({ recreation_remed_repair_code: 'R1' })]}
        repairCodes={repairCodes}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Show repairs' }));

    expect(screen.getByText('Paint touch-up')).toBeInTheDocument();
  });

  it('excludes repairs whose code does not resolve to a known description', async () => {
    const user = userEvent.setup();
    render(
      <AssetCardRepairs
        repairs={[buildRepair({ recreation_remed_repair_code: 'UNKNOWN' })]}
        repairCodes={repairCodes}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Show repairs' }));

    expect(screen.getByText('This asset has no repairs')).toBeInTheDocument();
  });

  it('renders repair fields: estimated cost, actual cost, completed date', async () => {
    const user = userEvent.setup();
    render(
      <AssetCardRepairs
        repairs={[
          buildRepair({
            estimated_repair_cost: 200,
            actual_repair_cost: 250,
            repair_completed_date: '2024-03-10',
          }),
        ]}
        repairCodes={repairCodes}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Show repairs' }));

    expect(screen.getByText('$200')).toBeInTheDocument();
    expect(screen.getByText('$250')).toBeInTheDocument();
    expect(screen.getByText(/Mar 10, 2024/)).toBeInTheDocument();
  });

  it('renders the Add repair button', async () => {
    const user = userEvent.setup();
    render(<AssetCardRepairs repairs={[]} repairCodes={[]} />);

    await user.click(screen.getByRole('button', { name: 'Show repairs' }));

    expect(
      screen.getByRole('button', { name: /Add repair/ }),
    ).toBeInTheDocument();
  });
});
