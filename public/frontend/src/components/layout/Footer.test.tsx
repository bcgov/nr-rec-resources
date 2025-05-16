import { render, screen } from '@testing-library/react';
import Footer from '@/components/layout/Footer';
import useMediaQuery from '@/hooks/useMediaQuery';
import { vi } from 'vitest';

vi.mock('@/hooks/useMediaQuery');

describe('the Footer component', () => {
  it('renders the component correctly', () => {
    vi.mocked(useMediaQuery).mockReturnValue(false);
    render(<Footer />);

    const faceBookLink = screen.getByTitle(
      'Facebook BC Recreation Sites and Trails',
    );

    expect(faceBookLink).toBeInTheDocument();
  });
});
