import { render, screen } from '@testing-library/react';
import FooterLinkColumn from '@/components/layout/FooterLinkColumn';
import useMediaQuery from '@/hooks/useMediaQuery';
import { vi } from 'vitest';

vi.mock('@/hooks/useMediaQuery');

describe('the FooterLinkColumn component', () => {
  it('renders the component correctly', () => {
    vi.mocked(useMediaQuery).mockReturnValue(false);
    render(<FooterLinkColumn title="Test title" links={[]} />);

    const testTile = screen.getByText('Test title');

    expect(testTile).toBeInTheDocument();
  });
});
