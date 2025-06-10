import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import SearchViewControls from '@/components/search/SearchMap/SearchViewControls';
import { describe, it, expect, vi, beforeEach } from 'vitest';

const renderWithRouter = (initialEntries: string[] = ['/']) => {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <Routes>
        <Route path="/" element={<SearchViewControls />} />
      </Routes>
    </MemoryRouter>,
  );
};

describe('SearchViewControls', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('renders both view buttons', () => {
    renderWithRouter();

    expect(screen.getByText('List View')).toBeInTheDocument();
    expect(screen.getByText('Map View')).toBeInTheDocument();
  });

  it('defaults to list view when no search param is set', () => {
    renderWithRouter();

    const listBtn = screen.getByText('List View');
    const mapBtn = screen.getByText('Map View');

    expect(listBtn).toHaveClass('btn-primary');
    expect(mapBtn).toHaveClass('btn-secondary');
  });

  it('applies map view when search param is view=map', () => {
    renderWithRouter(['/?view=map']);

    const listBtn = screen.getByText('List View');
    const mapBtn = screen.getByText('Map View');

    expect(listBtn).toHaveClass('btn-secondary');
    expect(mapBtn).toHaveClass('btn-primary');
  });

  it('clicking Map View updates the search param and active class', () => {
    renderWithRouter();

    const mapBtn = screen.getByText('Map View');
    fireEvent.click(mapBtn);

    expect(mapBtn).toHaveClass('btn-primary');
    expect(screen.getByText('List View')).toHaveClass('btn-secondary');
  });

  it('clicking List View updates the search param and active class', () => {
    renderWithRouter(['/?view=map']);

    const listBtn = screen.getByText('List View');
    fireEvent.click(listBtn);

    expect(listBtn).toHaveClass('btn-primary');
    expect(screen.getByText('Map View')).toHaveClass('btn-secondary');
  });
});
