import { vi } from 'vitest';
import type { Mock } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { act } from 'react-dom/test-utils';
import RecreationSuggestionForm from '@/components/recreation-suggestion-form/RecreationSuggestionForm';
import { useSearchInput } from '@/components/recreation-suggestion-form/hooks/useSearchInput';
import { useCurrentLocation } from '@/components/recreation-suggestion-form/hooks/useCurrentLocation';
import { renderWithQueryClient } from '@/test-utils';
import { trackEvent, trackClickEvent } from '@/utils/matomo';

vi.mock('@/components/recreation-suggestion-form/hooks/useSearchInput', () => ({
  useSearchInput: vi.fn(),
}));

vi.mock(
  '@/components/recreation-suggestion-form/hooks/useCurrentLocation',
  () => ({
    useCurrentLocation: vi.fn(),
  }),
);

vi.mock('@/utils/matomo', () => ({
  trackEvent: vi.fn(() => vi.fn()),
  trackClickEvent: vi.fn(() => vi.fn()),
}));

const mockedUseSearchInput = useSearchInput as Mock;
const mockedUseCurrentLocation = useCurrentLocation as Mock;

describe('RecreationSuggestionForm', () => {
  const handleSearch = vi.fn();
  const setSearchInputValue = vi.fn();
  const handleClearTypeaheadSearch = vi.fn();
  const handleCityOptionSearch = vi.fn();
  const getLocation = vi.fn();

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
      getLocation,
      permissionDeniedCount: 0,
    });
  });

  it('does not call handleSearch if input is empty and allowEmptySearch is false', () => {
    renderWithQueryClient(
      <RecreationSuggestionForm allowEmptySearch={false} />,
    );

    fireEvent.click(screen.getByRole('button', { name: /search/i }));

    expect(handleSearch).not.toHaveBeenCalled();
  });

  it('calls handleSearch if input is empty but allowEmptySearch is true', () => {
    renderWithQueryClient(<RecreationSuggestionForm allowEmptySearch={true} />);

    fireEvent.click(screen.getByRole('button', { name: /search/i }));

    expect(handleSearch).toHaveBeenCalledWith('');
    expect(trackClickEvent).toHaveBeenCalledWith({
      category: 'Recreation Resource search',
      name: 'Search button clicked',
    });
  });

  it('shows NotificationToast when location permission is denied', () => {
    mockedUseCurrentLocation.mockReturnValue({
      getLocation,
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

    await act(async () => {
      await userEvent.type(input, 'trail{enter}');
    });

    expect(handleSearch).toHaveBeenCalledWith('trail');
    expect(trackEvent).toHaveBeenCalledWith({
      category: 'Recreation Resource search',
      action: 'Search input key down',
      name: 'Enter',
    });
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

    await act(async () => {
      await userEvent.type(input, '{enter}');
    });

    expect(handleSearch).not.toHaveBeenCalled();
    expect(trackEvent).toHaveBeenCalledWith({
      category: 'Recreation Resource search',
      action: 'Search input key down',
      name: 'Enter',
    });
  });

  it('calls trackClickEvent on search button click with valid input', () => {
    mockedUseSearchInput.mockReturnValue({
      defaultSearchInputValue: '',
      searchInputValue: 'camping',
      setSearchInputValue,
      handleCityOptionSearch,
      handleClearTypeaheadSearch,
      handleSearch,
    });

    renderWithQueryClient(<RecreationSuggestionForm allowEmptySearch={true} />);

    fireEvent.click(screen.getByRole('button', { name: /search/i }));

    expect(handleSearch).toHaveBeenCalled();
    expect(trackClickEvent).toHaveBeenCalledWith({
      category: 'Recreation Resource search',
      name: 'Search button clicked',
    });
  });

  it('calls trackEvent on every key press in the input field', async () => {
    mockedUseSearchInput.mockReturnValue({
      defaultSearchInputValue: '',
      searchInputValue: 'lake',
      setSearchInputValue,
      handleCityOptionSearch,
      handleClearTypeaheadSearch,
      handleSearch,
    });

    renderWithQueryClient(<RecreationSuggestionForm allowEmptySearch={true} />);

    const input = screen.getByRole('combobox');

    await act(async () => {
      await userEvent.type(input, 'lake{enter}');
    });

    expect(trackEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        category: 'Recreation Resource search',
        action: 'Search input key down',
        name: 'Enter',
      }),
    );
  });
});
