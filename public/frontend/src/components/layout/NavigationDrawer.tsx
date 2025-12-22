import { useRef } from 'react';
import { Link } from '@tanstack/react-router';
import { RemoveScroll } from 'react-remove-scroll';
import { useClickOutside } from '@shared/hooks';
import { ExternalLink } from '@shared/components/links';
import { HEADER_LINKS } from './constants';
import { trackClickEvent } from '@shared/utils';
import '@/components/layout/NavigationDrawer.scss';
import { EXTERNAL_LINKS } from '@/constants/urls';

interface NavigationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  buttonRef: React.RefObject<HTMLButtonElement | null>;
}

const NavigationDrawer = ({
  isOpen,
  onClose,
  buttonRef,
}: NavigationDrawerProps) => {
  const dropdownRef = useRef<HTMLElement>(null);

  useClickOutside(dropdownRef, (event) => {
    // Don't close if clicking on the hamburger button
    if (buttonRef.current && buttonRef.current.contains(event.target as Node)) {
      return;
    }
    if (isOpen) {
      onClose();
    }
  });

  const handleMenuLinkClick = (linkLabel: string) => {
    trackClickEvent({
      category: 'Mobile Navigation',
      name: `Hamburger Menu - ${linkLabel}`,
    });
    onClose();
  };

  return (
    <RemoveScroll enabled={isOpen}>
      <nav
        ref={dropdownRef}
        className={`navigation-drawer ${isOpen ? 'menu-open' : 'menu-closed'}`}
        aria-label="Mobile navigation menu"
      >
        <ul className="navigation-drawer-list">
          {HEADER_LINKS.map((link, index) => (
            <li
              key={index}
              className={`navigation-drawer-item ${link.url === EXTERNAL_LINKS.FEEDBACK_FORM && 'feedback'}`}
            >
              {link.isExternal ? (
                <ExternalLink
                  url={link.url}
                  label={link.label}
                  onClick={() => handleMenuLinkClick(link.label)}
                />
              ) : (
                <Link
                  to={link.url}
                  onClick={() => handleMenuLinkClick(link.label)}
                >
                  {link.label}
                </Link>
              )}
            </li>
          ))}
        </ul>
      </nav>
    </RemoveScroll>
  );
};

export default NavigationDrawer;
