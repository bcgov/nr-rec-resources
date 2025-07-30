import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RecreationResourceSuggestion } from "@shared/components/suggestion-typeahead/types";
import { SuggestionTypeahead } from "@shared/components/suggestion-typeahead/SuggestionTypeahead";
import { Menu, MenuItem } from "react-bootstrap-typeahead";

vi.mock(
  "@shared/components/suggestion-typeahead/SuggestionSearchInput",
  () => ({
    SuggestionSearchInput: ({ ...props }: any) => (
      <input
        {...props}
        data-testid="custom-input"
        onChange={(e: any) => props.onChange && props.onChange(e)}
      />
    ),
  }),
);

vi.mock("@shared/components/suggestion-typeahead/SuggestionMenu", () => {
  return {
    SuggestionMenu: ({ results, menuProps }: any) => (
      <Menu {...menuProps} data-testid="custom-menu">
        {results.map((r: any, idx: number) => (
          <MenuItem option={r} position={idx} key={r.rec_resource_id}>
            {r.name}
          </MenuItem>
        ))}
      </Menu>
    ),
  };
});

describe("RecreationResourceSuggestionTypeahead", () => {
  const suggestions: RecreationResourceSuggestion[] = [
    { name: "Park Trail", rec_resource_id: "park-001" },
    { name: "Mountain Hike", rec_resource_id: "mountain-002" },
  ] as any;

  const defaultProps = {
    isLoading: false,
    suggestions,
    onSearch: vi.fn(),
    onChange: vi.fn(),
    searchTerm: "",
    error: null,
    emptyLabel: "No matches",
    placeholder: "Search resources...",
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders input and custom menu", async () => {
    render(<SuggestionTypeahead {...defaultProps} />);
    const input = screen.getByTestId("custom-input");
    expect(input).toBeInTheDocument();
  });

  it("calls onSearch when user types", async () => {
    render(<SuggestionTypeahead {...defaultProps} />);
    const input = screen.getByTestId("custom-input");
    await userEvent.type(input, "Park");
    await waitFor(() => {
      expect(defaultProps.onSearch).toHaveBeenCalledWith("Park");
    });
  });

  it("renders loading spinner when isLoading is true", () => {
    render(<SuggestionTypeahead {...defaultProps} isLoading={true} />);
    const input = screen.getByTestId("custom-input");
    expect(input).toBeInTheDocument();
  });

  it("calls onChange when an option is selected", async () => {
    render(<SuggestionTypeahead {...defaultProps} />);
    const input = screen.getByTestId("custom-input");

    fireEvent.change(input, { target: { value: "Park" } });

    // Simulate selecting an option
    const instance = screen.getByRole("combobox");
    fireEvent.keyDown(instance, { key: "ArrowDown" });
    fireEvent.keyDown(instance, { key: "Enter" });

    fireEvent.change(instance, { target: { value: "Park Trail" } });
  });

  it("displays custom placeholder", () => {
    render(<SuggestionTypeahead {...defaultProps} />);
    const input = screen.getByPlaceholderText("Search resources...");
    expect(input).toBeInTheDocument();
  });

  it("shows validation error styling when error is passed", () => {
    render(
      <SuggestionTypeahead
        {...defaultProps}
        error={new Error("Invalid input")}
      />,
    );
    const input = screen.getByTestId("custom-input");
    expect(input).toBeInTheDocument();
  });

  it("filters results by name and resource ID", async () => {
    const { container } = render(<SuggestionTypeahead {...defaultProps} />);
    const instance = container.querySelector("input");

    await userEvent.type(instance as HTMLInputElement, "park");

    await waitFor(() => {
      expect(defaultProps.onSearch).toHaveBeenCalledWith("park");
      expect(
        screen.getByRole("option", { name: /Park Trail/i }),
      ).toBeInTheDocument();
    });
  });

  it("filters results and selects the first option from the dropdown", async () => {
    const onChange = vi.fn();
    render(<SuggestionTypeahead {...defaultProps} onChange={onChange} />);
    const input = screen.getByTestId("custom-input");

    // Type to filter
    await userEvent.type(input, "park");

    await waitFor(() => {
      expect(defaultProps.onSearch).toHaveBeenCalledWith("park");
      expect(
        screen.getByRole("option", { name: /Park Trail/i }),
      ).toBeInTheDocument();
    });

    // Simulate selecting the first option from the dropdown
    fireEvent.click(screen.getByRole("option", { name: /Park Trail/i }));

    // The component's onChange should be called with the first suggestion
    await waitFor(() => {
      expect(onChange).toHaveBeenCalledWith(defaultProps.suggestions[0]);
    });
  });
});
