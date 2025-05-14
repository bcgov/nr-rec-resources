import RSTLogo from '@/images/RST_nav_logo.svg';
import '@/components/layout/Header.scss';
import BetaBanner from './BetaBanner';
import { trackClickEvent } from '@/utils/matomo';
import { ROUTE_PATHS } from '@/routes';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExternalLink } from '@fortawesome/free-solid-svg-icons';
import { Stack } from 'react-bootstrap';
import { EXTERNAL_LINKS } from '@/data/urls';

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
                alt="Recreation Sites and Trails BC Logo"
                style={{ height: 64 }}
              />
            </a>
          </div>
        </nav>
      </div>
      <div className="page-nav-container sub">
        <nav
          aria-label="Secondary header site navigation"
          className="header-nav sub"
        >
          <Stack direction="horizontal" gap={3}>
            <a href="/search">Find a site or trail</a>
            <a
              target="_blank"
              href={EXTERNAL_LINKS.RST_ARCGIS_MAP_FULL_SCREEN}
              rel="noreferrer"
              onClick={trackClickEvent({
                category: 'External link',
                name: 'Interactive map',
              })}
            >
              <Stack direction={'horizontal'} gap={1}>
                Interactive map
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
