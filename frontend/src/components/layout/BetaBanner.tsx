import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import '@/components/layout/BetaBanner.scss';
import { useState, useEffect } from 'react';

const useMediaQuery = (query: string) => {
  const getMatches = () =>
    typeof window !== 'undefined' && window.matchMedia
      ? window.matchMedia(query).matches
      : false;

  const [matches, setMatches] = useState(getMatches);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;

    const media = window.matchMedia(query);
    const listener = (e: MediaQueryListEvent) => setMatches(e.matches);

    setMatches(media.matches);
    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, [query]);

  return matches;
};

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
