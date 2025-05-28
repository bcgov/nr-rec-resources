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
const mockGeolocation = {
  getCurrentPosition: vi.fn(),
};

describe('LocationSearch', () => {
  const setCityInputValue = vi.fn();
  const setSelectedCity = vi.fn();
  const handleCityInputSearch = vi.fn();
  const handleClearCityInput = vi.fn();

  beforeEach(() => {
    // @ts-ignore
    global.navigator.geolocation = mockGeolocation;
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
    mockedUseSearchInput.mockReturnValue({
      cityInputValue: 'V',
      setCityInputValue,
      selectedCity: [],
      setSelectedCity,
      handleCityInputSearch,
      handleClearCityInput,
    });
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

  it('requests and selects current location on user action', async () => {
    const fakeCoords = { latitude: 49.2827, longitude: -123.1207 };

    mockGeolocation.getCurrentPosition.mockImplementationOnce((success) => {
      success({
        coords: fakeCoords,
      });
    });

    renderWithRouter(<LocationSearch />);

    const input = screen.getByLabelText(/near a city/i);
    await userEvent.type(input, 'Vic');

    const option = await within(document.body).findByRole('option', {
      name: /current/i,
    });
    expect(option).toBeVisible();

    await userEvent.click(option);

    expect(mockGeolocation.getCurrentPosition).toHaveBeenCalled();
  });

  it('searches by current location if geolocation is allowed', async () => {
    const fakeCoords = { latitude: 49.2827, longitude: -123.1207 };

    mockGeolocation.getCurrentPosition.mockImplementationOnce((success) => {
      success({
        coords: fakeCoords,
      });
    });

    mockedUseSearchInput.mockReturnValue({
      cityInputValue: '',
      setCityInputValue,
      selectedCity: [],
      setSelectedCity,
      handleCityInputSearch: vi.fn(),
      handleClearCityInput,
    });

    renderWithRouter(<LocationSearch />);

    const input = screen.getByLabelText(/near a city/i);
    await userEvent.type(input, 'Current');

    const option = await within(document.body).findByRole('option', {
      name: /current location/i,
    });
    expect(option).toBeVisible();

    await userEvent.click(option);

    expect(setSelectedCity).toHaveBeenCalledWith([
      {
        cityName: 'Current location',
        id: 0,
        latitude: fakeCoords.latitude,
        longitude: fakeCoords.longitude,
        rank: 0,
      },
    ]);
  });

  it('does not select current location if geolocation is not allowed', async () => {
    mockGeolocation.getCurrentPosition.mockImplementationOnce((_, error) => {
      error({ message: 'Geolocation not allowed' });
    });

    renderWithRouter(<LocationSearch />);

    const input = screen.getByLabelText(/near a city/i);
    await userEvent.type(input, 'Current');

    const option = await within(document.body).findByRole('option', {
      name: /current location/i,
    });
    expect(option).toBeVisible();

    await userEvent.click(option);

    expect(setSelectedCity).not.toHaveBeenCalled();
  });
});
