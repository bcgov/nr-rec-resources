import { render, screen, fireEvent } from '@testing-library/react';
import MapDisclaimerModal from '@/components/search-map/MapDisclaimerModal';
import Cookies from 'js-cookie';
import { vi } from 'vitest';

describe('MapDisclaimerModal', () => {
  const setup = (isOpen = true, setIsOpen = vi.fn()) => {
    render(<MapDisclaimerModal isOpen={isOpen} setIsOpen={setIsOpen} />);
    return { setIsOpen };
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render modal when isOpen is true', () => {
    setup(true);
    expect(
      screen.getByText(/Welcome to the Recreation Sites and Trails Map/i),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /OK/i })).toBeInTheDocument();
  });

  it('should not render modal when isOpen is false', () => {
    const { container } = render(
      <MapDisclaimerModal isOpen={false} setIsOpen={vi.fn()} />,
    );
    expect(container.querySelector('.modal.show')).toBeNull();
  });

  it('should call setIsOpen(false) when OK button is clicked', () => {
    const { setIsOpen } = setup(true);
    const okButton = screen.getByRole('button', { name: /OK/i });
    fireEvent.click(okButton);
    expect(setIsOpen).toHaveBeenCalledWith(false);
  });

  it('should set cookie when checkbox is checked', () => {
    const setCookieSpy = vi.spyOn(Cookies, 'set');
    setup(true);
    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox);
    expect(setCookieSpy).toHaveBeenCalledWith(
      'hidemap-disclaimer-dialog',
      'true',
      { expires: 180 },
    );
  });

  it('should remove cookie when checkbox is unchecked', () => {
    const removeCookieSpy = vi.spyOn(Cookies, 'remove');
    setup(true);
    const checkbox = screen.getByRole('checkbox');

    // Check then uncheck to simulate user toggling off
    fireEvent.click(checkbox); // check
    fireEvent.click(checkbox); // uncheck

    expect(removeCookieSpy).toHaveBeenCalledWith('hidemap-disclaimer-dialog');
  });

  it('should contain disclaimer text and link', () => {
    setup(true);
    expect(screen.getByText(/Disclaimer/i)).toBeInTheDocument();
    expect(
      screen.getByText(/Your safety is your responsibility/i),
    ).toBeInTheDocument();

    const link = screen.getByRole('link', {
      name: /BC Sites & Trails Alerts/i,
    });
    expect(link).toHaveAttribute('href', expect.stringContaining('gov.bc.ca'));
  });
});
