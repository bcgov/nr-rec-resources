import { FormLabel } from '@/components/form';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

describe('FormLabel', () => {
  it('should render children as label text', () => {
    render(<FormLabel>Test Label</FormLabel>);

    expect(screen.getByText('Test Label')).toBeInTheDocument();
  });

  it('should render as a form label element', () => {
    render(<FormLabel>Test Label</FormLabel>);

    const label = screen.getByText('Test Label');
    expect(label.tagName).toBe('LABEL');
    expect(label).toHaveClass('form-label');
  });

  it('should show required asterisk when required is true', () => {
    render(<FormLabel required>Test Label</FormLabel>);

    expect(screen.getByText('*')).toBeInTheDocument();
    expect(screen.getByText('*')).toHaveClass('form-label__required');
  });

  it('should not show required asterisk when required is false', () => {
    render(<FormLabel>Test Label</FormLabel>);

    expect(screen.queryByText('*')).not.toBeInTheDocument();
  });

  it('should show public badge when public is true', () => {
    render(<FormLabel public>Test Label</FormLabel>);

    expect(screen.getByText('Public')).toBeInTheDocument();
    expect(screen.getByText('Public')).toHaveClass('form-label__public-badge');
  });

  it('should not show public badge when public is false', () => {
    render(<FormLabel>Test Label</FormLabel>);

    expect(screen.queryByText('Public')).not.toBeInTheDocument();
  });

  it('should show both required asterisk and public badge', () => {
    render(
      <FormLabel required public>
        Test Label
      </FormLabel>,
    );

    expect(screen.getByText('*')).toBeInTheDocument();
    expect(screen.getByText('Public')).toBeInTheDocument();
  });

  it('should render asterisk before public badge', () => {
    render(
      <FormLabel required public>
        Test Label
      </FormLabel>,
    );

    const label = screen.getByText('Test Label').closest('label');
    const asterisk = screen.getByText('*');
    const badge = screen.getByText('Public');

    // Verify order: asterisk appears before badge in DOM
    const children = Array.from(label!.children);
    const asteriskIndex = children.indexOf(asterisk);
    const badgeIndex = children.indexOf(badge);
    expect(asteriskIndex).toBeLessThan(badgeIndex);
  });

  it('should apply custom className', () => {
    render(<FormLabel className="mb-0">Test Label</FormLabel>);

    const label = screen.getByText('Test Label');
    expect(label).toHaveClass('mb-0');
  });

  it('should render complex children like links', () => {
    render(
      <FormLabel required>
        Does this contain{' '}
        <a href="https://example.com">identifiable information?</a>
      </FormLabel>,
    );

    expect(screen.getByText('identifiable information?')).toBeInTheDocument();
    expect(screen.getByRole('link')).toHaveAttribute(
      'href',
      'https://example.com',
    );
    expect(screen.getByText('*')).toBeInTheDocument();
  });
});
