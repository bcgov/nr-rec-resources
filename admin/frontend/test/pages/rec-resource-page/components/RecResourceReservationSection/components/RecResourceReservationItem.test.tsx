import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { RecResourceReservationItem } from '@/pages/rec-resource-page/components/RecResourceReservationSection/components/RecResourceReservationItem';

describe('RecResourceReservationItem', () => {
  it('renders dash when value is falsy', () => {
    render(<RecResourceReservationItem label="Email" value={'' as any} />);

    expect(screen.getByText('Email')).toBeInTheDocument();
    expect(screen.getByText('-')).toBeInTheDocument();
  });

  it('renders HTML content when isHtml is true', () => {
    const html = '<strong>example.com</strong>';

    render(<RecResourceReservationItem label="Website" value={html} isHtml />);

    const strong = screen.getByText('example.com');
    expect(strong.tagName).toBe('STRONG');
  });

  it('renders ReactNode value when isHtml is false or undefined', () => {
    render(
      <RecResourceReservationItem
        label="Phone"
        value={<span data-testid="phone">123-456</span>}
      />,
    );

    expect(screen.getByTestId('phone')).toHaveTextContent('123-456');
  });

  it('sets accessibility attributes correctly', () => {
    render(
      <RecResourceReservationItem label="Email" value="test@example.com" />,
    );

    const region = screen.getByRole('region');

    expect(region).toHaveAttribute('aria-labelledby', 'overview-email');
  });
});
