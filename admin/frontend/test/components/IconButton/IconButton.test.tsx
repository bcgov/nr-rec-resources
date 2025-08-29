import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { IconButton } from '@/components/IconButton/IconButton';

describe('IconButton', () => {
  it('should render with an icon', () => {
    const TestIcon = () => <span data-testid="test-icon">🔍</span>;

    render(<IconButton icon={<TestIcon />} />);

    expect(screen.getByTestId('test-icon')).toBeInTheDocument();
  });

  it('should pass through button props', () => {
    const TestIcon = () => <span data-testid="test-icon">🔍</span>;

    render(
      <IconButton icon={<TestIcon />} data-testid="icon-button" disabled />,
    );

    const button = screen.getByTestId('icon-button');
    expect(button).toBeInTheDocument();
    expect(button).toBeDisabled();
  });

  it('should apply custom className', () => {
    const TestIcon = () => <span data-testid="test-icon">🔍</span>;

    render(
      <IconButton
        icon={<TestIcon />}
        className="custom-class"
        data-testid="icon-button"
      />,
    );

    const button = screen.getByTestId('icon-button');
    expect(button).toHaveClass('custom-class');
  });

  it('should handle click events', () => {
    const handleClick = vi.fn();
    const TestIcon = () => <span data-testid="test-icon">🔍</span>;

    render(
      <IconButton
        icon={<TestIcon />}
        onClick={handleClick}
        data-testid="icon-button"
      />,
    );

    const button = screen.getByTestId('icon-button');
    button.click();

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should render icon with correct wrapper', () => {
    const TestIcon = () => <span data-testid="test-icon">🔍</span>;

    render(<IconButton icon={<TestIcon />} />);

    const icon = screen.getByTestId('test-icon');
    const wrapper = icon.parentElement;

    expect(wrapper).toHaveClass('w-100');
  });
});
