import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { SuggestionListCity } from './SuggestionListCity';
import { CURRENT_LOCATION_TITLE } from '@/components/recreation-suggestion-form/constants';

describe('SuggestionListCity', () => {
  it('renders city name and highlights search term', () => {
    render(<SuggestionListCity city="Vancouver" searchTerm="couv" />);

    const highlightedMarks = screen.getAllByText(/couv/i);
    expect(highlightedMarks.length).toBeGreaterThan(0);

    for (const el of highlightedMarks) {
      expect(el.tagName.toLowerCase()).toBe('mark');
    }

    const city = screen.getByText((_content, element) => {
      return element?.textContent === 'Vancouver';
    });
    expect(city).toBeInTheDocument();
  });

  it('shows LOCATION_ICON and "Community" description for regular city', () => {
    render(<SuggestionListCity city="Victoria" searchTerm="vic" />);

    const icon = screen.getByAltText(/location icon/i);
    const description = screen.getByText(/community/i);

    expect(icon).toBeInTheDocument();
    expect(description).toBeInTheDocument();
  });

  it('shows CURRENT_LOCATION_ICON and "Find whats around you" for current location', () => {
    render(
      <SuggestionListCity city={CURRENT_LOCATION_TITLE} searchTerm="Current" />,
    );

    const icon = screen.getByAltText(/current location icon/i);
    const description = screen.getByText(/find what's around you/i);

    expect(icon).toBeInTheDocument();
    expect(description).toBeInTheDocument();
  });

  it('renders the city name', () => {
    render(<SuggestionListCity city="Vancouver" searchTerm="couv" />);

    const city = screen.getByText((_content, element) => {
      return element?.textContent === 'Vancouver';
    });
    expect(city).toBeInTheDocument();
  });
});
