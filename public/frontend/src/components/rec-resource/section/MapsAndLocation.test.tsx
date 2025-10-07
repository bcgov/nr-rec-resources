import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import MapsAndLocation from './MapsAndLocation';
import { RecreationResourceMap } from '@/components/rec-resource/RecreationResourceMap';
import { RecreationResourceDocsList } from '@/components/rec-resource/RecreationResourceDocsList';
import parse from 'html-react-parser';

vi.mock('@shared/components/recreation-resource-map/helpers', () => ({
  getMapFeaturesFromRecResource: vi.fn(() => []),
  getLayerStyleForRecResource: vi.fn(() => ({})),
}));

vi.mock('@/components/rec-resource/RecreationResourceMap', () => ({
  RecreationResourceMap: vi.fn(() => null),
}));

vi.mock('@/components/rec-resource/RecreationResourceDocsList', () => ({
  RecreationResourceDocsList: vi.fn(() => null),
}));

describe('MapsAndLocation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
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
    recreation_resource_docs: [
      {
        id: 'doc1',
        title: 'Test Document',
        extension: 'pdf',
        url: 'http://example.com/doc.pdf',
      },
    ],
  };

  const mockAccessTypes = ['Drive-up', 'Walk-in'];

  it('renders section with proper id and heading', () => {
    render(
      <BrowserRouter>
        <MapsAndLocation
          recResource={mockRecResource}
          accessTypes={mockAccessTypes}
        />
      </BrowserRouter>,
    );
    expect(
      screen.getByRole('heading', { name: /maps and location/i }),
    ).toBeInTheDocument();
    expect(document.getElementById('maps-and-location')).toBeInTheDocument();
  });

  it('renders RecreationResourceMap with correct props', () => {
    render(
      <BrowserRouter>
        <MapsAndLocation recResource={mockRecResource} />
      </BrowserRouter>,
    );
    expect(RecreationResourceMap).toHaveBeenCalledWith(
      expect.objectContaining({
        recResource: mockRecResource,
      }),
      undefined,
    );
  });

  it('renders access types list when provided', () => {
    render(
      <BrowserRouter>
        <MapsAndLocation
          recResource={mockRecResource}
          accessTypes={mockAccessTypes}
        />
      </BrowserRouter>,
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
      <BrowserRouter>
        <MapsAndLocation
          recResource={mockRecResource}
          accessTypes={['Drive-up']}
        />
      </BrowserRouter>,
    );
    expect(
      screen.getByRole('heading', { name: /^access type$/i }),
    ).toBeInTheDocument();
  });

  it('does not render access types section when accessTypes prop is missing or empty', () => {
    render(
      <BrowserRouter>
        <MapsAndLocation recResource={mockRecResource} />
      </BrowserRouter>,
    );
    expect(screen.queryByRole('heading', { name: /access types/i })).toBeNull();

    render(
      <BrowserRouter>
        <MapsAndLocation recResource={mockRecResource} accessTypes={[]} />
      </BrowserRouter>,
    );
    expect(screen.queryByRole('heading', { name: /access types/i })).toBeNull();
  });

  it('renders "Getting there" section when driving_directions is provided', () => {
    render(
      <BrowserRouter>
        <MapsAndLocation recResource={mockRecResource} />
      </BrowserRouter>,
    );
    expect(
      screen.getByRole('heading', { name: /getting there/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(parse(mockRecResource.driving_directions).toString()),
    ).toBeInTheDocument();
  });

  it('does not render "Getting there" section when driving_directions is not provided', () => {
    const recResourceNoDirections = {
      ...mockRecResource,
      driving_directions: undefined,
    };
    render(
      <BrowserRouter>
        <MapsAndLocation recResource={recResourceNoDirections} />
      </BrowserRouter>,
    );
    expect(
      screen.queryByRole('heading', { name: /getting there/i }),
    ).toBeNull();
  });

  describe('RecreationResourceDocsList', () => {
    it('renders docs list when recResource has recreation_resource_docs', () => {
      render(
        <BrowserRouter>
          <MapsAndLocation recResource={mockRecResourceWithDocs} />
        </BrowserRouter>,
      );
      expect(RecreationResourceDocsList).toHaveBeenCalledWith(
        { recResource: mockRecResourceWithDocs },
        undefined,
      );
    });

    it('does not render docs list when recResource is undefined or missing docs', () => {
      render(
        <BrowserRouter>
          <MapsAndLocation recResource={mockRecResource} />
        </BrowserRouter>,
      );
      expect(RecreationResourceDocsList).not.toHaveBeenCalled();

      render(
        <BrowserRouter>
          <MapsAndLocation />
        </BrowserRouter>,
      );
      expect(RecreationResourceDocsList).not.toHaveBeenCalled();
    });
  });
});
