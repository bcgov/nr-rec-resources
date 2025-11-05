import { render, screen, fireEvent } from '@testing-library/react';
import SearchViewControls from '@/components/search-map/SearchViewControls';
import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockNavigate = vi.fn();
const mockSearchParams = {};

vi.mock('@tanstack/react-router', () => ({
  useSearch: () => mockSearchParams,
  useNavigate: () => mockNavigate,
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

    expect(mockNavigate).toHaveBeenCalledWith({
      search: expect.any(Function),
    });
  });

  it('clicking "Show map" button sets view=map in search params', () => {
    render(<SearchViewControls variant="map" />);
    const button = screen.getByRole('button', { name: /show map/i });

    fireEvent.click(button);

    expect(mockNavigate).toHaveBeenCalledWith({
      search: expect.any(Function),
    });
  });
});
