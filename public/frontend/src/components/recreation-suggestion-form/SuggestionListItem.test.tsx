import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { SuggestionListItem } from './SuggestionListItem';

const TestIcon = () => <svg data-testid="test-icon" />;

describe('SuggestionListItem', () => {
  const defaultProps = {
    searchTerm: 'lake',
    icon: <TestIcon />,
    title: 'Golden Lake Trail',
    resourceType: 'Recreation Trail',
    community: 'Whistler',
  };

  it('renders icon, title, resource type, and community', () => {
    render(<SuggestionListItem {...defaultProps} />);

    expect(screen.getByTestId('test-icon')).toBeInTheDocument();

    // Check lowercase rendering
    const title = screen.getAllByText(
      (_, el) => el?.textContent === 'golden lake trail',
    );
    expect(title.length).toBeGreaterThanOrEqual(2); // mobile + desktop

    const resourceText = screen.getByText(/recreation trail/i);
    const communityText = screen.getByText('whistler');

    expect(resourceText).toBeInTheDocument();
    expect(communityText).toBeInTheDocument();
  });

  it('highlights search term in both mobile and desktop versions', () => {
    render(<SuggestionListItem {...defaultProps} />);

    const highlights = screen.getAllByText(/lake/i);
    expect(highlights.length).toBeGreaterThanOrEqual(2); // mobile + desktop
    highlights.forEach((el) => {
      expect(el.tagName.toLowerCase()).toBe('mark');
    });
  });

  it('renders different text regions for desktop and mobile', () => {
    render(<SuggestionListItem {...defaultProps} />);

    const allCityText = screen.getAllByText(
      (_text, el) => el?.textContent === 'golden lake trail',
    );
    expect(allCityText.length).toBeGreaterThanOrEqual(2);
  });

  it('converts title and community to lowercase', () => {
    render(
      <SuggestionListItem
        {...defaultProps}
        title="UPPER RIVER"
        community="SQUAMISH"
        searchTerm="river"
      />,
    );

    const titleElements = screen.getAllByText((_content, element) => {
      return element?.textContent?.toLowerCase() === 'upper river';
    });
    expect(titleElements.length).toBeGreaterThanOrEqual(2);

    expect(screen.getByText('squamish')).toBeInTheDocument();
  });
});
