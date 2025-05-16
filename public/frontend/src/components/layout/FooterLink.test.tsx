import { render, screen } from '@testing-library/react';
import FooterLink from '@/components/layout/FooterLink';
import useMediaQuery from '@/hooks/useMediaQuery';
import { vi } from 'vitest';

vi.mock('@/hooks/useMediaQuery');

describe('the FooterLink component', () => {
  it('renders the component correctly', () => {
    vi.mocked(useMediaQuery).mockReturnValue(false);
    render(<FooterLink title="Test title" url="testUrl" />);

    const testTile = screen.getByText('Test title');

    expect(testTile).toBeInTheDocument();
  });
});
