import { useState } from 'react';
import { Link } from '@tanstack/react-router';
import { Modal } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark } from '@fortawesome/free-solid-svg-icons';
import {
  SEARCH_LINKS,
  SEARCH_LINKS_TITLE,
} from '@/components/search/constants';
import '@/components/search/SearchLinks.scss';
import DownloadKmlResults from './DownloadKmlResults';

interface SearchLinksMobileProps {
  totalCount: number;
  ids: string[];
  trackingView: 'list' | 'map';
}

const SearchLinksMobile = ({
  totalCount,
  ids,
  trackingView,
}: SearchLinksMobileProps) => {
  const [isMobileModalOpen, setIsMobileModalOpen] = useState(false);

  const [isDisplayKmlDownload, setIsDisplayKmlDownload] = useState(false);

  const handleDisplayKmlDownload = () => {
    setIsDisplayKmlDownload(!isDisplayKmlDownload);
  };

  const handleOpenMobileModal = () => {
    setIsMobileModalOpen(true);
  };

  const handleCloseMobileModal = () => {
    setIsMobileModalOpen(false);
  };

  const handleLinkClick = () => {
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
                  to={link.path}
                  search={link.search}
                  className="search-link-item"
                  onClick={handleLinkClick}
                >
                  {link.label}
                </Link>
              ))}
              {!isDisplayKmlDownload && (
                <a
                  className="search-link-item"
                  href="#"
                  onClick={(event) => {
                    event.preventDefault();
                    handleDisplayKmlDownload();
                  }}
                >
                  Download KML
                </a>
              )}
            </div>
            {isDisplayKmlDownload && (
              <div className="kml-box">
                <DownloadKmlResults
                  searchResultsNumber={totalCount}
                  ids={ids}
                  trackingView={trackingView}
                  handleCloseModal={() => {
                    handleDisplayKmlDownload();
                  }}
                />
              </div>
            )}
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default SearchLinksMobile;
