import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RecreationResourceSuggestionForm } from "@/components/rec-resource-suggestion-form/RecreationResourceSuggestionForm";
import { useNavigate } from "react-router";
import * as suggestionHook from "@/services/hooks/recreation-resource-admin/useGetRecreationResourceSuggestions";
import { RecreationResourceSuggestion } from "@/components/recreation-resource-suggestion-typeahead/types";

vi.mock("react-router", async () => {
  const actual = await vi.importActual("react-router");
  return {
    ...actual,
    useNavigate: vi.fn(),
  };
});

vi.mock(
  "@/components/recreation-resource-suggestion-typeahead/RecreationResourceSuggestionTypeahead",
  () => ({
    RecreationResourceSuggestionTypeahead: ({
      onChange,
      onSearch,
      searchTerm,
      suggestions,
      emptyLabel,
      placeholder,
      error,
    }: any) => (
      <div>
        <input
          data-testid="typeahead-input"
          placeholder={placeholder}
          value={searchTerm}
          onChange={(e) => onSearch(e.target.value)}
        />
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
  }),
);

describe("RecreationResourceSuggestionForm", () => {
  const mockNavigate = vi.fn();

  beforeEach(() => {
    vi.mocked(useNavigate).mockReturnValue(mockNavigate);
  });

  const mockUseGetSuggestions = (
    result: Partial<
      ReturnType<typeof suggestionHook.useGetRecreationResourceSuggestions>
    >,
  ) => {
    vi.spyOn(
      suggestionHook,
      "useGetRecreationResourceSuggestions",
    ).mockReturnValue({
      data: { suggestions: [] },
      isFetching: false,
      error: null,
      ...result,
    } as any);
  };

  it("renders with default state", () => {
    mockUseGetSuggestions({});
    render(<RecreationResourceSuggestionForm />);

    expect(
      screen.getByText(/Search by resource name or number/i),
    ).toBeInTheDocument();
  });

  it("shows empty label for short input", async () => {
    mockUseGetSuggestions({});
    render(<RecreationResourceSuggestionForm />);

    const input = screen.getByTestId("typeahead-input");
    await userEvent.type(input, "ab");

    expect(screen.getByTestId("empty-label")).toHaveTextContent(
      "Please enter at least 3 characters to search",
    );
  });

  it("shows 'no results' when valid input but no suggestions", async () => {
    mockUseGetSuggestions({});
    render(<RecreationResourceSuggestionForm />);

    const input = screen.getByTestId("typeahead-input");
    await userEvent.type(input, "park");

    expect(screen.getByTestId("empty-label")).toHaveTextContent(
      "No results found",
    );
  });

  it("shows error message when hook returns error", () => {
    mockUseGetSuggestions({
      error: { message: "Something went wrong" },
    } as any);
    render(<RecreationResourceSuggestionForm />);

    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
  });

  it("renders suggestions and navigates on selection", async () => {
    const suggestion: RecreationResourceSuggestion = {
      rec_resource_id: "123",
      name: "Test Park",
      recreation_resource_type_code: "",
      recreation_resource_type: "",
      district_description: "",
    };

    mockUseGetSuggestions({
      data: { total: 1, suggestions: [suggestion] },
    });

    render(<RecreationResourceSuggestionForm />);

    const input = screen.getByTestId("typeahead-input");
    await userEvent.type(input, "test");

    const suggestionItem = await screen.findByText("Test Park");
    await userEvent.click(suggestionItem);

    expect(mockNavigate).toHaveBeenCalledWith("/rec-resource/123/files");
  });
});
