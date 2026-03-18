import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SearchSubmitBar } from '@/pages/search/components/SearchSubmitBar';
import { ROUTE_PATHS } from '@/constants/routes';

const mockNavigate = vi.fn();

vi.mock('@tanstack/react-router', async () => {
  const actual = await vi.importActual<object>('@tanstack/react-router');

  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock('@/components/rec-resource-suggestion-form/SuggestionMenu', () => ({
  SuggestionMenu: () => <div data-testid="suggestion-menu" />,
}));

vi.mock('react-bootstrap-typeahead', async () => {
  const React = await vi.importActual<typeof import('react')>('react');

  return {
    ClearButton: ({
      label,
      onClick,
      className,
    }: {
      label: string;
      onClick?: () => void;
      className?: string;
    }) => (
      <button
        type="button"
        aria-label={label}
        className={className}
        onClick={onClick}
      >
        {label}
      </button>
    ),
    AsyncTypeahead: ({
      defaultInputValue,
      onSearch,
      onChange,
      onInputChange,
      options,
      placeholder,
      renderInput,
      renderMenu,
    }: {
      defaultInputValue?: string;
      onSearch: (value: string) => void;
      onChange: (selected: unknown[]) => void;
      onInputChange?: (value: string) => void;
      options: Array<{ rec_resource_id: string; name: string }>;
      placeholder?: string;
      renderInput?: (props: any) => React.ReactNode;
      renderMenu?: (results: unknown[], menuProps: any) => React.ReactNode;
    }) => {
      const [value, setValue] = React.useState(defaultInputValue ?? '');
      const inputRef = React.useRef<HTMLInputElement | null>(null);

      const input = renderInput?.({
        value,
        placeholder,
        inputRef: (node: HTMLInputElement | null) => {
          inputRef.current = node;
        },
        referenceElementRef: () => {},
        onChange: (event: React.ChangeEvent<HTMLInputElement>) => {
          const nextValue = event.target.value;
          setValue(nextValue);
          onInputChange?.(nextValue);
          onSearch(nextValue);
        },
        onKeyDown: vi.fn(),
      });

      return (
        <div>
          {input}
          {renderMenu && options.length > 0 ? (
            <div data-testid="typeahead-menu">
              {renderMenu(options, { id: 'test-menu' })}
            </div>
          ) : null}
          {options.map((option) => (
            <button
              key={option.rec_resource_id}
              type="button"
              onClick={() => onChange([option])}
            >
              {option.name}
            </button>
          ))}
        </div>
      );
    },
  };
});

function renderSearchSubmitBar({
  committedQuery = '',
  inputValue = 'ridge',
  setInputValue = vi.fn(),
  suggestions = [],
  isLoading = false,
  error = null,
  onSubmit = vi.fn(),
}: {
  committedQuery?: string;
  inputValue?: string;
  setInputValue?: (value: string) => void;
  suggestions?: Array<{ rec_resource_id: string; name: string }>;
  isLoading?: boolean;
  error?: Error | null;
  onSubmit?: (value: string) => void;
} = {}) {
  render(
    <SearchSubmitBar
      committedQuery={committedQuery}
      typeahead={{
        inputValue,
        setInputValue,
        suggestions,
        isLoading,
        error,
      }}
      onSubmit={onSubmit}
    />,
  );

  return { setInputValue, onSubmit };
}

describe('SearchSubmitBar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('submits the current query when the form button is clicked', async () => {
    const user = userEvent.setup();
    const { onSubmit } = renderSearchSubmitBar();

    await user.click(screen.getByRole('button', { name: 'Search' }));

    expect(onSubmit).toHaveBeenCalledOnce();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('submits on Enter without navigating to a detail page', async () => {
    const user = userEvent.setup();
    const { onSubmit } = renderSearchSubmitBar();

    await user.type(
      screen.getByPlaceholderText('By name or number'),
      '{enter}',
    );

    expect(onSubmit).toHaveBeenCalledOnce();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('submits the latest typed value on Enter', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    function Wrapper() {
      const [inputValue, setInputValue] = useState('ridge');

      return (
        <SearchSubmitBar
          committedQuery=""
          typeahead={{
            inputValue,
            setInputValue,
            suggestions: [],
            isLoading: false,
            error: null,
          }}
          onSubmit={onSubmit}
        />
      );
    }

    render(<Wrapper />);

    const input = screen.getByPlaceholderText('By name or number');
    await user.clear(input);
    await user.type(input, 'ridge lake{enter}');

    expect(onSubmit).toHaveBeenCalledWith('ridge lake');
  });

  it('quick-opens the selected suggestion detail page', async () => {
    const user = userEvent.setup();

    renderSearchSubmitBar({
      suggestions: [
        {
          rec_resource_id: 'REC123',
          name: 'Ridge Camp',
        },
      ],
    });

    await user.click(screen.getByRole('button', { name: 'Ridge Camp' }));

    expect(mockNavigate).toHaveBeenCalledWith({
      to: ROUTE_PATHS.REC_RESOURCE_PAGE,
      params: { id: 'REC123' },
    });
  });

  it('clears the draft input and suggestion query without submitting', async () => {
    const user = userEvent.setup();
    const { onSubmit, setInputValue } = renderSearchSubmitBar({
      committedQuery: 'camp',
    });

    await user.click(screen.getByRole('button', { name: 'Clear search' }));

    expect(setInputValue).toHaveBeenCalledWith('');
    expect(onSubmit).not.toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});
