import { RecResourceFeatureSection } from '@/pages/rec-resource-page/components/RecResourceFeatureSection/RecResourceFeatureSection';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

describe('RecResourceFeatureSection', () => {
  it('renders section title', () => {
    render(<RecResourceFeatureSection recreationFeatures={[]} />);

    expect(screen.getByText('Features')).toBeInTheDocument();
  });

  it('renders empty state when no features', () => {
    render(<RecResourceFeatureSection recreationFeatures={[]} />);

    expect(screen.getByText('No features assigned.')).toBeInTheDocument();
  });

  it('renders empty state when features is null', () => {
    render(<RecResourceFeatureSection recreationFeatures={null as any} />);

    expect(screen.getByText('No features assigned.')).toBeInTheDocument();
  });

  it('renders features list with codes and descriptions', () => {
    const features = [
      {
        recreation_feature_code: 'BOAT',
        description: 'Boat Launch',
      },
      {
        recreation_feature_code: 'CAMP',
        description: 'Camping',
      },
    ];

    render(<RecResourceFeatureSection recreationFeatures={features} />);

    expect(screen.getByText(/BOAT - Boat Launch/)).toBeInTheDocument();
    expect(screen.getByText(/CAMP - Camping/)).toBeInTheDocument();
  });

  it('sorts features alphabetically by feature code', () => {
    const features = [
      {
        recreation_feature_code: 'TRAIL',
        description: 'Trail',
      },
      {
        recreation_feature_code: 'BOAT',
        description: 'Boat Launch',
      },
      {
        recreation_feature_code: 'CAMP',
        description: 'Camping',
      },
    ];

    const { container } = render(
      <RecResourceFeatureSection recreationFeatures={features} />,
    );

    const listItems = container.querySelectorAll('li');
    expect(listItems[0]).toHaveTextContent('BOAT - Boat Launch');
    expect(listItems[1]).toHaveTextContent('CAMP - Camping');
    expect(listItems[2]).toHaveTextContent('TRAIL - Trail');
  });

  it('handles features with duplicate codes', () => {
    const features = [
      {
        recreation_feature_code: 'BOAT',
        description: 'Boat Launch',
      },
      {
        recreation_feature_code: 'BOAT',
        description: 'Boat Launch',
      },
    ];

    render(<RecResourceFeatureSection recreationFeatures={features} />);

    const boatElements = screen.getAllByText(/BOAT - Boat Launch/);
    expect(boatElements.length).toBe(2);
  });

  it('renders undefined features as empty state', () => {
    render(<RecResourceFeatureSection recreationFeatures={undefined as any} />);

    expect(screen.getByText('No features assigned.')).toBeInTheDocument();
  });
});
