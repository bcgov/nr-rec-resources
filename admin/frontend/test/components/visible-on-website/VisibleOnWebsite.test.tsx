import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { VisibleOnWebsite } from '@/components/visible-on-website/VisibleOnWebsite';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';

// Mock FontAwesomeIcon to inspect props
vi.mock('@fortawesome/react-fontawesome', () => ({
  FontAwesomeIcon: ({ icon, className }: any) => (
    <div data-testid="icon" data-icon={icon.iconName} className={className} />
  ),
}));

describe('VisibleOnWebsite', () => {
  it('renders visible state correctly', () => {
    render(<VisibleOnWebsite visible={true} />);

    // Text
    expect(screen.getByText('Visible')).toBeInTheDocument();

    // Icon
    const icon = screen.getByTestId('icon');
    expect(icon).toHaveAttribute('data-icon', faEye.iconName);
  });

  it('renders not visible state correctly', () => {
    render(<VisibleOnWebsite visible={false} />);

    // Text
    expect(screen.getByText('Not visible')).toBeInTheDocument();

    // Icon
    const icon = screen.getByTestId('icon');
    expect(icon).toHaveAttribute('data-icon', faEyeSlash.iconName);
  });
});
