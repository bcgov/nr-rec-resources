import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import MapLayersPanel, {
  LayerToggleConfig,
} from '@/components/search-map/MapLayersPanel';

const makeLayers = (
  overrides: Partial<LayerToggleConfig>[] = [],
): LayerToggleConfig[] =>
  overrides.map((o, i) => ({
    id: `layer-${i}`,
    label: `Layer ${i}`,
    enabled: true,
    onToggle: vi.fn(),
    ...o,
  }));

describe('MapLayersPanel', () => {
  it('renders the Layers toggle button', () => {
    render(<MapLayersPanel layers={[]} />);
    expect(
      screen.getByRole('button', { name: /toggle map layers panel/i }),
    ).toBeDefined();
    expect(screen.getByText('Layers')).toBeDefined();
  });

  it('panel is closed by default (dropdown not rendered)', () => {
    render(
      <MapLayersPanel layers={makeLayers([{ id: 'l1', label: 'My Layer' }])} />,
    );
    expect(screen.queryByRole('menu')).toBeNull();
  });

  it('opens panel on button click', () => {
    render(
      <MapLayersPanel layers={makeLayers([{ id: 'l1', label: 'My Layer' }])} />,
    );
    const btn = screen.getByRole('button', {
      name: /toggle map layers panel/i,
    });
    fireEvent.click(btn);
    expect(screen.getByRole('menu')).toBeDefined();
    expect(screen.getByText('My Layer')).toBeDefined();
  });

  it('closes panel when button is clicked again', () => {
    render(
      <MapLayersPanel layers={makeLayers([{ id: 'l1', label: 'My Layer' }])} />,
    );
    const btn = screen.getByRole('button', {
      name: /toggle map layers panel/i,
    });
    fireEvent.click(btn);
    expect(screen.getByRole('menu')).toBeDefined();
    fireEvent.click(btn);
    expect(screen.queryByRole('menu')).toBeNull();
  });

  it('aria-expanded reflects open state', () => {
    render(<MapLayersPanel layers={[]} />);
    const btn = screen.getByRole('button', {
      name: /toggle map layers panel/i,
    });
    expect(btn).toHaveAttribute('aria-expanded', 'false');
    fireEvent.click(btn);
    expect(btn).toHaveAttribute('aria-expanded', 'true');
  });

  it('renders colour swatch when legendColour provided', () => {
    const layers = makeLayers([
      { id: 'l1', label: 'Fire', legendColour: '#ff0000' },
    ]);
    render(<MapLayersPanel layers={layers} />);
    fireEvent.click(
      screen.getByRole('button', { name: /toggle map layers panel/i }),
    );
    // The swatch span gets a background-color style
    const swatch = document.querySelector('.map-layers-panel__swatch');
    expect(swatch).toBeDefined();
  });

  it('renders hatch swatch when legendHatch is true', () => {
    const layers = makeLayers([
      { id: 'l1', label: 'Hatch', legendHatch: true },
    ]);
    render(<MapLayersPanel layers={layers} />);
    fireEvent.click(
      screen.getByRole('button', { name: /toggle map layers panel/i }),
    );
    // SVG hatch pattern should be present
    expect(document.querySelector('pattern#hatch-legend')).toBeDefined();
  });

  it('renders outline swatch when legendOutlineColour provided', () => {
    const layers = makeLayers([
      { id: 'l1', label: 'Outline', legendOutlineColour: '#0000ff' },
    ]);
    render(<MapLayersPanel layers={layers} />);
    fireEvent.click(
      screen.getByRole('button', { name: /toggle map layers panel/i }),
    );
    const rect = document.querySelector('rect[stroke="#0000ff"]');
    expect(rect).toBeDefined();
  });

  it('renders multi swatch and legend items when legendItems provided', () => {
    const layers = makeLayers([
      {
        id: 'l1',
        label: 'Evacuation',
        legendItems: [
          { colour: '#ff0000', label: 'Order' },
          { colour: '#ffaa00', label: 'Alert' },
        ],
      },
    ]);
    render(<MapLayersPanel layers={layers} />);
    fireEvent.click(
      screen.getByRole('button', { name: /toggle map layers panel/i }),
    );
    expect(screen.getByText('Order')).toBeDefined();
    expect(screen.getByText('Alert')).toBeDefined();
    // multi swatch class
    expect(
      document.querySelector('.map-layers-panel__swatch--multi'),
    ).toBeDefined();
  });

  it('calls onToggle with new value when checkbox is changed', () => {
    const onToggle = vi.fn();
    const layers: LayerToggleConfig[] = [
      { id: 'l1', label: 'Layer 1', enabled: true, onToggle },
    ];
    render(<MapLayersPanel layers={layers} />);
    fireEvent.click(
      screen.getByRole('button', { name: /toggle map layers panel/i }),
    );
    const checkbox = screen.getByRole('switch');
    fireEvent.click(checkbox);
    expect(onToggle).toHaveBeenCalledWith(false);
  });

  it('checkbox reflects enabled state', () => {
    const layers: LayerToggleConfig[] = [
      { id: 'l1', label: 'Layer 1', enabled: false, onToggle: vi.fn() },
    ];
    render(<MapLayersPanel layers={layers} />);
    fireEvent.click(
      screen.getByRole('button', { name: /toggle map layers panel/i }),
    );
    const checkbox = screen.getByRole('switch');
    expect(checkbox).not.toBeChecked();
  });

  it('closes when clicking outside the panel', () => {
    render(
      <div>
        <MapLayersPanel layers={makeLayers([{ id: 'l1', label: 'Layer' }])} />
        <button data-testid="outside">Outside</button>
      </div>,
    );
    fireEvent.click(
      screen.getByRole('button', { name: /toggle map layers panel/i }),
    );
    expect(screen.getByRole('menu')).toBeDefined();

    // Simulate mousedown outside the panel
    fireEvent.mouseDown(screen.getByTestId('outside'));
    expect(screen.queryByRole('menu')).toBeNull();
  });

  it('does not close when clicking inside the panel', () => {
    const onToggle = vi.fn();
    render(
      <MapLayersPanel
        layers={[{ id: 'l1', label: 'Inside Layer', enabled: true, onToggle }]}
      />,
    );
    fireEvent.click(
      screen.getByRole('button', { name: /toggle map layers panel/i }),
    );
    const menu = screen.getByRole('menu');
    fireEvent.mouseDown(menu);
    expect(screen.getByRole('menu')).toBeDefined();
  });
});
