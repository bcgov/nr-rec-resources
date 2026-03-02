import { FC } from 'react';
import { Link } from '@tanstack/react-router';
import { RecreationResourceSuggestionForm } from '@/components/rec-resource-suggestion-form/RecreationResourceSuggestionForm';
import { ROUTE_PATHS } from '@/constants/routes';
import './LandingPage.scss';

export const LandingPage: FC = () => {
  return (
    <div className="landing-page w-100">
      <div className="search-container">
        <RecreationResourceSuggestionForm />
        <div className="p-4 pt-0">
          <Link className="exports-link" to={ROUTE_PATHS.EXPORTS}>
            Data export
          </Link>
        </div>
      </div>
    </div>
  );
};
