import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import '@/components/layout/BetaBanner.scss';

const BetaBanner = () => {
  const handleButtonClick = () => {
    window.open('https://example.com', '_blank');
  };

  return (
    <div className="banner">
      <div className="banner-content">
        <FontAwesomeIcon icon={faInfoCircle} className="info-icon" />
        <span className="banner-text">
          <span className="desktop-text"></span>
          <a
            href="https://www.sitesandtrailsbc.ca"
            rel="noreferrer"
            className="banner-link"
          ></a>
        </span>
      </div>
      <button className="banner-button" onClick={handleButtonClick}></button>
    </div>
  );
};

export default BetaBanner;
