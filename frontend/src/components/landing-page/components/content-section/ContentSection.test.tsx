import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import {
  ContentSection,
  SectionHeading,
} from '@/components/landing-page/components';

describe('ContentSection', () => {
  const defaultProps = {
    headingComponent: <h1>Test Heading</h1>,
    content: <p>Test content</p>,
    image: '/test-image.jpg',
    imageAlt: 'Test image alt text',
  };

  it('renders the component with default props', () => {
    render(<ContentSection {...defaultProps} />);

    expect(screen.getByText('Test Heading')).toBeInTheDocument();
    expect(screen.getByText('Test content')).toBeInTheDocument();
    expect(screen.getByAltText('Test image alt text')).toHaveAttribute(
      'src',
      '/test-image.jpg',
    );
  });

  it('renders with image with correct dimensions first when imageFirst prop is true', () => {
    render(<ContentSection {...defaultProps} imageFirst={true} />);

    const image = screen.getByAltText('Test image alt text');
    expect(image).toHaveAttribute('width', '500');
    expect(image).toHaveAttribute('height', '300');

    const imageColumn = image.closest('.order-md-1');
    const contentColumn = screen
      .getByText('Test content')
      .closest('.order-md-2');

    expect(imageColumn).toBeInTheDocument();
    expect(contentColumn).toBeInTheDocument();
  });

  it('renders with content first when imageFirst prop is false', () => {
    render(<ContentSection {...defaultProps} imageFirst={false} />);

    const imageColumn = screen
      .getByAltText('Test image alt text')
      .closest('.order-md-2');
    const contentColumn = screen
      .getByText('Test content')
      .closest('.order-md-1');

    expect(imageColumn).toBeInTheDocument();
    expect(contentColumn).toBeInTheDocument();
  });

  it('renders with h2 heading when headingAs prop is "h2"', () => {
    render(
      <ContentSection
        {...defaultProps}
        headingComponent={<h2>Test Heading - h2</h2>}
      />,
    );

    const heading = screen.getByText('Test Heading - h2');
    expect(heading.tagName).toBe('H2');
  });

  it('renders with SectionHeading when headingAs prop is "SectionHeading"', () => {
    render(
      <ContentSection
        {...defaultProps}
        headingComponent={
          <SectionHeading>Test Heading - section heading</SectionHeading>
        }
      />,
    );

    const heading = screen.getByText('Test Heading - section heading');
    expect(heading.closest('.section-heading')).toBeInTheDocument();
  });

  it('renders the image as fluid and rounded', () => {
    render(<ContentSection {...defaultProps} />);

    const image = screen.getByAltText('Test image alt text');
    expect(image).toHaveClass('img-fluid');
    expect(image).toHaveClass('rounded');
  });

  it('renders within a container', () => {
    render(<ContentSection {...defaultProps} />);

    expect(
      screen.getByText('Test Heading').closest('.container'),
    ).toBeInTheDocument();
  });
});
