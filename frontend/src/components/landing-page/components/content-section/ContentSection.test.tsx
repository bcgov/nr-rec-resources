import { render, screen } from '@testing-library/react';
import { ContentSection } from './ContentSection';
import { BOOTSTRAP_BREAKPOINTS } from '@/data/breakpoints';
import { IMAGE_SIZES } from '@/components/landing-page/components/content-section/constants';
import { describe, expect, it } from 'vitest';

describe('ContentSection', () => {
  const defaultProps = {
    sectionContent: <p>Test content</p>,
    imageBasePath: '/images/test',
    imageAlt: 'Test image',
    headingComponent: <h2>Test heading</h2>,
  };

  it('renders all required elements', () => {
    render(<ContentSection {...defaultProps} />);
    ['content-column', 'image-column', 'content-image'].forEach((testId) => {
      expect(screen.getByTestId(testId)).toBeInTheDocument();
    });
    ['Test content', 'Test heading'].forEach((text) => {
      expect(screen.getByText(text)).toBeInTheDocument();
    });
  });

  it('handles image positioning', () => {
    render(<ContentSection {...defaultProps} imageFirst={true} />);
    expect(screen.getByTestId('image-column')).toHaveClass('order-lg-1');
    expect(screen.getByTestId('content-column')).toHaveClass('order-lg-2');
  });

  it('configures image attributes correctly', () => {
    render(<ContentSection {...defaultProps} />);
    const image = screen.getByTestId('content-image');

    const expectedSrcSet = Object.entries(BOOTSTRAP_BREAKPOINTS)
      .map(([size, width]) => `/images/test-${size}.webp ${width}w`)
      .join(', ');

    expect(image).toHaveAttribute('srcSet', expectedSrcSet);
    expect(image).toHaveAttribute('sizes', IMAGE_SIZES);
    expect(image).toHaveClass('rounded', 'img-fluid');
  });
});
