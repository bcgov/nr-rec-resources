import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { SuggestionListCommunity } from '@/components/rec-resource-suggestion-form/SuggestionListCommunity';

// Mock static asset import
vi.mock('@shared/assets/icons/location.svg', () => ({
  default: 'mock-location-icon.svg',
}));

// Mock SCSS import
vi.mock(
  '@shared/components/suggestion-typeahead/SuggestionListItem.scss',
  () => ({}),
);

// Mock Highlighter so we can verify props + rendering behavior
vi.mock('react-bootstrap-typeahead', () => ({
  Highlighter: ({
    search,
    children,
  }: {
    search: string;
    children: React.ReactNode;
  }) => (
    <span data-testid="highlighter" data-search={search}>
      {children}
    </span>
  ),
}));

describe('SuggestionListCommunity', () => {
  it('renders the component structure correctly', () => {
    const { container } = render(
      <SuggestionListCommunity community="Whistler" searchTerm="whis" />,
    );

    // Root list item exists
    expect(
      container.querySelector('.suggestion-list-item'),
    ).toBeInTheDocument();

    // Row wrapper exists
    expect(container.querySelector('.suggestion-list-row')).toBeInTheDocument();

    // Columns exist
    expect(container.querySelector('.icon-col')).toBeInTheDocument();
    expect(container.querySelector('.content-col')).toBeInTheDocument();
  });

  it('renders the location icon with correct src and alt text', () => {
    render(<SuggestionListCommunity community="Whistler" searchTerm="whis" />);

    const image = screen.getByAltText('Location icon');

    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', 'mock-location-icon.svg');
  });

  it('renders the icon wrapper with inline styles', () => {
    const { container } = render(
      <SuggestionListCommunity community="Whistler" searchTerm="whis" />,
    );

    const wrapper = container.querySelector('.icon-wrapper');

    expect(wrapper).toBeInTheDocument();
    expect(wrapper).toHaveStyle({
      width: '40px',
      height: '40px',
    });
  });

  it('renders Highlighter with correct search prop and community text', () => {
    render(<SuggestionListCommunity community="Whistler" searchTerm="whis" />);

    const highlighter = screen.getByTestId('highlighter');

    expect(highlighter).toBeInTheDocument();
    expect(highlighter).toHaveAttribute('data-search', 'whis');
    expect(highlighter).toHaveTextContent('Whistler');
  });

  it('renders Community description text', () => {
    render(<SuggestionListCommunity community="Whistler" searchTerm="whis" />);

    expect(screen.getByText('Community')).toBeInTheDocument();
  });

  it('renders correctly with empty searchTerm', () => {
    render(<SuggestionListCommunity community="Vancouver" searchTerm="" />);

    const highlighter = screen.getByTestId('highlighter');

    expect(highlighter).toHaveAttribute('data-search', '');
    expect(highlighter).toHaveTextContent('Vancouver');
  });

  it('renders correctly with empty community name', () => {
    render(<SuggestionListCommunity community="" searchTerm="van" />);

    const highlighter = screen.getByTestId('highlighter');

    expect(highlighter).toHaveAttribute('data-search', 'van');
    expect(highlighter).toHaveTextContent('');
  });
});
