import { render, screen } from '@testing-library/react';
import { SectionHeading } from './SectionHeading';

describe('SectionHeading', () => {
  it('renders content as h2 by default', () => {
    render(<SectionHeading>Test Heading</SectionHeading>);
    const heading = screen.getByText('Test Heading');
    expect(heading.tagName).toBe('H2');
    expect(heading).toHaveClass('section-heading');
  });

  it('renders with custom element type when "as" prop is provided', () => {
    render(<SectionHeading as="h1">Custom Heading</SectionHeading>);
    const heading = screen.getByText('Custom Heading');
    expect(heading.tagName).toBe('H1');
    expect(heading).toHaveClass('section-heading');
  });
});
