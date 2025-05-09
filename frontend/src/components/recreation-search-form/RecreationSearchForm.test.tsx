import { fireEvent, render, screen } from '@testing-library/react';
import { RecreationSearchForm } from './RecreationSearchForm';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '~/@tanstack/react-query';
import * as SearchHooks from '@/components/recreation-search-form/hooks/useSearchInput';
import { vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';

const queryClient = new QueryClient();

const renderWithRouter = (
  component: React.ReactElement,
  initialEntries: string[] = ['/'],
) => {
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={initialEntries}>{component}</MemoryRouter>
    </QueryClientProvider>,
  );
};

describe('RecreationSearchForm', () => {
  const mockHooks = {
    nameInputValue: '',
    setNameInputValue: vi.fn(),
    handleSearch: vi.fn(),
    handleClearNameInput: vi.fn(),
    cityInputValue: '',
    setCityInputValue: vi.fn(),
    selectedCity: undefined,
    setSelectedCity: vi.fn(),
    handleCityInputSearch: vi.fn(),
    handleClearCityInput: vi.fn(),
  };

  const setup = (mockValues = {}) => {
    const hooks = { ...mockHooks, ...mockValues };
    vi.spyOn(SearchHooks, 'useSearchInput').mockReturnValue(hooks);
    return hooks;
  };

  beforeEach(() => {
    vi.clearAllMocks();
    setup();
  });

  afterEach(() => vi.restoreAllMocks());

  it('renders default form', async () => {
    renderWithRouter(<RecreationSearchForm />);
    expect(screen.getByLabelText('Search by name')).toBeInTheDocument();
    expect(screen.getByText('Search')).toBeInTheDocument();
  });

  it('renders with custom props', async () => {
    setup({ nameInputValue: 'test' });
    renderWithRouter(
      <RecreationSearchForm
        buttonText="Find"
        placeholder="Custom placeholder"
      />,
    );

    expect(screen.getByLabelText('Custom placeholder')).toBeInTheDocument();
    expect(screen.getByText('Find')).toBeInTheDocument();
    expect(screen.getByTestId('name-search-input')).toHaveValue('test');
  });

  it('handles user interactions', async () => {
    const { setNameInputValue, handleSearch, handleClearNameInput } = setup();
    renderWithRouter(<RecreationSearchForm />);

    fireEvent.change(screen.getByTestId('name-search-input'), {
      target: { value: 'test' },
    });
    expect(setNameInputValue).toHaveBeenCalledWith('test');

    await userEvent.click(screen.getByText('Search'));
    expect(handleSearch).toHaveBeenCalled();

    setup({ nameInputValue: 'test' });
    renderWithRouter(<RecreationSearchForm />);
    await userEvent.click(screen.getByLabelText('Clear search'));
    expect(handleClearNameInput).toHaveBeenCalled();
  });

  it('handles form submission', async () => {
    const { handleSearch } = setup();
    renderWithRouter(<RecreationSearchForm />);

    const form = screen.getByTestId('search-form');
    fireEvent.submit(form);

    expect(handleSearch).toHaveBeenCalledTimes(1);
  });

  it('clears the search input if no filter search params', async () => {
    const { setNameInputValue } = setup();
    renderWithRouter(<RecreationSearchForm />, ['/search']);

    expect(setNameInputValue).toHaveBeenCalledWith('');
  });

  it('does not clear the search input if filter search params exist', async () => {
    const { setNameInputValue } = setup();
    renderWithRouter(<RecreationSearchForm />, ['/search?filter=test']);

    expect(setNameInputValue).not.toHaveBeenCalled();
  });
});
