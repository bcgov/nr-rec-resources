import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import RecResourceCard from './RecResourceCard';
import '@testing-library/jest-dom';
import { RecreationResourceDto } from '@/service/recreation-resource';

// Mock the components used in RecResourceCard
vi.mock('@/components/rec-resource/card/Activities', () => ({
  default: () => <div data-testid="activities-component" />,
}));

vi.mock('@/components/rec-resource/card/CardCarousel', () => ({
  default: () => <div data-testid="card-carousel-component" />,
}));

vi.mock('@/components/rec-resource/Status', () => ({
  default: () => <div data-testid="status-component" />,
}));

vi.mock('@/components/rec-resource/card/helpers', () => ({
  getImageList: vi.fn().mockReturnValue([]),
}));

describe('RecResourceCard', () => {
  const mockRecreationResource = {
    rec_resource_id: '123',
    name: 'Test Resource',
    recreation_activity: [{ id: '1', name: 'Hiking' }],
    closest_community: 'Test Community',
    recreation_status: {
      status_code: 'OPEN',
      description: 'Open for public',
    },
    rec_resource_type: 'Park',
  } as unknown as RecreationResourceDto;

  it('renders the card with all components', () => {
    render(<RecResourceCard recreationResource={mockRecreationResource} />);

    // Check if the name is rendered and transformed to lowercase
    expect(screen.getByText('test resource')).toBeInTheDocument();

    // Check if the community name is rendered and transformed to lowercase
    expect(screen.getByText('test community')).toBeInTheDocument();

    // Check if the resource type is rendered
    expect(screen.getByText('Park')).toBeInTheDocument();

    // Check if the required components are rendered
    expect(screen.getByTestId('card-carousel-component')).toBeInTheDocument();
    expect(screen.getByTestId('activities-component')).toBeInTheDocument();
    expect(screen.getByTestId('status-component')).toBeInTheDocument();
  });

  it('renders without activities when none are provided', () => {
    const noActivitiesResource = {
      ...mockRecreationResource,
      recreation_activity: [],
    } as unknown as RecreationResourceDto;

    render(<RecResourceCard recreationResource={noActivitiesResource} />);

    // Activities component should not be rendered
    expect(
      screen.queryByTestId('activities-component'),
    ).not.toBeInTheDocument();
  });

  it('renders without resource type when none is provided', () => {
    const noTypeResource = {
      ...mockRecreationResource,
      rec_resource_type: null,
    } as unknown as RecreationResourceDto;

    render(<RecResourceCard recreationResource={noTypeResource} />);

    // Resource type should not be rendered
    expect(screen.queryByText('Park')).not.toBeInTheDocument();
  });
});
