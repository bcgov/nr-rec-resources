import { RecreationResourceSuggestionForm } from "@/components/rec-resource-suggestion-form/RecreationResourceSuggestionForm";
import * as suggestionHook from "@/services/recreation-resource-admin";
import { RecreationResourceSuggestion } from "@shared/components/suggestion-typeahead/types";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useNavigate } from "react-router";
import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock dependencies
vi.mock("react-router", async () => ({
  ...(await vi.importActual("react-router")),
  useNavigate: vi.fn(),
}));

vi.mock("@/components/rec-resource-suggestion-form/SuggestionMenu", () => ({
  SuggestionMenu: ({ results, searchTerm }: any) => (
    <div data-testid="suggestion-menu">
      <div data-testid="menu-search-term">{searchTerm}</div>
      {results?.map((result: any) => (
        <div key={result.rec_resource_id} data-testid="menu-item">
          {result.name}
        </div>
      ))}
    </div>
  ),
}));

vi.mock("@shared/components/suggestion-typeahead/SuggestionTypeahead", () => ({
  SuggestionTypeahead: ({
    onChange,
    onSearch,
    searchTerm,
    suggestions,
    emptyLabel,
    placeholder,
    error,
    renderMenu,
  }: any) => (
    <div>
      <input
        data-testid="typeahead-input"
        placeholder={placeholder}
        value={searchTerm}
        onChange={(e) => onSearch(e.target.value)}
      />
      {renderMenu && suggestions?.length > 0 && (
        <div data-testid="custom-menu">
          {renderMenu(suggestions, { id: "test-menu" })}
        </div>
      )}
      <ul data-testid="typeahead-suggestions">
        {suggestions?.map((s: RecreationResourceSuggestion) => (
          <li
            key={s.rec_resource_id}
            onClick={() => onChange(s)}
            data-testid="typeahead-item"
          >
            {s.name}
          </li>
        ))}
      </ul>
      {typeof emptyLabel === "string" && (
        <div data-testid="empty-label">{emptyLabel}</div>
      )}
      {error && (
        <div data-testid="error-message" className="text-danger">
          {error.message}
        </div>
      )}
    </div>
  ),
}));

describe("RecreationResourceSuggestionForm", () => {
  const mockNavigate = vi.fn();

  // Reusable test data
  const testSuggestion: RecreationResourceSuggestion = {
    rec_resource_id: "123",
    name: "Test Park",
    recreation_resource_type_code: "",
    recreation_resource_type: "",
    district_description: "",
  };

  beforeEach(() => {
    vi.mocked(useNavigate).mockReturnValue(mockNavigate);
    vi.clearAllMocks();
  });

  const mockSuggestionHook = (overrides = {}) => {
    vi.spyOn(
      suggestionHook,
      "useGetRecreationResourceSuggestions",
    ).mockReturnValue({
      data: { suggestions: [] },
      isFetching: false,
      error: null,
      ...overrides,
    } as any);
  };

  it("renders with default state", () => {
    mockSuggestionHook();
    render(<RecreationResourceSuggestionForm />);

    expect(
      screen.getByText(/Search by resource name or number/i),
    ).toBeInTheDocument();
  });

  it("handles empty states correctly", async () => {
    mockSuggestionHook();
    render(<RecreationResourceSuggestionForm />);

    const input = screen.getByTestId("typeahead-input");

    // Test short input (< 3 characters)
    await userEvent.type(input, "ab");
    expect(screen.getByTestId("empty-label")).toHaveTextContent(
      "Please enter at least 3 characters to search",
    );

    // Test valid input with no results
    await userEvent.clear(input);
    await userEvent.type(input, "park");
    expect(screen.getByTestId("empty-label")).toHaveTextContent(
      "No results found",
    );
  });

  it("shows error message when hook returns error", () => {
    mockSuggestionHook({
      error: { message: "Something went wrong", response: { status: 400 } },
    });
    render(<RecreationResourceSuggestionForm />);

    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
  });

  it("handles suggestions and navigation", async () => {
    mockSuggestionHook({
      data: { total: 1, suggestions: [testSuggestion] },
    });

    render(<RecreationResourceSuggestionForm />);

    const input = screen.getByTestId("typeahead-input");
    await userEvent.type(input, "test");

    // Test navigation on selection
    const suggestionItem = screen.getByTestId("typeahead-item");
    await userEvent.click(suggestionItem);
    expect(mockNavigate).toHaveBeenCalledWith("/rec-resource/123");

    // Test custom menu rendering (renderMenu callback)
    expect(screen.getByTestId("custom-menu")).toBeInTheDocument();
    expect(screen.getByTestId("suggestion-menu")).toBeInTheDocument();
    expect(screen.getByTestId("menu-search-term")).toHaveTextContent("test");
    expect(screen.getByTestId("menu-item")).toHaveTextContent("Test Park");
  });
});
