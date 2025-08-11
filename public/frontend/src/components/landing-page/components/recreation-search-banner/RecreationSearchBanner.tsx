import { FC } from 'react';
import { Stack } from 'react-bootstrap';
import RecreationSuggestionForm from '@/components/recreation-suggestion-form/RecreationSuggestionForm';
import { faLocationPin } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { INTERNAL_LINKS } from '@/data/urls';
import '@/components/search/Search.scss';
import './RecreationSearchBanner.scss';

const MapLink = ({ className = '' }) => (
  <a
    href={INTERNAL_LINKS.SEARCH_MAP}
    className={`search-by-map-link ${className}`}
    aria-label="Search by map"
  >
    <FontAwesomeIcon icon={faLocationPin} className="me-2" aria-hidden="true" />
    Search by map
  </a>
);

export const RecreationSearchBanner: FC = () => {
  return (
    <section className="search-banner-container w-100 d-flex flex-column align-items-center">
      <section className="search-container rounded-2 d-flex flex-column">
        <Stack direction={'vertical'} gap={3}>
          <div className="search-header">
            <h2 className="search-title fs-4">
              Find a recreation{' '}
              <span className="d-inline-block">site or trail</span>
            </h2>
            <MapLink className="d-none d-sm-inline-block" />
          </div>

          <RecreationSuggestionForm
            allowEmptySearch={true}
            searchBtnVariant="secondary"
            trackingSource="Landing page"
          />
        </Stack>
        <MapLink className="d-block d-sm-none mt-3 mb-2 mx-auto" />
      </section>
    </section>
  );
};
