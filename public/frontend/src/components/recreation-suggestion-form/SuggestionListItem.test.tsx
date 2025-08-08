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

    // Match full text ignoring markup like <mark>
    const title = screen.getByText(
      (_, el) => el?.textContent?.toLowerCase() === 'golden lake trail',
    );
    expect(title).toBeInTheDocument();

    const resourceText = screen.getByText(/recreation trail/i);
    const communityText = screen.getByText('whistler');

    expect(resourceText).toBeInTheDocument();
    expect(communityText).toBeInTheDocument();
  });

  it('highlights the search term', () => {
    render(<SuggestionListItem {...defaultProps} />);

    const highlights = screen.getAllByText(/lake/i);
    expect(highlights.length).toBeGreaterThanOrEqual(1);
    highlights.forEach((el) => {
      expect(el.tagName.toLowerCase()).toBe('mark');
    });
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

    const titleElement = screen.getByText(
      (_, el) => el?.textContent?.toLowerCase() === 'upper river',
    );
    expect(titleElement).toBeInTheDocument();

    expect(screen.getByText('squamish')).toBeInTheDocument();
  });
});
