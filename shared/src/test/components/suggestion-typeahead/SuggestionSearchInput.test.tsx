import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SuggestionSearchInput } from '@shared/components/suggestion-typeahead/SuggestionSearchInput';

describe('SuggestionSearchInput', () => {
  it('renders input and search icon', () => {
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
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('calls refs with input element', () => {
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
    const input = screen.getByRole('textbox');
    inputRef.mockClear();
    referenceElementRef.mockClear();
    inputRef(input);
    referenceElementRef(input);
    expect(inputRef).toHaveBeenCalledWith(input);
    expect(referenceElementRef).toHaveBeenCalledWith(input);

    const spinners = screen.getAllByRole('status');
    expect(spinners).toHaveLength(1);
  });

  it('renders mobile search button when isMobileSearchBtn is true', () => {
    const inputRef = vi.fn();
    const referenceElementRef = vi.fn();
    render(
      <SuggestionSearchInput
        inputRef={inputRef}
        referenceElementRef={referenceElementRef}
        value=""
        onChange={() => {}}
        isMobileSearchBtn={true}
      />,
    );
    const mobileSearchButton = screen.getByLabelText('Search');
    expect(mobileSearchButton).toBeInTheDocument();
    expect(mobileSearchButton).toHaveClass('mobile-search-button');
  });

  it('does not render mobile search button when isMobileSearchBtn is false', () => {
    const inputRef = vi.fn();
    const referenceElementRef = vi.fn();
    render(
      <SuggestionSearchInput
        inputRef={inputRef}
        referenceElementRef={referenceElementRef}
        value=""
        onChange={() => {}}
        isMobileSearchBtn={false}
      />,
    );
    const mobileSearchButton = screen.queryByLabelText('Search');
    expect(mobileSearchButton).not.toBeInTheDocument();
  });
});
