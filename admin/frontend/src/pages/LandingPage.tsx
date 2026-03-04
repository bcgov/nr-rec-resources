import { FC } from 'react';
import { Link } from '@tanstack/react-router';
import { faFileExport } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { RecreationResourceSuggestionForm } from '@/components/rec-resource-suggestion-form/RecreationResourceSuggestionForm';
import { ROUTE_PATHS } from '@/constants/routes';
import './LandingPage.scss';

export const LandingPage: FC = () => {
  return (
    <div className="landing-page w-100">
      <div className="search-container">
        <RecreationResourceSuggestionForm />
        <div className="ps-4 pb-2 pt-0">
          <Link className="exports-link" to={ROUTE_PATHS.EXPORTS}>
            <FontAwesomeIcon icon={faFileExport} aria-hidden="true" />
            Data exports
          </Link>
        </div>
      </div>
    </div>
  );
};
