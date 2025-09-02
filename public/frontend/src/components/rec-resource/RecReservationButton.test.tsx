import { render, screen, fireEvent } from '@testing-library/react';
import RecReservationButton, { ReservationType } from './RecReservationButton';

describe('RecReservationButton', () => {
  const originalOpen = window.open;

  beforeEach(() => {
    // mock window.open
    window.open = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    window.open = originalOpen;
  });

  it("renders with type LINK and displays 'Book now'", () => {
    render(
      <RecReservationButton
        type={ReservationType.LINK}
        text="https://example.com"
      />,
    );

    const button = screen.getByRole('button', { name: /Book now/i });
    expect(button).toBeInTheDocument();
    expect(screen.getByAltText('download icon')).toBeInTheDocument();
  });

  it('calls window.open with the correct link when type is LINK', () => {
    render(
      <RecReservationButton
        type={ReservationType.LINK}
        text="https://example.com"
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: /Book now/i }));
    expect(window.open).toHaveBeenCalledWith('https://example.com');
  });

  it('renders with type EMAIL and displays the email text', () => {
    render(
      <RecReservationButton
        type={ReservationType.EMAIL}
        text="test@example.com"
      />,
    );

    const button = screen.getByRole('button', { name: /test@example.com/i });
    expect(button).toBeInTheDocument();
  });

  it('calls window.open with mailto link when type is EMAIL', () => {
    render(
      <RecReservationButton
        type={ReservationType.EMAIL}
        text="test@example.com"
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: /test@example.com/i }));
    expect(window.open).toHaveBeenCalledWith('mailto:test@example.com');
  });

  it('renders with type PHONE and displays the phone number', () => {
    render(
      <RecReservationButton type={ReservationType.PHONE} text="123456789" />,
    );

    const button = screen.getByRole('button', { name: /123456789/i });
    expect(button).toBeInTheDocument();
  });

  it('calls window.open with tel link when type is PHONE', () => {
    render(
      <RecReservationButton type={ReservationType.PHONE} text="123456789" />,
    );

    fireEvent.click(screen.getByRole('button', { name: /123456789/i }));
    expect(window.open).toHaveBeenCalledWith('tel:123456789');
  });

  it('always renders the download icon', () => {
    render(
      <RecReservationButton
        type={ReservationType.LINK}
        text="https://example.com"
      />,
    );

    const img = screen.getByAltText('download icon') as HTMLImageElement;
    expect(img).toBeInTheDocument();
    expect(img.width).toBe(16);
    expect(img.height).toBe(16);
  });
});
