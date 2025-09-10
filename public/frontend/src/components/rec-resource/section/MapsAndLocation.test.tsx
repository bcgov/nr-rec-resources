import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import MapsAndLocation from './MapsAndLocation';
import { RecreationResourceMap } from '@/components/rec-resource/RecreationResourceMap';
import { RecreationResourceDocsList } from '@/components/rec-resource/RecreationResourceDocsList';
import parse from 'html-react-parser';

// Mocks
vi.mock('@/components/rec-resource/RecreationResourceMap', () => ({
  RecreationResourceMap: vi.fn(() => <div data-testid="vector-map" />),
}));

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
    driving_directions: 'Drive straight and turn left',
  } as any;

  const mockRecResourceWithDocs = {
    ...mockRecResource,
    recreation_resource_docs: [{ id: 'doc1' }],
  };

  const mockAccessTypes = ['Drive-up', 'Walk-in'];

  it('renders section with proper id and heading', () => {
    render(
      <MapsAndLocation
        recResource={mockRecResource}
        accessTypes={mockAccessTypes}
      />,
    );
    expect(
      screen.getByRole('heading', { name: /maps and location/i }),
    ).toBeInTheDocument();
    expect(document.getElementById('maps-and-location')).toBeInTheDocument();
  });

  it('renders RecreationResourceMap with correct props', () => {
    render(<MapsAndLocation recResource={mockRecResource} />);
    expect(RecreationResourceMap).toHaveBeenCalledWith(
      expect.objectContaining({
        recResource: mockRecResource,
        mapComponentCssStyles: {
          position: 'relative',
          height: '40vh',
          minHeight: '500px',
        },
      }),
      undefined,
    );
    expect(screen.getByTestId('vector-map')).toBeInTheDocument();
  });

  it('renders access types list when provided', () => {
    render(
      <MapsAndLocation
        recResource={mockRecResource}
        accessTypes={mockAccessTypes}
      />,
    );
    expect(
      screen.getByRole('heading', { name: /access types/i }),
    ).toBeInTheDocument();
    mockAccessTypes.forEach((type) => {
      expect(screen.getByText(type)).toBeInTheDocument();
    });
  });

  it('renders singular "Access Type" heading when only one access type provided', () => {
    render(
      <MapsAndLocation
        recResource={mockRecResource}
        accessTypes={['Drive-up']}
      />,
    );
    expect(
      screen.getByRole('heading', { name: /^access type$/i }),
    ).toBeInTheDocument();
  });

  it('does not render access types section when accessTypes prop is missing or empty', () => {
    render(<MapsAndLocation recResource={mockRecResource} />);
    expect(screen.queryByRole('heading', { name: /access types/i })).toBeNull();

    render(<MapsAndLocation recResource={mockRecResource} accessTypes={[]} />);
    expect(screen.queryByRole('heading', { name: /access types/i })).toBeNull();
  });

  it('renders "Getting there" section when driving_directions is provided', () => {
    render(<MapsAndLocation recResource={mockRecResource} />);
    expect(
      screen.getByRole('heading', { name: /getting there/i }),
    ).toBeInTheDocument();
    // Verify that the driving directions text is parsed and rendered
    expect(
      screen.getByText(parse(mockRecResource.driving_directions).toString()),
    ).toBeInTheDocument();
  });

  it('does not render "Getting there" section when driving_directions is not provided', () => {
    const recResourceNoDirections = {
      ...mockRecResource,
      driving_directions: undefined,
    };
    render(<MapsAndLocation recResource={recResourceNoDirections} />);
    expect(
      screen.queryByRole('heading', { name: /getting there/i }),
    ).toBeNull();
  });

  describe('RecreationResourceDocsList', () => {
    it('renders docs list when recResource has recreation_resource_docs', () => {
      render(<MapsAndLocation recResource={mockRecResourceWithDocs} />);
      expect(screen.getByTestId('docs-list')).toBeInTheDocument();
      expect(RecreationResourceDocsList).toHaveBeenCalledWith(
        { recResource: mockRecResourceWithDocs },
        undefined,
      );
    });

    it('does not render docs list when recResource is undefined or missing docs', () => {
      render(<MapsAndLocation recResource={mockRecResource} />);
      expect(screen.queryByTestId('docs-list')).toBeNull();

      render(<MapsAndLocation />);
      expect(screen.queryByTestId('docs-list')).toBeNull();
    });
  });
});
