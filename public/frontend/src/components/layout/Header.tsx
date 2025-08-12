import RSTLogo from '@/images/RST_nav_logo.svg';
import '@/components/layout/Header.scss';
import BetaBanner from './BetaBanner';
import { Button, Stack } from 'react-bootstrap';
import { trackClickEvent } from '@/utils/matomo';
import { ROUTE_PATHS } from '@/routes';
import { EXTERNAL_LINKS } from '@/data/urls';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExternalLink } from '@fortawesome/free-solid-svg-icons';

const Header = () => {
  return (
    <header id="header">
      <BetaBanner />
      <div className="page-nav-container main">
        <nav aria-label="Main header navigation" className="header-nav main">
          <div className="navbar-brand">
            <a href={ROUTE_PATHS.HOME}>
              <img
                src={RSTLogo}
                className="header-logo"
                alt="Recreation Sites and Trails BC Logo"
              />
            </a>
          </div>
          <Button
            href={EXTERNAL_LINKS.FEEDBACK_FORM}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Share your feedback (opens in a new tab)"
            className="header-feedback-btn"
            onClick={trackClickEvent({
              category: 'Feedback',
              name: 'Beta Banner Feedback Button - mobile',
            })}
          >
            Share feedback
          </Button>
        </nav>
      </div>
      <div className="page-nav-container sub">
        <nav
          aria-label="Secondary header site navigation"
          className="header-nav sub"
        >
          <Stack direction="horizontal" gap={3}>
            <a href="/search">Find a site or trail</a>
            <a href={EXTERNAL_LINKS.LEGACY_SITE} rel="noopener noreferrer">
              <Stack direction={'horizontal'} gap={1}>
                Legacy site
                <FontAwesomeIcon icon={faExternalLink} />
              </Stack>
            </a>
          </Stack>
        </nav>
      </div>
    </header>
  );
};

export default Header;
