import { vi } from 'vitest';
import type { Mock } from 'vitest';
import { screen, fireEvent, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LocationSearch from '@/components/recreation-search-form/location-search/LocationSearch';
import { useSearchInput } from '@/components/recreation-search-form/hooks/useSearchInput';
import { useSearchCitiesApi } from '@/components/recreation-search-form/hooks/useSearchCitiesApi';
import { renderWithRouter } from '@/test-utils';

vi.mock('@/components/recreation-search-form/hooks/useSearchInput', () => ({
  useSearchInput: vi.fn(),
}));

vi.mock('@/components/recreation-search-form/hooks/useSearchCitiesApi', () => ({
  useSearchCitiesApi: vi.fn(),
}));

const mockedUseSearchInput = useSearchInput as Mock;
const mockedUseSearchCitiesApi = useSearchCitiesApi as Mock;

describe('LocationSearch', () => {
  const setCityInputValue = vi.fn();
  const setSelectedCity = vi.fn();
  const handleCityInputSearch = vi.fn();
  const handleClearCityInput = vi.fn();

  beforeEach(() => {
    mockedUseSearchInput.mockReturnValue({
      cityInputValue: '',
      setCityInputValue,
      selectedCity: [],
      setSelectedCity,
      handleCityInputSearch,
      handleClearCityInput,
    });

    mockedUseSearchCitiesApi.mockReturnValue({
      data: [
        { cityName: 'Victoria' },
        { cityName: 'Vancouver' },
        { cityName: 'Kelowna' },
      ],
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders input with label', () => {
    renderWithRouter(<LocationSearch />);
    expect(screen.getByLabelText(/Near a city/i)).toBeInTheDocument();
  });

  it('shows and selects a suggestion', async () => {
    renderWithRouter(<LocationSearch />);

    const input = screen.getByLabelText(/near a city/i);
    await userEvent.type(input, 'Vic');

    const option = await within(document.body).findByRole('option', {
      name: /victoria/i,
    });
    expect(option).toBeVisible();

    await userEvent.click(option);
    expect(setSelectedCity).toHaveBeenCalledWith([{ cityName: 'Victoria' }]);
  });

  it('calls handlers when a city is selected', async () => {
    mockedUseSearchInput.mockReturnValue({
      cityInputValue: 'Vic',
      setCityInputValue,
      selectedCity: [{ cityName: 'Victoria' }],
      setSelectedCity,
      handleCityInputSearch,
      handleClearCityInput,
    });

    renderWithRouter(<LocationSearch />);
    const input = screen.getByLabelText(/Near a city/i);

    fireEvent.change(input, { target: { value: 'Victoria' } });
    fireEvent.blur(input);

    await waitFor(() => {
      expect(setCityInputValue).toHaveBeenCalled();
    });
  });

  it('clears input and selection when clear button is clicked', async () => {
    mockedUseSearchInput.mockReturnValue({
      cityInputValue: 'Victoria',
      setCityInputValue,
      selectedCity: [{ cityName: 'Victoria' }],
      setSelectedCity,
      handleCityInputSearch,
      handleClearCityInput,
    });

    renderWithRouter(<LocationSearch />);
    const clearButton = await screen.findByRole('button', {
      name: /clear search/i,
    });

    await userEvent.click(clearButton);

    expect(setSelectedCity).toHaveBeenCalledWith([]);
    expect(handleClearCityInput).toHaveBeenCalled();
  });

  it('shows error message and retry button when there is an error', async () => {
    mockedUseSearchCitiesApi.mockReturnValue({
      data: [],
      isError: true,
      refetch: vi.fn(),
    });

    renderWithRouter(<LocationSearch />);

    const input = screen.getByLabelText(/Near a city/i);

    fireEvent.change(input, { target: { value: 'Victoria' } });

    expect(screen.getByText(/Failed to load cities./i)).toBeInTheDocument();

    const retryButton = screen.getByRole('button', { name: /retry/i });
    expect(retryButton).toBeInTheDocument();

    await userEvent.click(retryButton);

    expect(mockedUseSearchCitiesApi().refetch).toHaveBeenCalled();
  });
});
