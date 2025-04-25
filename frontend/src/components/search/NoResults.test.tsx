import { vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import NoResults from 'src/components/search/NoResults';
import { MemoryRouter, useSearchParams } from 'react-router-dom';

vi.mock('react-router-dom', async () => {
  const originalModule = await vi.importActual('react-router-dom');
  return {
    ...originalModule,
    useSearchParams: vi.fn(),
  };
});

it('clears the search parameters when the "Go back to the full list" button is clicked', () => {
  const mockSetSearchParams = vi.fn();
  const mockUseSearchParams = useSearchParams as any;

  mockUseSearchParams.mockReturnValue([
    new URLSearchParams(),
    mockSetSearchParams,
  ]);

  render(
    <MemoryRouter initialEntries={['/search?filter=test']}>
      <NoResults />
    </MemoryRouter>,
  );

  const clearButton = screen.getByText('Go back to the full list');
  fireEvent.click(clearButton);

  expect(mockSetSearchParams).toHaveBeenCalledWith(expect.any(Function));

  const setParamsFunction = mockSetSearchParams.mock.calls[0][0];
  const newParams = setParamsFunction(new URLSearchParams());

  expect(newParams).toEqual(new URLSearchParams());
});
