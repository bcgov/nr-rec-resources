import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleXmark } from '@fortawesome/free-solid-svg-icons';
import { Button } from 'react-bootstrap';
import { AdminAppliedFilterChip } from '@/pages/search/types';
import './AppliedFilterChips.scss';

interface AppliedFilterChipsProps {
  chips: AdminAppliedFilterChip[];
  onClearCommunity: (communityId: string) => void;
}

export function AppliedFilterChips({
  chips,
  onClearCommunity,
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
          onClick={() => {
            chip.onClear();
            onClearCommunity(chip.key);
          }}
          aria-label={`Clear ${chip.label}`}
        >
          {chip.label}
          <FontAwesomeIcon icon={faCircleXmark} className="close-icon" />
        </Button>
      ))}
    </div>
  );
}
