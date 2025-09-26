import { forwardRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faXmark } from '@fortawesome/free-solid-svg-icons';
import '@/components/layout/HamburgerButton.scss';

interface HamburgerButtonProps {
  isOpen: boolean;
  onToggle: () => void;
}

const HamburgerButton = forwardRef<HTMLButtonElement, HamburgerButtonProps>(
  ({ isOpen, onToggle }, ref) => {
    return (
      <button
        ref={ref}
        className="hamburger-toggle"
        onClick={onToggle}
        aria-label={isOpen ? 'Close menu' : 'Open menu'}
        aria-expanded={isOpen}
      >
        <FontAwesomeIcon icon={isOpen ? faXmark : faBars} />
      </button>
    );
  },
);

export default HamburgerButton;
