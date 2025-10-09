import { render, screen } from '@testing-library/react';
import { ExternalLink } from '@shared/components/links';
import { describe, it, expect, vi } from 'vitest';

describe('ExternalLink', () => {
  it('renders with label and url', () => {
    render(<ExternalLink url="https://example.com" label="Example Link" />);

    const link = screen.getByRole('link', { name: /Example Link/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', 'https://example.com');
  });

  it('calls onClick handler when clicked', () => {
    const onClick = vi.fn();
    render(
      <ExternalLink
        url="https://example.com"
        label="Example Link"
        onClick={onClick}
      />,
    );

    const link = screen.getByRole('link');
    link.click();
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('renders external link icon', () => {
    const { container } = render(
      <ExternalLink url="https://example.com" label="Example Link" />,
    );

    const icon = container.querySelector('svg');
    expect(icon).toBeInTheDocument();
  });

  it('renders without onClick handler', () => {
    render(<ExternalLink url="https://example.com" label="Example Link" />);

    const link = screen.getByRole('link');
    expect(link).toBeInTheDocument();
    expect(() => link.click()).not.toThrow();
  });
});
