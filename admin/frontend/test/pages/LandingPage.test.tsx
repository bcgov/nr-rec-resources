import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { LandingPage } from "@/pages/LandingPage";

vi.mock(
  "@/components/rec-resource-suggestion-form/RecreationResourceSuggestionForm",
  () => ({
    RecreationResourceSuggestionForm: () => (
      <div data-testid="mock-suggestion-form">Mock Suggestion Form</div>
    ),
  }),
);

describe("LandingPage", () => {
  it("renders the landing page and includes the suggestion form", () => {
    render(<LandingPage />);

    const container = screen.getByTestId("mock-suggestion-form");

    expect(container).toBeInTheDocument();
    expect(container).toHaveTextContent("Mock Suggestion Form");

    expect(document.querySelector(".landing-page")).toBeInTheDocument();
    expect(document.querySelector(".search-container")).toBeInTheDocument();
  });
});
