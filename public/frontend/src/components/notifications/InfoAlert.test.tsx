import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import InfoAlert from './InfoAlert';

describe('InfoAlert', () => {
  it('renders with children text', () => {
    render(<InfoAlert>Test Info Alert</InfoAlert>);
    expect(screen.getByText('Test Info Alert')).toBeInTheDocument();
  });

  it('renders with FontAwesome icon', () => {
    render(<InfoAlert>Test Info Alert</InfoAlert>);
    expect(document.querySelector('.fa-circle-info')).toBeInTheDocument();
  });

  it('has the correct bootstrap alert role and class', () => {
    render(<InfoAlert>Test Info Alert</InfoAlert>);
    const alertElement = screen.getByRole('alert');
    expect(alertElement).toHaveClass('alert-info');
  });
});
