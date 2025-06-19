import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import InfoBanner from './InfoBanner';

describe('InfoBanner', () => {
  it('renders heading and paragraph text', () => {
    render(<InfoBanner />);

    expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent(
      'Are recreation sites reservable?',
    );

    expect(
      screen.getByText(/Most recreation sites are available/i),
    ).toBeInTheDocument();
  });
});
