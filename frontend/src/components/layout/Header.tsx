import BCLogo from '@/images/BC_nav_logo.svg';
import RSTLogo from '@/images/RST_nav_logo.svg';
import '@/components/layout/Header.scss';
import BetaBanner from './BetaBanner';
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
        <nav
          aria-label="Main header navigation"
          className="page-nav header-nav main"
        >
          <div className="navbar-brand">
            <a href={ROUTE_PATHS.HOME}>
              <img
                src={BCLogo}
                alt="British Columbia Logo"
                style={{ height: 64 }}
              />
              <img
                src={RSTLogo}
                alt="Recreation Sites and Trails BC Logo"
                style={{ height: 64 }}
              />
            </a>
            <span className="beta-button">BETA</span>
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
