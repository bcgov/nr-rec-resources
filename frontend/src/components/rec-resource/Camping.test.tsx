import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Camping from './Camping';

describe('Camping Component', () => {
  it('renders correctly with campsite count', () => {
    render(<Camping campsite_count={10} />);

    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(
      'Camping',
    );
    expect(screen.getByText('Number of Campsites: 10')).toBeInTheDocument();
  });

  it('renders correctly with zero campsites', () => {
    render(<Camping campsite_count={0} />);

    expect(screen.getByText('Number of Campsites: 0')).toBeInTheDocument();
  });

  it('handles large campsite count', () => {
    render(<Camping campsite_count={100} />);

    expect(screen.getByText('Number of Campsites: 100')).toBeInTheDocument();
  });
});
