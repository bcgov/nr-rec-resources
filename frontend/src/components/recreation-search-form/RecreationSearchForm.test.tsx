import { fireEvent, render, screen } from '@testing-library/react';
import { RecreationSearchForm } from './RecreationSearchForm';
import userEvent from '@testing-library/user-event';
import * as SearchHooks from '@/components/recreation-search-form/hooks/useSearchInput';
import { vi } from 'vitest';

import { MemoryRouter } from 'react-router-dom';

const renderWithRouter = (
  component: React.ReactElement,
  initialEntries: string[] = ['/'],
) => {
  return render(
    <MemoryRouter initialEntries={initialEntries}>{component}</MemoryRouter>,
  );
};

describe('RecreationSearchForm', () => {
  const mockHooks = {
    nameInputValue: '',
    setNameInputValue: vi.fn(),
    handleSearch: vi.fn(),
    handleClear: vi.fn(),
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
    expect(screen.getByPlaceholderText('Search by name')).toBeInTheDocument();
    expect(screen.getByText('Search')).toBeInTheDocument();
  });

  it('renders with custom props', async () => {
    setup({ inputValue: 'test' });
    renderWithRouter(
      <RecreationSearchForm
        initialNameInputValue="test"
        buttonText="Find"
        placeholder="Custom placeholder"
        showSearchIcon={true}
      />,
    );

    expect(
      screen.getByPlaceholderText('Custom placeholder'),
    ).toBeInTheDocument();
    expect(screen.getByText('Find')).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toHaveValue('test');
  });

  it('handles user interactions', async () => {
    const { setNameInputValue, handleSearch, handleClear } = setup();
    renderWithRouter(<RecreationSearchForm />);

    // Test input change
    fireEvent.change(screen.getByTestId('search-input'), {
      target: { value: 'test' },
    });
    expect(setNameInputValue).toHaveBeenCalledWith('test');

    // Test search
    await userEvent.click(screen.getByText('Search'));
    expect(handleSearch).toHaveBeenCalled();

    // Test clear
    setup({ inputValue: 'test' });
    renderWithRouter(<RecreationSearchForm />);
    await userEvent.click(screen.getByLabelText('Clear search'));
    expect(handleClear).toHaveBeenCalled();
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
