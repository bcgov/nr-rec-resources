import { useState, useRef } from 'react';
import { Link } from 'react-router';
import { Stack } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExternalLink } from '@fortawesome/free-solid-svg-icons';
import RSTLogo from '@/images/RST_nav_logo.svg';
import BetaBanner from '@/components/layout/BetaBanner';
import HamburgerButton from '@/components/layout/HamburgerButton';
import NavigationDrawer from '@/components/layout/NavigationDrawer';
import { trackClickEvent } from '@/utils/matomo';
import { ROUTE_PATHS } from '@/routes';
import { HEADER_LINKS } from '@/components/layout/constants';
import '@/components/layout/Header.scss';

const Header = () => {
  const [isHamburgerMenuOpen, setIsHamburgerMenuOpen] = useState(false);
  const hamburgerButtonRef = useRef<HTMLButtonElement>(null);

  const handleHeaderLinkClick = (linkLabel: string) => {
    trackClickEvent({
      category: 'Header Navigation',
      name: `Sub Header - ${linkLabel}`,
    });
  };

  const handleHamburgerMenuToggle = () => {
    setIsHamburgerMenuOpen(!isHamburgerMenuOpen);
  };

  const handleHamburgerMenuClose = () => {
    setIsHamburgerMenuOpen(false);
  };

  const env = import.meta.env.MODE;
  const isLocal =
    import.meta.url.includes('localhost') ||
    import.meta.url.includes('127.0.0.1');

  return (
    <header id="header">
      <BetaBanner />
      <div className={`page-nav-container main`}>
        <nav aria-label="Main header navigation" className="header-nav main">
          <div className="navbar-brand">
            <Link to={ROUTE_PATHS.HOME}>
              <img
                src={RSTLogo}
                className="header-logo"
                alt="Recreation Sites and Trails BC Logo"
              />
            </Link>
            {(env === 'development' || env === 'test') && (
              <span className={`env-identification ${env && env}`}>
                {env === 'development' ? 'Dev' : 'Test'} environment
                {isLocal && '  - Local'}
              </span>
            )}
          </div>
          <div className="header-actions">
            <HamburgerButton
              ref={hamburgerButtonRef}
              isOpen={isHamburgerMenuOpen}
              onToggle={handleHamburgerMenuToggle}
            />
          </div>
        </nav>
      </div>
      <div className="page-nav-container sub">
        <nav
          aria-label="Secondary header site navigation"
          className="header-nav sub"
        >
          <Stack direction="horizontal" gap={4}>
            {HEADER_LINKS.map((link, index) => (
              <div key={index}>
                {link.isExternal ? (
                  <a
                    href={link.url}
                    rel="noopener noreferrer"
                    target="_blank"
                    onClick={() => handleHeaderLinkClick(link.label)}
                  >
                    <Stack direction={'horizontal'} gap={1}>
                      {link.label}
                      <FontAwesomeIcon icon={faExternalLink} />
                    </Stack>
                  </a>
                ) : (
                  <Link
                    to={link.url}
                    onClick={() => handleHeaderLinkClick(link.label)}
                  >
                    {link.label}
                  </Link>
                )}
              </div>
            ))}
          </Stack>
        </nav>
      </div>
      <NavigationDrawer
        isOpen={isHamburgerMenuOpen}
        onClose={handleHamburgerMenuClose}
        buttonRef={hamburgerButtonRef}
      />
    </header>
  );
};

export default Header;
