import { CampsiteCard } from '@/pages/rec-resource-page/components/RecResourceAssetsSection/CampsiteCard';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

describe('CampsiteCard', () => {
  it('renders the description', () => {
    render(
      <CampsiteCard
        eventKey="1"
        description="Campsite A"
        structureCount={2}
        totalValue={1500}
      />,
    );

    expect(screen.getByText('Campsite A')).toBeInTheDocument();
  });

  it('renders the structure count and formatted total value', () => {
    render(
      <CampsiteCard
        eventKey="1"
        description="Campsite A"
        structureCount={2}
        totalValue={1500}
      />,
    );

    expect(screen.getByText('2 structures')).toBeInTheDocument();
    expect(screen.getByText('$1,500 total value')).toBeInTheDocument();
  });

  it('renders an Edit button', () => {
    render(
      <CampsiteCard
        eventKey="1"
        description="Campsite A"
        structureCount={2}
        totalValue={1500}
      />,
    );

    expect(screen.getByRole('button', { name: 'Edit' })).toBeInTheDocument();
  });

  it('renders children content', () => {
    render(
      <CampsiteCard
        eventKey="1"
        description="Campsite A"
        structureCount={2}
        totalValue={1500}
      >
        <div>Child campsite content</div>
      </CampsiteCard>,
    );

    expect(screen.getByText('Child campsite content')).toBeInTheDocument();
  });

  it('is collapsed by default', () => {
    render(
      <CampsiteCard
        eventKey="1"
        description="Campsite A"
        structureCount={2}
        totalValue={1500}
      />,
    );

    expect(screen.getByRole('button', { name: /Campsite A/ })).toHaveAttribute(
      'aria-expanded',
      'false',
    );
  });
});
