import './MapControls.scss';
import React from 'react';
import OlMap from 'ol/Map';
import { Coordinate } from 'ol/coordinate';
import { MapControls } from './MapControls';
import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

describe('MapControls', () => {
  const mockView = {
    getZoom: vi.fn(),
    animate: vi.fn(),
    fit: vi.fn(),
    getProjection: vi.fn(() => ({
      getExtent: vi.fn(() => [0, 0, 100, 100]),
    })),
  };

  const mockMap = {
    getView: vi.fn(() => mockView),
  };

  const defaultProps = {
    map: mockMap as unknown as OlMap,
    extent: [0, 0, 50, 50] as Coordinate,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders zoom and center controls', () => {
    render(<MapControls {...defaultProps} />);

    expect(
      screen.getByLabelText('Center map to full extent'),
    ).toBeInTheDocument();
    expect(screen.getByLabelText('Zoom in')).toBeInTheDocument();
    expect(screen.getByLabelText('Zoom out')).toBeInTheDocument();
  });

  it('handles zoom in click', () => {
    mockView.getZoom.mockReturnValue(2);
    render(<MapControls {...defaultProps} />);

    fireEvent.click(screen.getByLabelText('Zoom in'));

    expect(mockView.animate).toHaveBeenCalledWith({
      zoom: 3,
      duration: 250,
    });
  });

  it('handles zoom out click', () => {
    mockView.getZoom.mockReturnValue(2);
    render(<MapControls {...defaultProps} />);

    fireEvent.click(screen.getByLabelText('Zoom out'));

    expect(mockView.animate).toHaveBeenCalledWith({
      zoom: 1,
      duration: 250,
    });
  });

  it('handles center click with provided extent', () => {
    render(<MapControls {...defaultProps} />);

    fireEvent.click(screen.getByLabelText('Center map to full extent'));

    expect(mockView.fit).toHaveBeenCalledWith([0, 0, 50, 50], {
      duration: 250,
    });
  });

  it('handles center click with default projection extent', () => {
    render(<MapControls map={mockMap as unknown as OlMap} />);

    fireEvent.click(screen.getByLabelText('Center map to full extent'));

    expect(mockView.fit).toHaveBeenCalledWith([0, 0, 100, 100], {
      duration: 250,
    });
  });

  it('handles null zoom value', () => {
    mockView.getZoom.mockReturnValue(null);
    render(<MapControls {...defaultProps} />);

    fireEvent.click(screen.getByLabelText('Zoom in'));

    expect(mockView.animate).toHaveBeenCalledWith({
      zoom: 1,
      duration: 250,
    });
  });
});
