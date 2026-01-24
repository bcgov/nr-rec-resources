import { Card, Form, Stack } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarCheck, faCalendar } from '@fortawesome/free-solid-svg-icons';
import './HasReservation.scss';

type HasReservationProps = {
  isEditMode?: boolean;
  value: boolean;
  onChange?: (value: boolean) => void;
};

export const HasReservation = ({
  isEditMode = false,
  value,
  onChange,
}: HasReservationProps) => {
  const handleToggle = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange?.(event.target.checked);
  };

  return (
    <Card className="reservation-card">
      <Card.Body>
        <Stack
          direction="horizontal"
          gap={2}
          className="align-items-start justify-content-between"
          aria-label="Reservation requirement control"
        >
          <Stack direction="vertical" gap={2}>
            <span className="fw-bold">
              <FontAwesomeIcon
                icon={value ? faCalendarCheck : faCalendar}
                className="me-2"
              />
              Requires Reservation
            </span>
            <span className={`pill pill__${value ? 'visible' : 'hidden'}`}>
              {value
                ? `Yes - Requires reservation`
                : `No - do not require reservation`}
            </span>
          </Stack>
          {isEditMode && (
            <div>
              <Form.Check
                type="switch"
                id="reservation-requirement-switch"
                checked={value}
                onChange={handleToggle}
                aria-label="Toggle requirement for reservation on rec resource"
                className="cursor-pointer"
              />
            </div>
          )}
        </Stack>
      </Card.Body>
    </Card>
  );
};
