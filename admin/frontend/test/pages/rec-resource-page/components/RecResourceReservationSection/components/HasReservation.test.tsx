import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { HasReservation } from '@/pages/rec-resource-page/components/RecResourceReservationSection/components/HasReservation';

/* -------------------------------------------------
   FontAwesome mock (prevents SVG complexity)
-------------------------------------------------- */

vi.mock('@fortawesome/react-fontawesome', () => ({
  FontAwesomeIcon: ({ icon }: any) => (
    <span data-testid="icon">{icon.iconName}</span>
  ),
}));

vi.mock('@fortawesome/free-solid-svg-icons', () => ({
  faCalendarCheck: { iconName: 'calendar-check' },
  faCalendar: { iconName: 'calendar' },
}));

describe('HasReservation', () => {
  it('renders non-edit mode with value=false', () => {
    render(<HasReservation value={false} />);

    expect(screen.getByText('Requires Reservation')).toBeInTheDocument();

    expect(screen.getByTestId('icon')).toHaveTextContent('calendar');

    expect(
      screen.getByText('No - First come first served'),
    ).toBeInTheDocument();

    const pill = screen.getByText('No - First come first served');
    expect(pill.className).toContain('pill__hidden');

    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
  });

  it('renders non-edit mode with value=true', () => {
    render(<HasReservation value />);

    expect(screen.getByTestId('icon')).toHaveTextContent('calendar-check');

    const pill = screen.getByText('Yes - Reservable');
    expect(pill.className).toContain('pill__visible');
  });

  it('renders switch when isEditMode=true', () => {
    render(<HasReservation value={false} isEditMode />);

    const checkbox = screen.getByRole('checkbox', {
      name: 'Toggle requirement for reservation on rec resource',
    });

    expect(checkbox).toBeInTheDocument();
    expect(checkbox).not.toBeChecked();
  });

  it('calls onChange with new value when toggled', () => {
    const onChange = vi.fn();

    render(<HasReservation value={false} isEditMode onChange={onChange} />);

    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox);

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it('does not throw when onChange is undefined', () => {
    render(<HasReservation value isEditMode onChange={undefined} />);

    const checkbox = screen.getByRole('checkbox');

    expect(() => fireEvent.click(checkbox)).not.toThrow();
  });
});
