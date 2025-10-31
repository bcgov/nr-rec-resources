import { beforeEach, describe, expect, it, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithRouter } from '@/test-utils';
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

  it('renders section with proper id and heading', async () => {
    await renderWithRouter(
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

  it('renders RecreationResourceMap with correct props', async () => {
    await renderWithRouter(<MapsAndLocation recResource={mockRecResource} />);
    expect(RecreationResourceMap).toHaveBeenCalledWith(
      expect.objectContaining({
        recResource: mockRecResource,
      }),
      undefined,
    );
  });

  it('renders access types list when provided', async () => {
    await renderWithRouter(
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

  it('renders singular "Access Type" heading when only one access type provided', async () => {
    await renderWithRouter(
      <MapsAndLocation
        recResource={mockRecResource}
        accessTypes={['Drive-up']}
      />,
    );
    expect(
      screen.getByRole('heading', { name: /^access type$/i }),
    ).toBeInTheDocument();
  });

  it('does not render access types section when accessTypes prop is missing or empty', async () => {
    await renderWithRouter(<MapsAndLocation recResource={mockRecResource} />);
    expect(screen.queryByRole('heading', { name: /access types/i })).toBeNull();

    await renderWithRouter(
      <MapsAndLocation recResource={mockRecResource} accessTypes={[]} />,
    );
    expect(screen.queryByRole('heading', { name: /access types/i })).toBeNull();
  });

  it('renders "Getting there" section when driving_directions is provided', async () => {
    await renderWithRouter(<MapsAndLocation recResource={mockRecResource} />);
    expect(
      screen.getByRole('heading', { name: /getting there/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(parse(mockRecResource.driving_directions).toString()),
    ).toBeInTheDocument();
  });

  it('does not render "Getting there" section when driving_directions is not provided', async () => {
    const recResourceNoDirections = {
      ...mockRecResource,
      driving_directions: undefined,
    };
    await renderWithRouter(
      <MapsAndLocation recResource={recResourceNoDirections} />,
    );
    expect(
      screen.queryByRole('heading', { name: /getting there/i }),
    ).toBeNull();
  });

  describe('RecreationResourceDocsList', () => {
    it('renders docs list when recResource has recreation_resource_docs', async () => {
      await renderWithRouter(
        <MapsAndLocation recResource={mockRecResourceWithDocs} />,
      );
      expect(RecreationResourceDocsList).toHaveBeenCalledWith(
        { recResource: mockRecResourceWithDocs },
        undefined,
      );
    });

    it('does not render docs list when recResource is undefined or missing docs', async () => {
      await renderWithRouter(<MapsAndLocation recResource={mockRecResource} />);
      expect(RecreationResourceDocsList).not.toHaveBeenCalled();

      await renderWithRouter(<MapsAndLocation />);
      expect(RecreationResourceDocsList).not.toHaveBeenCalled();
    });
  });
});
