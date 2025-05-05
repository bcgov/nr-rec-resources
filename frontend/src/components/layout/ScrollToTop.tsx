import { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAngleUp } from '@fortawesome/free-solid-svg-icons';
import '@/components/layout/ScrollToTop.scss';

const ScrollToTop = () => {
  const [isScrollVisible, setIsScrollVisible] = useState(false);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleScroll = () => {
    const scrollPosition = window.scrollY;
    const threshold = 200;
    setIsScrollVisible(scrollPosition > threshold);
  };

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    isScrollVisible && (
      <button
        data-testid="scroll-button"
        className="btn-scroll"
        aria-label="scroll to top"
        onClick={scrollToTop}
      >
        <div className="btn-scroll--inner">
          <FontAwesomeIcon icon={faAngleUp} />
        </div>
      </button>
    )
  );
};

export default ScrollToTop;
