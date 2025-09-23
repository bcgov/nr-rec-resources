import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Modal } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark } from '@fortawesome/free-solid-svg-icons';
import { trackEvent } from '@/utils/matomo';
import {
  SEARCH_LINKS,
  SEARCH_LINKS_TITLE,
} from '@/components/search/constants';
import '@/components/search/SearchLinks.scss';

const SearchLinksMobile = () => {
  const [isMobileModalOpen, setIsMobileModalOpen] = useState(false);

  const handleOpenMobileModal = () => {
    setIsMobileModalOpen(true);
    trackEvent({
      category: 'Search',
      action: 'Click',
      name: 'Open search links modal',
    });
  };

  const handleCloseMobileModal = () => {
    setIsMobileModalOpen(false);
  };

  const handleLinkClick = (linkName: string) => {
    trackEvent({
      category: 'Search',
      action: 'Click',
      name: `Search link - ${linkName}`,
    });
    setIsMobileModalOpen(false);
  };

  return (
    <>
      <button
        aria-label={SEARCH_LINKS_TITLE}
        onClick={handleOpenMobileModal}
        className="btn btn-secondary d-block d-lg-none mb-3 w-100"
      >
        {SEARCH_LINKS_TITLE}
      </button>

      <Modal
        show={isMobileModalOpen}
        onHide={handleCloseMobileModal}
        aria-labelledby="search-links-modal"
        className="search-links-modal d-block d-lg-none"
        scrollable
      >
        <Modal.Body className="search-links-modal-content">
          <div className="w-100">
            <div className="search-links-modal-header">
              <h2 className="fs-4 mb-4">{SEARCH_LINKS_TITLE}</h2>
              <button
                aria-label="close"
                className="btn close-search-links-btn"
                onClick={handleCloseMobileModal}
              >
                <FontAwesomeIcon icon={faXmark} />
              </button>
            </div>

            <div className="search-links-list">
              {SEARCH_LINKS.map((link) => (
                <Link
                  key={link.trackingName}
                  to={{ pathname: link.path, search: link.search }}
                  className="search-link-item"
                  onClick={() => handleLinkClick(link.trackingName)}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default SearchLinksMobile;
