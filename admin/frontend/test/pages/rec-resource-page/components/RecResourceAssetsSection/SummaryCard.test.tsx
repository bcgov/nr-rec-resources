import { SummaryCard } from '@/pages/rec-resource-page/components/RecResourceAssetsSection/SummaryCard';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

describe('SummaryCard', () => {
  it('renders the title and children', () => {
    render(
      <SummaryCard title="Total value">
        <div>$1,000</div>
      </SummaryCard>,
    );

    expect(screen.getByText('Total value')).toBeInTheDocument();
    expect(screen.getByText('$1,000')).toBeInTheDocument();
  });

  it('renders the subtitle when provided', () => {
    render(
      <SummaryCard title="Structures" subtitle="3 campsites">
        <div>10</div>
      </SummaryCard>,
    );

    expect(screen.getByText('3 campsites')).toBeInTheDocument();
  });

  it('does not render a subtitle element when omitted', () => {
    render(
      <SummaryCard title="Structures">
        <div>10</div>
      </SummaryCard>,
    );

    expect(screen.queryByText('3 campsites')).not.toBeInTheDocument();
  });
});
