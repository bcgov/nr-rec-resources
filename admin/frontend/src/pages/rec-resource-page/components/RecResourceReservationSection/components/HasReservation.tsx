import { Form, Stack } from 'react-bootstrap';
import { FormLabel } from '@/components/form';
import '@/pages/rec-resource-page/components/RecResourceReservationSection/RecResourceReservationSection.scss';

type HasReservationProps = {
  value: boolean;
  onChange?: (value: boolean) => void;
};

export const HasReservation = ({ value, onChange }: HasReservationProps) => {
  return (
    <Form.Group className="m-0 p-0">
      <Stack>
        <FormLabel className="fw-bold fs-5 mb-2" public>
          Reservation
        </FormLabel>
      </Stack>
      <FormLabel className="reservation-form-label mb-2" required>
        Is this resource reservable?
      </FormLabel>
      <Stack direction="horizontal" gap={4}>
        <Form.Check
          data-testid="reservable-yes"
          type="radio"
          id="reservation-requirement-yes"
          checked={value}
          onChange={() => onChange?.(true)}
          aria-label="Reservable yes"
          label="Yes"
          className="cursor-pointer"
          name="has_reservation"
        />
        <Form.Check
          data-testid="reservable-no"
          type="radio"
          id="reservation-requirement-no"
          checked={!value}
          onChange={() => onChange?.(false)}
          aria-label="Reservable no"
          label="No"
          className="cursor-pointer"
          name="has_reservation"
        />
      </Stack>
    </Form.Group>
  );
};
