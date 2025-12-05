import { FC } from 'react';
import { Stack } from 'react-bootstrap';
import RecreationSuggestionForm from '@/components/recreation-suggestion-form/RecreationSuggestionForm';
import { faMap } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import '@/components/search/Search.scss';
import './RecreationSearchBanner.scss';
import { Link } from '@tanstack/react-router';
import { ROUTE_PATHS } from '@/constants/routes';

const MapLink = ({ className = '' }) => (
  <Link
    to="/search"
    search={{ view: 'map' }}
    className={`search-by-map-link ${className}`}
    aria-label="Search by map"
  >
    <FontAwesomeIcon icon={faMap} className="me-2" aria-hidden="true" />
    Search by map
  </Link>
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
        <div>
          <div className="reservable-title">Are campsites reservable?</div>
          <div className="reservable-msg">
            Most campsites are available on a first-come, first-served basis and
            cannot be booked ahead of time. View our{' '}
            <a href={`${ROUTE_PATHS.HOME}${'search?fees=R'}`}>
              reservable sites
            </a>{' '}
            and check out each description section to get more details about
            fees and reservations.
          </div>
        </div>
      </section>
    </section>
  );
};
