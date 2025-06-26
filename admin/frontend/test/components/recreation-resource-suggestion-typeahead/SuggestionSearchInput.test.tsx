import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { SuggestionSearchInput } from "@/components/recreation-resource-suggestion-typeahead/SuggestionSearchInput";

describe("SuggestionSearchInput", () => {
  it("renders input and search icon", () => {
    const inputRef = vi.fn();
    const referenceElementRef = vi.fn();
    render(
      <SuggestionSearchInput
        inputRef={inputRef}
        referenceElementRef={referenceElementRef}
        value="test"
        onChange={() => {}}
      />,
    );
    expect(screen.getByRole("textbox")).toBeInTheDocument();
  });

  it("calls refs with input element", () => {
    const inputRef = vi.fn();
    const referenceElementRef = vi.fn();
    render(
      <SuggestionSearchInput
        inputRef={inputRef}
        referenceElementRef={referenceElementRef}
        value=""
        onChange={() => {}}
        isLoading={true}
      />,
    );
    // Simulate ref assignment
    const input = screen.getByRole("textbox");
    inputRef.mockClear();
    referenceElementRef.mockClear();
    inputRef(input);
    referenceElementRef(input);
    expect(inputRef).toHaveBeenCalledWith(input);
    expect(referenceElementRef).toHaveBeenCalledWith(input);

    const spinner = screen.getByRole("status");
    expect(spinner).toBeInTheDocument();
  });
});
