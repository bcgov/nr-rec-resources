import { vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import NotFound from '@/components/NotFound';

const useNavigateMock = vi.fn(); //keep it at top of file

vi.mock('react-router', () => {
  return {
    ...vi.importActual('react-router'),
    useNavigate: () => useNavigateMock,
  };
});

describe('NotFound', () => {
  it('renders a heading with the correct text', () => {
    const navigate = vi.fn();
    const useNavigateMock = vi.fn(() => navigate);
    vi.doMock('react-router', () => ({
      useNavigate: useNavigateMock,
    }));
    render(<NotFound />);
    const headingElement = screen.getByRole('heading', { name: /404/i });
    expect(headingElement).toBeInTheDocument();
  });

  it('should navigate to the previous page when the back button is clicked', () => {
    render(<NotFound />);
    const backButton = screen.getByRole('button', { name: /back/i });
    backButton.click();
    expect(useNavigateMock).toHaveBeenCalled();
  });
});
