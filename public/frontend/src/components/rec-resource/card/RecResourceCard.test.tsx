import { describe, expect, it, Mock, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import RecResourceCard from './RecResourceCard';
import '@testing-library/jest-dom';
import { getImageList } from '@/components/rec-resource/card/helpers';
import { RecreationResourceSearchModel } from '@/service/custom-models';

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

vi.mock('@/components/RSTSVGLogo/RSTSVGLogo', () => ({
  RSTSVGLogo: () => <div data-testid="rst-svg-logo" />,
}));

vi.mock('@/components/rec-resource/card/helpers', () => ({
  getImageList: vi.fn(),
}));

// Helper function to render component with router
const renderWithRouter = (ui: React.ReactElement) => {
  return render(<BrowserRouter>{ui}</BrowserRouter>);
};

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
  } as unknown as RecreationResourceSearchModel;

  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('renders the card with all components and images', () => {
    (getImageList as Mock).mockReturnValue(['image1.jpg']);

    renderWithRouter(
      <RecResourceCard recreationResource={mockRecreationResource} />,
    );

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

    // SVG logo should not be rendered when images are available
    expect(screen.queryByTestId('rst-svg-logo')).not.toBeInTheDocument();
  });

  it('renders the SVG logo when no images are available', () => {
    (getImageList as Mock).mockReturnValue([]);

    renderWithRouter(
      <RecResourceCard recreationResource={mockRecreationResource} />,
    );

    // SVG logo should be rendered
    expect(screen.getByTestId('rst-svg-logo')).toBeInTheDocument();

    // CardCarousel should not be rendered
    expect(
      screen.queryByTestId('card-carousel-component'),
    ).not.toBeInTheDocument();
  });

  it('renders without activities when none are provided', () => {
    (getImageList as Mock).mockReturnValue(['image1.jpg']);

    const noActivitiesResource = {
      ...mockRecreationResource,
      recreation_activity: [],
    } as unknown as RecreationResourceSearchModel;

    renderWithRouter(
      <RecResourceCard recreationResource={noActivitiesResource} />,
    );

    // Activities component should not be rendered
    expect(
      screen.queryByTestId('activities-component'),
    ).not.toBeInTheDocument();
  });

  it('renders without resource type when none is provided', () => {
    (getImageList as Mock).mockReturnValue(['image1.jpg']);

    const noTypeResource = {
      ...mockRecreationResource,
      rec_resource_type: null,
    } as unknown as RecreationResourceSearchModel;

    renderWithRouter(<RecResourceCard recreationResource={noTypeResource} />);

    // Resource type should not be rendered
    expect(screen.queryByText('Park')).not.toBeInTheDocument();

    // Check that the separator is not rendered
    expect(screen.queryByText('|')).not.toBeInTheDocument();
  });

  it('renders with correct URL in anchor tag', () => {
    (getImageList as Mock).mockReturnValue(['image1.jpg']);

    renderWithRouter(
      <RecResourceCard recreationResource={mockRecreationResource} />,
    );

    // Check if the link has the correct href
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/resource/123');
  });

  it('renders the see all activities link when there are more than MAX_ACTIVITIES_TO_DISPLAY activities', () => {
    (getImageList as Mock).mockReturnValue(['image1.jpg']);

    const resourceWithManyActivities = {
      ...mockRecreationResource,
      recreation_activity: Array.from({ length: 5 }, (_, i) => ({
        id: `${i + 1}`,
        name: `Activity ${i + 1}`,
      })),
    } as unknown as RecreationResourceSearchModel;

    renderWithRouter(
      <RecResourceCard recreationResource={resourceWithManyActivities} />,
    );

    expect(screen.getByRole('link', { name: 'see all' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'see all' })).toHaveAttribute(
      'href',
      '/resource/123#things-to-do',
    );
  });

  it('does not render the see all activities link when there are fewer than or equal to MAX_ACTIVITIES_TO_DISPLAY activities', () => {
    (getImageList as Mock).mockReturnValue(['image1.jpg']);

    const resourceWithFewActivities = {
      ...mockRecreationResource,
      recreation_activity: Array.from({ length: 4 }, (_, i) => ({
        id: `${i + 1}`,
        name: `Activity ${i + 1}`,
      })),
    } as unknown as RecreationResourceSearchModel;

    renderWithRouter(
      <RecResourceCard recreationResource={resourceWithFewActivities} />,
    );

    expect(screen.queryByText('see all')).not.toBeInTheDocument();
  });
});
