import { render, screen, fireEvent } from '@testing-library/react';
import SearchViewControls from '@/components/search-map/SearchViewControls';
import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockSetSearchParams = vi.fn();
const mockSearchParams = {
  set: vi.fn(),
};

vi.mock('react-router-dom', () => ({
  useSearchParams: () => [mockSearchParams, mockSetSearchParams],
}));

describe('SearchViewControls', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders "Show list" button correctly', () => {
    render(<SearchViewControls variant="list" />);
    const button = screen.getByRole('button', { name: /show list/i });
    expect(button).toBeInTheDocument();
  });

  it('renders "Show map" button correctly', () => {
    render(<SearchViewControls variant="map" />);
    const button = screen.getByRole('button', { name: /show map/i });
    expect(button).toBeInTheDocument();
  });

  it('clicking "Show list" button sets view=list in search params', () => {
    render(<SearchViewControls variant="list" />);
    const button = screen.getByRole('button', { name: /show list/i });

    fireEvent.click(button);

    expect(mockSearchParams.set).toHaveBeenCalledWith('view', 'list');
    expect(mockSetSearchParams).toHaveBeenCalledWith(mockSearchParams);
  });

  it('clicking "Show map" button sets view=map in search params', () => {
    render(<SearchViewControls variant="map" />);
    const button = screen.getByRole('button', { name: /show map/i });

    fireEvent.click(button);

    expect(mockSearchParams.set).toHaveBeenCalledWith('view', 'map');
    expect(mockSetSearchParams).toHaveBeenCalledWith(mockSearchParams);
  });
});
