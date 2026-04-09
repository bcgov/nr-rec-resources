import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';

interface VisibleOnWebsiteProps {
  visible: boolean;
}

export function VisibleOnWebsite({ visible }: VisibleOnWebsiteProps) {
  return (
    <>
      <FontAwesomeIcon icon={visible ? faEye : faEyeSlash} className="me-2" />
      {visible ? 'Visible' : 'Not visible'}
    </>
  );
}
