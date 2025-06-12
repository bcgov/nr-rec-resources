import { FC } from "react";
import { RecreationResourceSuggestionForm } from "@/components/rec-resource-suggestion-form/RecreationResourceSuggestionForm";
import "./LandingPage.scss";

export const LandingPage: FC = () => {
  return (
    <div className="landing-page w-100">
      <div className="search-container">
        <RecreationResourceSuggestionForm />
      </div>
    </div>
  );
};
