import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleInfo } from '@fortawesome/free-solid-svg-icons';
import './InfoAlert.scss';

const InfoAlert = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="info-alert alert alert-info" role="alert">
      <div className="info-alert-icon">
        <FontAwesomeIcon
          icon={faCircleInfo}
          className="me-2"
          aria-label="info icon"
        />
      </div>
      <span className="info-alert-text">{children}</span>
    </div>
  );
};

export default InfoAlert;
