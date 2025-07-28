import { vi } from 'vitest';
import type { Mock } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import RecreationSuggestionForm from '@/components/recreation-suggestion-form/RecreationSuggestionForm';
import { useSearchInput } from '@/components/recreation-suggestion-form/hooks/useSearchInput';
import { useCurrentLocation } from '@/components/recreation-suggestion-form/hooks/useCurrentLocation';
import { renderWithQueryClient } from '@/test-utils';

// Mock the hooks once at the top
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

  beforeEach(() => {
    vi.clearAllMocks();

    // Default mock implementation - can be overridden per test
    mockedUseSearchInput.mockReturnValue({
      inputValue: '',
      setInputValue: vi.fn(),
      handleSearch,
    });

    mockedUseCurrentLocation.mockReturnValue({
      latitude: null,
      longitude: null,
      error: null,
      getLocation: vi.fn(),
      permissionDeniedCount: 0,
    });
  });

  it('calls handleSearch on submit if input is not empty', async () => {
    mockedUseSearchInput.mockReturnValue({
      inputValue: 'some input',
      setInputValue: vi.fn(),
      handleSearch,
    });

    renderWithQueryClient(
      <RecreationSuggestionForm allowEmptySearch={false} />,
    );

    const form = screen.getByTestId('recreation-suggestion-form'); // adjust selector as needed

    await userEvent.type(screen.getByRole('textbox'), 'some input');
    fireEvent.submit(form);

    expect(handleSearch).toHaveBeenCalledTimes(1);
  });

  it('does not call handleSearch on submit if input is empty and allowEmptySearch is false', async () => {
    mockedUseSearchInput.mockReturnValue({
      inputValue: '',
      setInputValue: vi.fn(),
      handleSearch,
    });

    renderWithQueryClient(
      <RecreationSuggestionForm allowEmptySearch={false} />,
    );

    const form = screen.getByTestId('recreation-suggestion-form'); // adjust selector as needed

    fireEvent.submit(form);

    expect(handleSearch).not.toHaveBeenCalled();
  });

  it('shows NotificationToast if permissionDeniedCount > 0', () => {
    mockedUseCurrentLocation.mockReturnValue({
      latitude: null,
      longitude: null,
      error: 'Permission denied',
      getLocation: vi.fn(),
      permissionDeniedCount: 1,
    });

    renderWithQueryClient(
      <RecreationSuggestionForm allowEmptySearch={false} />,
    );

    expect(
      screen.getByText(/Location permission blocked/i),
    ).toBeInTheDocument();
  });

  // Add more tests here...
});
