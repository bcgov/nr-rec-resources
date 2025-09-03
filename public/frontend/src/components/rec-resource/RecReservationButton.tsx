import { Button } from 'react-bootstrap';
import { faUpRightFromSquare } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

export enum ReservationType {
  LINK = 'link',
  EMAIL = 'email',
  PHONE = 'phone',
}

export interface RecReservationButtonProps {
  type: ReservationType;
  text: string;
}

const RecReservationButton: React.FC<RecReservationButtonProps> = ({
  type,
  text,
}) => {
  const openLink = (link: string | undefined) => {
    window.open(link);
  };

  const mailTo = (email: string | undefined) => {
    window.open(`mailto:${email}`);
  };

  const phoneTo = (phone: string | undefined) => {
    window.open(`tel:${phone}`);
  };

  const buttonFunction = (text: string) => {
    switch (type) {
      case ReservationType.LINK:
        openLink(text);
        break;
      case ReservationType.PHONE:
        phoneTo(text);
        break;
      case ReservationType.EMAIL:
        mailTo(text);
        break;
    }
  };

  return (
    <Button
      variant={'secondary'}
      type="submit"
      className="submit-btn reservation-button"
      onClick={() => buttonFunction(text)}
    >
      {type === ReservationType.LINK ? 'Book now' : text} &nbsp;
      <FontAwesomeIcon icon={faUpRightFromSquare} />
    </Button>
  );
};

export default RecReservationButton;
