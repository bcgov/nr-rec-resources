import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Camping from './Camping';

describe('Camping Component', () => {
  it('should render the number of campsites when campsite_count is greater than 0', () => {
    render(<Camping id="camping-section" campsite_count={5} />);

    expect(screen.getByText('Number of campsites')).toBeInTheDocument();
    expect(screen.getByText('5 campsites')).toBeInTheDocument();
  });

  it('should not render campsite count when campsite_count is 0', () => {
    render(<Camping id="camping-section" campsite_count={0} />);

    expect(screen.queryByText('Number of campsites')).not.toBeInTheDocument();
    expect(screen.queryByText('0 campsites')).not.toBeInTheDocument();
  });
});
