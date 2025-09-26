import { useRef } from 'react';
import { Link } from 'react-router';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExternalLink } from '@fortawesome/free-solid-svg-icons';
import { RemoveScroll } from 'react-remove-scroll';
import { useClickOutside } from '@shared/hooks';
import { HEADER_LINKS } from './constants';
import { EXTERNAL_LINKS } from '@/data/urls';
import { trackClickEvent } from '@/utils/matomo';
import '@/components/layout/NavigationDrawer.scss';

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

  const handleFeedbackClick = () => {
    trackClickEvent({
      category: 'Feedback',
      name: 'Beta Banner Feedback Button - mobile navigation drawer',
    });
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
            <li key={index} className="navigation-drawer-item">
              {link.isExternal ? (
                <a
                  href={link.url}
                  rel="noopener noreferrer"
                  target="_blank"
                  onClick={() => handleMenuLinkClick(link.label)}
                >
                  {link.label}
                  <FontAwesomeIcon icon={faExternalLink} />
                </a>
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

          <li className="navigation-drawer-item feedback">
            <a
              href={EXTERNAL_LINKS.FEEDBACK_FORM}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => {
                handleMenuLinkClick('Share feedback');
                handleFeedbackClick();
              }}
            >
              Share feedback
              <FontAwesomeIcon icon={faExternalLink} />
            </a>
          </li>
        </ul>
      </nav>
    </RemoveScroll>
  );
};

export default NavigationDrawer;
