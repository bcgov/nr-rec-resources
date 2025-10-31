import { beforeEach, describe, expect, it, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithRouter } from '@/test-utils';
import SearchBanner from './SearchBanner';

vi.mock('@tanstack/react-router', async () => {
  const actual = await vi.importActual('@tanstack/react-router');
  return {
    ...actual,
    useSearch: vi.fn(() => ({})),
    useNavigate: vi.fn(() => vi.fn()),
  };
});

describe('SearchBanner', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly', async () => {
    await renderWithRouter(<SearchBanner />);

    expect(
      screen.getByPlaceholderText('By name or community'),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Search' })).toBeInTheDocument();
  });
});
