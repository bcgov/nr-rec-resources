import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MapControls } from './MapControls';
import { Coordinate } from 'ol/coordinate';

// Mock dependencies
vi.mock('@terrestris/react-geo', () => ({
  ZoomButton: ({ children, className }: any) => (
    <button className={className}>{children}</button>
  ),
  ZoomToExtentButton: ({ children }: any) => <button>{children}</button>,
}));

vi.mock('@fortawesome/react-fontawesome', () => ({
  FontAwesomeIcon: ({ icon }: any) => <span>{icon.iconName}</span>,
}));

describe('MapControls', () => {
  const defaultProps = {
    center: [0, 0] as Coordinate,
    extent: [0, 0, 1, 1] as Coordinate,
    zoom: 1,
  };

  it('renders zoom controls and extent button', () => {
    render(<MapControls {...defaultProps} />);

    expect(
      screen.getByRole('button', { name: /location-crosshairs/i }),
    ).toBeDefined();
    expect(screen.getByRole('button', { name: /plus/i })).toBeDefined();
    expect(screen.getByRole('button', { name: /minus/i })).toBeDefined();
  });

  it('renders with optional props undefined', () => {
    render(<MapControls />);

    expect(
      screen.getByRole('button', { name: /location-crosshairs/i }),
    ).toBeDefined();
    expect(screen.getByRole('button', { name: /plus/i })).toBeDefined();
    expect(screen.getByRole('button', { name: /minus/i })).toBeDefined();
  });
});
