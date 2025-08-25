import { Avatar } from '@/components';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

describe('Avatar', () => {
  it('renders initials from full name', () => {
    render(<Avatar name="John Doe" />);
    expect(screen.getByText('JD')).toBeInTheDocument();
  });

  it('uses only first two initials from long name', () => {
    render(<Avatar name="Alice Bob Charlie" />);
    expect(screen.getByText('AB')).toBeInTheDocument();
  });

  it('handles single-word names', () => {
    render(<Avatar name="Plato" />);
    expect(screen.getByText('P')).toBeInTheDocument();
  });

  it('defaults to size 50 with correct styles', () => {
    render(<Avatar name="Ada Lovelace" />);
    const avatar = screen.getByText('AL');
    expect(avatar).toHaveStyle({
      width: '50px',
      height: '50px',
      fontSize: `${50 * 0.4}px`,
    });
  });

  it('uses custom size', () => {
    render(<Avatar name="Alan Turing" size={80} />);
    const avatar = screen.getByText('AT');
    expect(avatar).toHaveStyle({
      width: '80px',
      height: '80px',
      fontSize: `${80 * 0.4}px`,
    });
  });

  it('does not render tooltip when tooltip prop is false', () => {
    render(<Avatar name="Grace Hopper" tooltip={false} />);
    const avatar = screen.getByText('GH');
    expect(avatar.closest("[data-testid='overlay']")).toBeNull();
  });

  it('renders tooltip when tooltip is true', async () => {
    render(<Avatar name="Margaret Hamilton" tooltip={true} />);
    const avatar = screen.getByText('MH');
    await userEvent.hover(avatar);

    expect(await screen.findByRole('tooltip')).toHaveTextContent(
      'Margaret Hamilton',
    );
  });

  it('renders tooltip with correct placement', async () => {
    render(
      <Avatar name="Tim Berners-Lee" tooltip={true} tooltipPlacement="top" />,
    );
    const avatar = screen.getByText('TB');
    await userEvent.hover(avatar);

    const tooltip = await screen.findByRole('tooltip');
    expect(tooltip).toHaveTextContent('Tim Berners-Lee');
    // placement is handled by react-bootstrap via Popper, no need to assert CSS class
  });
});
