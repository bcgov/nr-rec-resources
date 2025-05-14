import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import MapsAndLocation from './MapsAndLocation';
import { RecreationResourceMap } from '@/components/rec-resource/RecreationResourceMap';
import { RecreationResourceDocsList } from '@/components/rec-resource/RecreationResourceDocsList';

// Mock the RecreationResourceMap component
vi.mock('@/components/rec-resource/RecreationResourceMap', () => ({
  RecreationResourceMap: vi.fn(() => null),
}));

// Mock the RecreationResourceDocsList component
vi.mock('@/components/rec-resource/RecreationResourceDocsList', () => ({
  RecreationResourceDocsList: vi.fn(() => <div data-testid="docs-list" />),
}));

describe('MapsAndLocation', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  const mockRecResource = {
    id: '123',
    name: 'Test Resource',
    latitude: 47.6062,
    longitude: -122.3321,
    driving_directions: 'driving directions',
  } as any;

  const mockAccessTypes = ['Drive-up', 'Walk-in'];

  it('renders the component with all props', () => {
    render(
      <MapsAndLocation
        recResource={mockRecResource}
        accessTypes={mockAccessTypes}
      />,
    );

    // Check if main section elements are present
    expect(
      screen.getByRole('heading', { name: /maps and location/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: /access types/i }),
    ).toBeInTheDocument();

    // Check if access types are rendered
    mockAccessTypes.forEach((type) => {
      expect(screen.getByText(type)).toBeInTheDocument();
    });

    // Verify map component is rendered with correct props
    expect(RecreationResourceMap).toHaveBeenCalledWith(
      expect.objectContaining({
        recResource: mockRecResource,
        mapComponentCssStyles: {
          position: 'relative',
          height: '40vh',
          marginBottom: '4rem',
        },
      }),
      undefined,
    );
  });

  it('renders without access types', () => {
    render(<MapsAndLocation recResource={mockRecResource} />);

    expect(
      screen.getByRole('heading', { name: /maps and location/i }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('heading', { name: /access types?/i }),
    ).not.toBeInTheDocument();
  });

  it('renders singular "Access Type" when only one type provided', () => {
    render(
      <MapsAndLocation
        recResource={mockRecResource}
        accessTypes={['Drive-up']}
      />,
    );

    expect(
      screen.getByRole('heading', { name: /access type$/i }),
    ).toBeInTheDocument();
  });

  it('forwards ref correctly', () => {
    const ref = { current: null };
    render(
      <MapsAndLocation
        ref={ref}
        recResource={mockRecResource}
        accessTypes={mockAccessTypes}
      />,
    );

    expect(ref.current).toBeInstanceOf(HTMLElement);
  });

  describe('RecreationResourceDocsList visibility', () => {
    it('renders and configures docs list when recResource exists', () => {
      render(<MapsAndLocation recResource={mockRecResource} />);

      const docsList = screen.getByTestId('docs-list');
      expect(docsList).toBeInTheDocument();
      expect(RecreationResourceDocsList).toHaveBeenCalledWith(
        { recResource: mockRecResource },
        undefined,
      );
    });

    it('does not render docs list without recResource', () => {
      render(<MapsAndLocation />);

      expect(screen.queryByTestId('docs-list')).toBeNull();
      expect(RecreationResourceDocsList).not.toHaveBeenCalled();
    });
  });
});
