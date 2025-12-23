import { vi } from 'vitest';
import type { Mock } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { act } from 'react-dom/test-utils';
import { renderWithQueryClient } from '@/test-utils';
import { trackClickEvent } from '@shared/utils';
import { useSearchCitiesApi } from '@/components/recreation-suggestion-form/hooks/useSearchCitiesApi';
import { useSearchInput } from '@/components/recreation-suggestion-form/hooks/useSearchInput';
import { useCurrentLocation } from '@/components/recreation-suggestion-form/hooks/useCurrentLocation';
import RecreationSuggestionForm from '@/components/recreation-suggestion-form/RecreationSuggestionForm';
import { useSearch } from '@tanstack/react-router';

vi.mock('@/components/recreation-suggestion-form/hooks/useSearchInput');
vi.mock('@/components/recreation-suggestion-form/hooks/useCurrentLocation');
vi.mock('@shared/utils', () => ({
  trackClickEvent: vi.fn(() => vi.fn()),
}));

vi.mock('@/components/recreation-suggestion-form/constants', () => ({
  CURRENT_LOCATION_TITLE: 'Use my current location',
  MAX_LOCATION_OPTIONS: 5,
  OPTION_TYPE: {
    CURRENT_LOCATION: 'CURRENT_LOCATION',
    RECREATION_RESOURCE: 'RECREATION_RESOURCE',
    CITY: 'CITY',
  },
  SEARCH_PLACEHOLDER: 'Search for recreation sites and trails',
}));

const mockNavigate = vi.fn();

vi.mock('@tanstack/react-router', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('@tanstack/react-router')>();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useSearch: vi.fn(() => ({})),
  };
});

vi.mock('@/constants/routes', () => ({
  ROUTE_PATHS: {
    REC_RESOURCE: '/recreation-resource/$id',
  },
}));

vi.mock('@/service/queries/recreation-resource', () => ({
  useRecreationSuggestions: vi.fn(() => ({
    data: [],
    error: null,
    isFetching: false,
  })),
}));

vi.mock(
  '@/components/recreation-suggestion-form/hooks/useSearchCitiesApi',
  () => ({
    useSearchCitiesApi: vi.fn(() => ({
      data: [],
    })),
  }),
);

vi.mock('@/components/recreation-suggestion-form/SuggestionMenu', () => ({
  SuggestionMenu: () => <div data-testid="suggestion-menu">Menu</div>,
}));

vi.mock('@/components/notifications/NotificationToast', () => ({
  __esModule: true,
  default: ({ isOpen, title }: any) =>
    isOpen ? <div data-testid="notification-toast">{title}</div> : null,
}));

vi.mock('@shared/components/suggestion-typeahead/SuggestionTypeahead', () => ({
  SuggestionTypeahead: ({ onChange, selected, ...props }: any) => {
    (window as any).testOnChangeHandler = onChange;
    (window as any).testSelectedValue = selected;
    return (
      <div data-testid="suggestion-typeahead">
        <input {...props} />
      </div>
    );
  },
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
    vi.mocked(useSearch).mockReturnValue({});

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
      <RecreationSuggestionForm
        allowEmptySearch={false}
        trackingSource="Test"
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: /search/i }));

    expect(handleSearch).not.toHaveBeenCalled();
  });

  it('calls handleSearch if input is empty but allowEmptySearch is true', () => {
    renderWithQueryClient(
      <RecreationSuggestionForm
        allowEmptySearch={true}
        trackingSource="Test page"
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: /search/i }));

    expect(handleSearch).toHaveBeenCalledWith('');
    expect(trackClickEvent).toHaveBeenCalledWith({
      category: 'Search',
      action: 'Search_list_enter',
      name: '',
    });
  });

  it('shows NotificationToast when location permission is denied', () => {
    mockedUseCurrentLocation.mockReturnValue({
      getLocation,
      permissionDeniedCount: 2,
    });

    renderWithQueryClient(<RecreationSuggestionForm trackingSource="Test" />);

    expect(
      screen.getByText(/Location permission blocked/i),
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
      <RecreationSuggestionForm
        allowEmptySearch={false}
        trackingSource="Test page"
      />,
    );

    const input = screen.getByRole('textbox');

    await act(async () => {
      await userEvent.type(input, 'trail{enter}');
    });

    expect(handleSearch).toHaveBeenCalledWith('trail');
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
      <RecreationSuggestionForm
        allowEmptySearch={false}
        trackingSource="Test page"
      />,
    );

    const input = screen.getByRole('textbox');

    await act(async () => {
      await userEvent.type(input, '{enter}');
    });

    expect(handleSearch).not.toHaveBeenCalled();
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

    renderWithQueryClient(
      <RecreationSuggestionForm
        allowEmptySearch={true}
        trackingSource="Test page"
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: /search/i }));

    expect(handleSearch).toHaveBeenCalled();
    expect(trackClickEvent).toHaveBeenCalledWith({
      category: 'Search',
      action: 'Search_list_enter',
      name: 'camping',
    });
  });

  it('does not track key presses in the input field anymore', async () => {
    mockedUseSearchInput.mockReturnValue({
      defaultSearchInputValue: '',
      searchInputValue: 'lake',
      setSearchInputValue,
      handleCityOptionSearch,
      handleClearTypeaheadSearch,
      handleSearch,
    });

    renderWithQueryClient(
      <RecreationSuggestionForm
        allowEmptySearch={true}
        trackingSource="Test page"
      />,
    );

    const input = screen.getByRole('textbox');

    await act(async () => {
      await userEvent.type(input, 'lake{enter}');
    });

    expect(handleSearch).toHaveBeenCalledWith('lake');
  });

  it('tracks current location selection and calls getLocation', async () => {
    getLocation.mockResolvedValue({ latitude: -37.8136, longitude: 144.9631 });

    renderWithQueryClient(
      <RecreationSuggestionForm allowEmptySearch trackingSource="Test page" />,
    );

    const handleSuggestionChange = (window as any).testOnChangeHandler;

    await act(async () => {
      await handleSuggestionChange({
        option_type: 'CURRENT_LOCATION',
        id: 0,
        name: 'Use my current location',
        latitude: undefined,
        longitude: undefined,
        rank: 0,
      });
    });

    expect(getLocation).toHaveBeenCalled();
    expect(handleCityOptionSearch).toHaveBeenCalledWith({
      id: 0,
      name: 'Use my current location',
      latitude: -37.8136,
      longitude: 144.9631,
      rank: 0,
      option_type: 'CURRENT_LOCATION',
    });
    expect(trackClickEvent).toHaveBeenCalledWith({
      category: 'Search',
      action: 'Search_list_selected',
      name: 'Use my current location',
    });
  });

  it('handles current location failure gracefully', async () => {
    getLocation.mockRejectedValue(new Error('Location not available'));
    const consoleWarnSpy = vi
      .spyOn(console, 'warn')
      .mockImplementation(() => {});

    renderWithQueryClient(
      <RecreationSuggestionForm allowEmptySearch trackingSource="Test page" />,
    );

    const handleSuggestionChange = (window as any).testOnChangeHandler;

    await act(async () => {
      await handleSuggestionChange({
        option_type: 'CURRENT_LOCATION',
        id: 0,
        name: 'Use my current location',
        latitude: undefined,
        longitude: undefined,
        rank: 0,
      });
    });

    expect(consoleWarnSpy).toHaveBeenCalledWith(
      'Failed to get current location:',
      expect.any(Error),
    );
    expect(handleCityOptionSearch).not.toHaveBeenCalled();
    expect(trackClickEvent).not.toHaveBeenCalled();

    consoleWarnSpy.mockRestore();
  });

  it('handles current location with null coordinates', async () => {
    getLocation.mockResolvedValue({ latitude: null, longitude: null });
    const consoleWarnSpy = vi
      .spyOn(console, 'warn')
      .mockImplementation(() => {});

    renderWithQueryClient(
      <RecreationSuggestionForm allowEmptySearch trackingSource="Test page" />,
    );

    const handleSuggestionChange = (window as any).testOnChangeHandler;

    await act(async () => {
      await handleSuggestionChange({
        option_type: 'CURRENT_LOCATION',
        id: 0,
        name: 'Use my current location',
        latitude: undefined,
        longitude: undefined,
        rank: 0,
      });
    });

    expect(consoleWarnSpy).toHaveBeenCalledWith(
      'Current location not available',
    );
    expect(handleCityOptionSearch).not.toHaveBeenCalled();
    expect(trackClickEvent).not.toHaveBeenCalled();

    consoleWarnSpy.mockRestore();
  });

  it('tracks recreation resource selection and navigates', async () => {
    renderWithQueryClient(
      <RecreationSuggestionForm allowEmptySearch trackingSource="Test page" />,
    );

    const handleSuggestionChange = (window as any).testOnChangeHandler;

    await act(async () => {
      handleSuggestionChange({
        option_type: 'RECREATION_RESOURCE',
        name: 'Test Resource',
        rec_resource_id: '456',
      });
    });

    expect(trackClickEvent).toHaveBeenCalledWith({
      category: 'Search',
      action: 'Search_list_selected',
      name: 'Test Resource',
    });
    expect(mockNavigate).toHaveBeenCalledWith({
      params: {
        id: '456',
      },
      to: '/recreation-resource/$id',
    });
  });

  it('handles recreation resource selection with disabled navigation', async () => {
    renderWithQueryClient(
      <RecreationSuggestionForm
        allowEmptySearch
        trackingSource="Test page"
        disableNavigation={true}
      />,
    );

    const handleSuggestionChange = (window as any).testOnChangeHandler;

    await act(async () => {
      handleSuggestionChange({
        option_type: 'RECREATION_RESOURCE',
        name: 'Test Resource',
        rec_resource_id: '456',
      });
    });

    expect(handleSearch).toHaveBeenCalledWith('Test Resource');
    expect(mockNavigate).not.toHaveBeenCalled();
    expect(trackClickEvent).toHaveBeenCalledWith({
      category: 'Search',
      action: 'Search_list_selected',
      name: 'Test Resource',
    });
  });

  it('tracks city selection', async () => {
    renderWithQueryClient(
      <RecreationSuggestionForm allowEmptySearch trackingSource="Test page" />,
    );

    const handleSuggestionChange = (window as any).testOnChangeHandler;

    await act(async () => {
      handleSuggestionChange({
        option_type: 'CITY',
        name: 'Victoria',
        id: 1,
        latitude: -37.8136,
        longitude: 144.9631,
        rank: 1,
      });
    });

    expect(trackClickEvent).toHaveBeenCalledWith({
      category: 'Search',
      action: 'Search_list_selected',
      name: 'Victoria',
    });
    expect(handleCityOptionSearch).toHaveBeenCalledWith({
      option_type: 'CITY',
      name: 'Victoria',
      id: 1,
      latitude: -37.8136,
      longitude: 144.9631,
      rank: 1,
    });
  });

  it('handles unknown suggestion types', async () => {
    const consoleWarnSpy = vi
      .spyOn(console, 'warn')
      .mockImplementation(() => {});

    renderWithQueryClient(
      <RecreationSuggestionForm allowEmptySearch trackingSource="Test page" />,
    );

    const handleSuggestionChange = (window as any).testOnChangeHandler;

    await act(async () => {
      handleSuggestionChange({
        option_type: 'UNKNOWN_TYPE',
        name: 'Unknown',
      });
    });

    expect(consoleWarnSpy).toHaveBeenCalledWith(
      'Unhandled suggestion type:',
      'UNKNOWN_TYPE',
    );

    consoleWarnSpy.mockRestore();
  });

  it('calls handleCityOptionSearch when input matches a city exactly', () => {
    const citiesList = [{ id: 1, name: 'Victoria', option_type: 'CITY' }];

    (useSearchCitiesApi as Mock).mockReturnValue({ data: citiesList });
    mockedUseSearchInput.mockReturnValue({
      defaultSearchInputValue: '',
      searchInputValue: 'Victoria',
      setSearchInputValue,
      handleCityOptionSearch,
      handleClearTypeaheadSearch,
      handleSearch,
    });

    renderWithQueryClient(
      <RecreationSuggestionForm allowEmptySearch trackingSource="Test page" />,
    );

    const input = screen.getByRole('textbox') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'Victoria' } });

    fireEvent.click(screen.getByRole('button', { name: /search/i }));

    expect(handleCityOptionSearch).toHaveBeenCalledWith(citiesList[0]);
    expect(trackClickEvent).toHaveBeenCalledWith({
      category: 'Search',
      action: 'Search_list_enter',
      name: 'Victoria',
    });
    expect(handleSearch).not.toHaveBeenCalled();
  });

  it('sets selectedValue to undefined when no search params are present', () => {
    renderWithQueryClient(
      <RecreationSuggestionForm allowEmptySearch trackingSource="Test page" />,
    );

    expect((window as any).testSelectedValue).toBeUndefined();
  });

  it('sets selectedValue when search params are present and searchInputValue exists', () => {
    vi.mocked(useSearch).mockReturnValue({ filter: 'camping' });

    mockedUseSearchInput.mockReturnValue({
      defaultSearchInputValue: '',
      searchInputValue: 'Test Search',
      setSearchInputValue,
      handleCityOptionSearch,
      handleClearTypeaheadSearch,
      handleSearch,
    });

    renderWithQueryClient(
      <RecreationSuggestionForm allowEmptySearch trackingSource="Test page" />,
    );

    const selectedValue = (window as any).testSelectedValue;
    expect(selectedValue).toEqual([{ name: 'Test Search' }]);
  });

  it('sets selectedValue to undefined when search params are present but searchInputValue is empty', () => {
    vi.mocked(useSearch).mockReturnValue({ community: 'victoria' });

    mockedUseSearchInput.mockReturnValue({
      defaultSearchInputValue: '',
      searchInputValue: '',
      setSearchInputValue,
      handleCityOptionSearch,
      handleClearTypeaheadSearch,
      handleSearch,
    });

    renderWithQueryClient(
      <RecreationSuggestionForm allowEmptySearch trackingSource="Test page" />,
    );

    expect((window as any).testSelectedValue).toBeUndefined();
  });
});
