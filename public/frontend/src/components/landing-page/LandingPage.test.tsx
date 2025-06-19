import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LandingPage } from './LandingPage';

// Mock components
vi.mock(
  '@/components/landing-page/components/recreation-search-banner',
  () => ({
    RecreationSearchBanner: () => <div data-testid="mock-search-banner" />,
  }),
);

vi.mock('@/components/landing-page/components/content-section', () => ({
  ContentSection: ({ heading, sectionContent }: any) => (
    <div data-testid="mock-content-section">
      <h2>{heading}</h2>
      <div data-testid="mock-content-section-content">{sectionContent}</div>
    </div>
  ),
}));

describe('LandingPage', () => {
  it('renders main components', () => {
    render(<LandingPage />);

    expect(screen.getByTestId('mock-search-banner')).toBeInTheDocument();
    const contentSections = screen.getAllByTestId('mock-content-section');
    expect(contentSections).toHaveLength(4);

    const contentSectionContents = screen.getAllByTestId(
      'mock-content-section-content',
    );
    expect(contentSectionContents).toHaveLength(4);

    expect(document.querySelector('.info-banner')).toBeVisible();
  });
});
