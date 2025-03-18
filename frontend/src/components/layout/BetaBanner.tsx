import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import '@/components/layout/BetaBanner.scss';
import useMediaQuery from '@/hooks/useMediaQuery';

const BetaBanner = () => {
  const isMobile = useMediaQuery('(max-width: 767px)');

  return (
    <div className="banner">
      <div className="banner-content">
        <FontAwesomeIcon icon={faInfoCircle} className="info-icon" />
        <span className="banner-text">
          {isMobile ? (
            <>
              This site is in Beta
              <br />
              <a
                href="https://www.sitesandtrailsbc.ca"
                rel="noreferrer"
                className="banner-link"
              >
                Visit original site
              </a>
            </>
          ) : (
            <>
              This site is in development | Visit the
              <a
                href="https://www.sitesandtrailsbc.ca"
                rel="noreferrer"
                className="banner-link"
              >
                original site here
              </a>
            </>
          )}
        </span>
      </div>
      <a
        className="banner-button"
        href="https://example.com"
        target="_blank"
        rel="noopener noreferrer"
      >
        {isMobile ? 'Give feedback' : 'Submit your feedback'}
      </a>
    </div>
  );
};

export default BetaBanner;
