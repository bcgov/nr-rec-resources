import { useState, useRef } from 'react';
import { Link } from 'react-router';
import { Stack } from 'react-bootstrap';
import RSTLogo from '@/images/RST_nav_logo.svg';
import BetaBanner from '@/components/layout/BetaBanner';
import HamburgerButton from '@/components/layout/HamburgerButton';
import NavigationDrawer from '@/components/layout/NavigationDrawer';
import { trackClickEvent } from '@shared/utils';
import { ExternalLink } from '@shared/components/links';
import { EnvironmentBanner } from '@shared/components/environment-banner';
import { ROUTE_PATHS } from '@/routes';
import { HEADER_LINKS } from '@/components/layout/constants';
import '@/components/layout/Header.scss';
import '@shared/components/environment-banner/EnvironmentBanner.scss';

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
            <EnvironmentBanner />
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
                  <ExternalLink
                    url={link.url}
                    label={link.label}
                    onClick={() => handleHeaderLinkClick(link.label)}
                  />
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
