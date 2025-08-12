import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import '@/components/layout/BetaBanner.scss';
import useMediaQuery from '@/hooks/useMediaQuery';
import { trackClickEvent } from '@/utils/matomo';
import { EXTERNAL_LINKS } from '@/data/urls';
import { Button } from 'react-bootstrap';

const BetaBanner = () => {
  const isMobile = useMediaQuery('(max-width: 767px)');

  return (
    <div className="beta-banner">
      <div className="banner-content">
        <FontAwesomeIcon icon={faInfoCircle} className="info-icon" />
        <span className="banner-text">
          {isMobile ? (
            <>
              This site is in Beta
              <br className="d-none d-sm-inline" />
              <span className="d-inline d-sm-none"> | </span>
              <a
                href="https://www.sitesandtrailsbc.ca"
                rel="noreferrer"
                className="banner-link"
              >
                Visit legacy site
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
                legacy site here
              </a>
            </>
          )}
        </span>
      </div>
      <Button
        href={EXTERNAL_LINKS.FEEDBACK_FORM}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Share your feedback (opens in a new tab)"
        className="py-4 d-none d-sm-flex"
        onClick={trackClickEvent({
          category: 'Feedback',
          name: 'Beta Banner Feedback Button',
        })}
      >
        Share your feedback
      </Button>
    </div>
  );
};

export default BetaBanner;
