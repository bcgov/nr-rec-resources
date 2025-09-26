import { render, screen, fireEvent } from '@testing-library/react';
import HamburgerButton from '@/components/layout/HamburgerButton';

vi.mock('@fortawesome/react-fontawesome', () => ({
  FontAwesomeIcon: ({ icon }: any) => (
    <span data-testid="font-awesome-icon" data-icon={icon.iconName} />
  ),
}));

describe('HamburgerButton', () => {
  const defaultProps = {
    isOpen: false,
    onToggle: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly when closed', () => {
    render(<HamburgerButton {...defaultProps} />);

    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass('hamburger-toggle');
    expect(button).toHaveAttribute('aria-label', 'Open menu');
    expect(button).toHaveAttribute('aria-expanded', 'false');

    const icon = screen.getByTestId('font-awesome-icon');
    expect(icon).toHaveAttribute('data-icon', 'bars');
  });

  it('renders correctly when open', () => {
    render(<HamburgerButton {...defaultProps} isOpen={true} />);

    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-label', 'Close menu');
    expect(button).toHaveAttribute('aria-expanded', 'true');

    const icon = screen.getByTestId('font-awesome-icon');
    expect(icon).toHaveAttribute('data-icon', 'xmark');
  });

  it('calls onToggle when clicked', () => {
    const mockOnToggle = vi.fn();
    render(<HamburgerButton {...defaultProps} onToggle={mockOnToggle} />);

    const button = screen.getByRole('button');
    fireEvent.click(button);

    expect(mockOnToggle).toHaveBeenCalledTimes(1);
  });

  it('toggles icon between bars and xmark', () => {
    const { rerender } = render(<HamburgerButton {...defaultProps} />);

    let icon = screen.getByTestId('font-awesome-icon');
    expect(icon).toHaveAttribute('data-icon', 'bars');

    rerender(<HamburgerButton {...defaultProps} isOpen={true} />);
    icon = screen.getByTestId('font-awesome-icon');
    expect(icon).toHaveAttribute('data-icon', 'xmark');

    rerender(<HamburgerButton {...defaultProps} isOpen={false} />);
    icon = screen.getByTestId('font-awesome-icon');
    expect(icon).toHaveAttribute('data-icon', 'bars');
  });

  it('has correct accessibility attributes', () => {
    render(<HamburgerButton {...defaultProps} />);

    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-label');
    expect(button).toHaveAttribute('aria-expanded');
  });
});
