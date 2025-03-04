import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import MapsAndLocation from './MapsAndLocation';
import { RecreationResourceMap } from 'src/components/rec-resource/RecreationResourceMap';

// Mock the RecreationResourceMap component
vi.mock('@/components/rec-resource/RecreationResourceMap', () => ({
  RecreationResourceMap: vi.fn(() => null),
}));

describe('MapsAndLocation', () => {
  const mockRecResource = {
    id: '123',
    name: 'Test Resource',
    latitude: 47.6062,
    longitude: -122.3321,
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
        mapComponentCssStyles: { position: 'relative', height: '40vh' },
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
});
