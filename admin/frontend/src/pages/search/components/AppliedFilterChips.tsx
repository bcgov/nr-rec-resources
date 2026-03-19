import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleXmark } from '@fortawesome/free-solid-svg-icons';
import { Button } from 'react-bootstrap';
import { AdminAppliedFilterChip } from '@/pages/search/types';
import './AppliedFilterChips.scss';

interface AppliedFilterChipsProps {
  chips: AdminAppliedFilterChip[];
}

export function AppliedFilterChips({
  chips,
}: Readonly<AppliedFilterChipsProps>) {
  if (chips.length === 0) {
    return null;
  }

  return (
    <div className="chip-list">
      {chips.map((chip) => (
        <Button
          key={chip.label}
          type="button"
          className="chip"
          onClick={chip.onClear}
          aria-label={`Clear ${chip.label}`}
        >
          {chip.label}
          <FontAwesomeIcon icon={faCircleXmark} className="close-icon" />
        </Button>
      ))}
    </div>
  );
}
