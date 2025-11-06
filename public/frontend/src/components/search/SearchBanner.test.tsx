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
    const { container } = await renderWithRouter(<SearchBanner />);

    expect(
      screen.getByPlaceholderText('By name or community'),
    ).toBeInTheDocument();

    const desktopButton = container.querySelector(
      '.submit-btn.d-none.d-sm-block',
    );

    expect(desktopButton).toBeInTheDocument();
  });
});
