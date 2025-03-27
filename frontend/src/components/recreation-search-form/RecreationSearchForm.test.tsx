import { fireEvent, render, screen } from '@testing-library/react';
import { RecreationSearchForm } from './RecreationSearchForm';
import userEvent from '@testing-library/user-event';
import * as SearchHooks from './useSearchInput';
import { vi } from 'vitest';

describe('RecreationSearchForm', () => {
  const mockHooks = {
    inputValue: '',
    setInputValue: vi.fn(),
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

  it('renders default form', () => {
    render(<RecreationSearchForm />);
    expect(
      screen.getByPlaceholderText('Search by name or community'),
    ).toBeInTheDocument();
    expect(screen.getByText('Search')).toBeInTheDocument();
  });

  it('renders with custom props', () => {
    setup({ inputValue: 'test' });
    render(
      <RecreationSearchForm
        initialValue="test"
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
    const { setInputValue, handleSearch, handleClear } = setup();
    render(<RecreationSearchForm />);

    // Test input change
    fireEvent.change(screen.getByTestId('search-input'), {
      target: { value: 'test' },
    });
    expect(setInputValue).toHaveBeenCalledWith('test');

    // Test search
    await userEvent.click(screen.getByText('Search'));
    expect(handleSearch).toHaveBeenCalled();

    // Test clear
    setup({ inputValue: 'test' });
    render(<RecreationSearchForm />);
    await userEvent.click(screen.getByLabelText('Clear search'));
    expect(handleClear).toHaveBeenCalled();
  });

  it('handles form submission', async () => {
    const { handleSearch } = setup();
    render(<RecreationSearchForm />);

    const form = screen.getByTestId('search-form');
    fireEvent.submit(form);

    expect(handleSearch).toHaveBeenCalledTimes(1);
  });
});
