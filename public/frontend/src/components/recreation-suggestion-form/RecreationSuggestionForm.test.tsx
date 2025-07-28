import { vi } from 'vitest';
import type { Mock } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import RecreationSuggestionForm from '@/components/recreation-suggestion-form/RecreationSuggestionForm';
import { useSearchInput } from '@/components/recreation-suggestion-form/hooks/useSearchInput';
import { useCurrentLocation } from '@/components/recreation-suggestion-form/hooks/useCurrentLocation';
import { renderWithQueryClient } from '@/test-utils';

vi.mock('@/components/recreation-suggestion-form/hooks/useSearchInput', () => ({
  useSearchInput: vi.fn(),
}));

vi.mock(
  '@/components/recreation-suggestion-form/hooks/useCurrentLocation',
  () => ({
    useCurrentLocation: vi.fn(),
  }),
);

const mockedUseSearchInput = useSearchInput as Mock;
const mockedUseCurrentLocation = useCurrentLocation as Mock;

describe('RecreationSuggestionForm', () => {
  const handleSearch = vi.fn();
  const setSearchInputValue = vi.fn();
  const handleClearTypeaheadSearch = vi.fn();
  const handleCityOptionSearch = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    mockedUseSearchInput.mockReturnValue({
      defaultSearchInputValue: '',
      searchInputValue: '',
      setSearchInputValue,
      handleCityOptionSearch,
      handleClearTypeaheadSearch,
      handleSearch,
    });

    mockedUseCurrentLocation.mockReturnValue({
      getLocation: vi.fn(),
      permissionDeniedCount: 0,
    });
  });

  it('calls handleSearch on submit if searchInputValue is not empty', async () => {
    mockedUseSearchInput.mockReturnValue({
      defaultSearchInputValue: '',
      searchInputValue: 'parks',
      setSearchInputValue,
      handleCityOptionSearch,
      handleClearTypeaheadSearch,
      handleSearch,
    });

    renderWithQueryClient(
      <RecreationSuggestionForm allowEmptySearch={false} />,
    );

    fireEvent.click(screen.getByRole('button', { name: /search/i }));

    expect(handleSearch).toHaveBeenCalledTimes(1);
  });

  it('does not call handleSearch if input is empty and allowEmptySearch is false', () => {
    mockedUseSearchInput.mockReturnValue({
      defaultSearchInputValue: '',
      searchInputValue: '',
      setSearchInputValue,
      handleCityOptionSearch,
      handleClearTypeaheadSearch,
      handleSearch,
    });

    renderWithQueryClient(
      <RecreationSuggestionForm allowEmptySearch={false} />,
    );

    fireEvent.click(screen.getByRole('button', { name: /search/i }));

    expect(handleSearch).not.toHaveBeenCalled();
  });

  it('shows NotificationToast when location permission is denied', () => {
    mockedUseCurrentLocation.mockReturnValue({
      getLocation: vi.fn(),
      permissionDeniedCount: 2,
    });

    renderWithQueryClient(<RecreationSuggestionForm />);

    expect(
      screen.getByText(/Location permission blocked/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Please update your location permission and try again/i),
    ).toBeInTheDocument();
  });

  it('calls handleSearch on Enter key press when input is not empty', async () => {
    mockedUseSearchInput.mockReturnValue({
      defaultSearchInputValue: '',
      searchInputValue: 'trail',
      setSearchInputValue,
      handleCityOptionSearch,
      handleClearTypeaheadSearch,
      handleSearch,
    });

    renderWithQueryClient(
      <RecreationSuggestionForm allowEmptySearch={false} />,
    );

    const input = screen.getByRole('combobox');
    await userEvent.type(input, '{enter}');

    expect(handleSearch).toHaveBeenCalled();
  });

  it('does not call handleSearch on Enter if input is empty and allowEmptySearch is false', async () => {
    mockedUseSearchInput.mockReturnValue({
      defaultSearchInputValue: '',
      searchInputValue: '',
      setSearchInputValue,
      handleCityOptionSearch,
      handleClearTypeaheadSearch,
      handleSearch,
    });

    renderWithQueryClient(
      <RecreationSuggestionForm allowEmptySearch={false} />,
    );

    const input = screen.getByRole('combobox');
    await userEvent.type(input, '{enter}');

    expect(handleSearch).not.toHaveBeenCalled();
  });
});
