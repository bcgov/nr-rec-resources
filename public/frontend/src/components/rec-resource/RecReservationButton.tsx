import { Button } from 'react-bootstrap';
import DownloadIcon from '@/images/icons/download.svg';

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
      <img src={DownloadIcon} alt="download icon" width={16} height={16} />
    </Button>
  );
};

export default RecReservationButton;
