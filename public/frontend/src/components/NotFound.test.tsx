import { vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import NotFound from '@/components/NotFound';

const useNavigateMock = vi.fn(); //keep it at top of file

vi.mock('@tanstack/react-router', async () => {
  const actual = await vi.importActual('@tanstack/react-router');
  return {
    ...actual,
    useNavigate: () => useNavigateMock,
  };
});

describe('NotFound', () => {
  it('renders a heading with the correct text', () => {
    render(<NotFound />);
    const title = screen.getByText('404 - Uh oh ! Page not found.');
    expect(title).toBeInTheDocument();
  });

  it('should navigate to the home page when the Return to home button is clicked', () => {
    render(<NotFound />);
    const backButton = screen.getByRole('button', { name: /Return to home/i });
    backButton.click();
    expect(useNavigateMock).toHaveBeenCalled();
  });

  it('should navigate to the search page when the Find a rec site or trail button is clicked', () => {
    render(<NotFound />);
    const backButton = screen.getByRole('button', {
      name: /Find a rec site or trail/i,
    });
    backButton.click();
    expect(useNavigateMock).toHaveBeenCalled();
  });
});
