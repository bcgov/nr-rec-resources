import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Badge } from '@/components/badge';

describe('Badge', () => {
  it('renders the label correctly', () => {
    render(<Badge label="Test Label" />);
    expect(screen.getByText('Test Label')).toBeInTheDocument();
  });

  it('has the correct class name', () => {
    render(<Badge label="Test" />);
    const badgeElement = screen.getByText('Test');
    expect(badgeElement).toHaveClass(/badge/);
  });
});
