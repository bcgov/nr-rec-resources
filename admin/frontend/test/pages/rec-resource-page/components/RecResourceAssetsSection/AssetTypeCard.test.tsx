import { AssetTypeCard } from '@/pages/rec-resource-page/components/RecResourceAssetsSection/AssetTypeCard';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

describe('AssetTypeCard', () => {
  it('renders the description and count', () => {
    render(
      <AssetTypeCard
        eventKey="1"
        description="Bridge"
        count={5}
        totalValue={1000}
        activeRepairsCount={0}
      />,
    );

    expect(screen.getByText('Bridge')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('renders the formatted total value', () => {
    render(
      <AssetTypeCard
        eventKey="1"
        description="Bridge"
        count={5}
        totalValue={1000}
        activeRepairsCount={0}
      />,
    );

    expect(screen.getByText('$1,000 total value')).toBeInTheDocument();
  });

  it('shows an active repairs badge when there are active repairs', () => {
    render(
      <AssetTypeCard
        eventKey="1"
        description="Bridge"
        count={5}
        totalValue={1000}
        activeRepairsCount={3}
      />,
    );

    expect(screen.getByText('3 repairs')).toBeInTheDocument();
  });

  it('hides the active repairs badge when there are no active repairs', () => {
    render(
      <AssetTypeCard
        eventKey="1"
        description="Bridge"
        count={5}
        totalValue={1000}
        activeRepairsCount={0}
      />,
    );

    expect(screen.queryByText(/repairs$/)).not.toBeInTheDocument();
  });

  it('renders an Edit button', () => {
    render(
      <AssetTypeCard
        eventKey="1"
        description="Bridge"
        count={5}
        totalValue={1000}
        activeRepairsCount={0}
      />,
    );

    expect(screen.getByRole('button', { name: 'Edit' })).toBeInTheDocument();
  });

  it('renders children content', () => {
    render(
      <AssetTypeCard
        eventKey="1"
        description="Bridge"
        count={5}
        totalValue={1000}
        activeRepairsCount={0}
      >
        <div>Child asset card</div>
      </AssetTypeCard>,
    );

    expect(screen.getByText('Child asset card')).toBeInTheDocument();
  });

  it('is collapsed by default', () => {
    render(
      <AssetTypeCard
        eventKey="1"
        description="Bridge"
        count={5}
        totalValue={1000}
        activeRepairsCount={0}
      />,
    );

    expect(screen.getByRole('button', { name: /Bridge/ })).toHaveAttribute(
      'aria-expanded',
      'false',
    );
  });
});
