import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { HasReservation } from '@/pages/rec-resource-page/components/RecResourceReservationSection/components/HasReservation';

describe('HasReservation', () => {
  it('renders radio buttons with the current selection', () => {
    render(<HasReservation value={false} />);

    const noRadio = screen.getByRole('radio', {
      name: 'Reservable no',
    });
    const yesRadio = screen.getByRole('radio', {
      name: 'Reservable yes',
    });

    expect(noRadio).toBeInTheDocument();
    expect(yesRadio).toBeInTheDocument();
    expect(noRadio).toBeChecked();
    expect(yesRadio).not.toBeChecked();
  });

  it('calls onChange with new value when yes is selected', () => {
    const onChange = vi.fn();

    render(<HasReservation value={false} onChange={onChange} />);

    const yesRadio = screen.getByRole('radio', { name: 'Reservable yes' });
    fireEvent.click(yesRadio);

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it('does not throw when onChange is undefined', () => {
    render(<HasReservation value onChange={undefined} />);

    const noRadio = screen.getByRole('radio', { name: 'Reservable no' });

    expect(() => fireEvent.click(noRadio)).not.toThrow();
  });
});
