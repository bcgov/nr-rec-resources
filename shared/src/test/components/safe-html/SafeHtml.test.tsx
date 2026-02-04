import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SafeHtml } from '@shared/components/safe-html';

describe('SafeHtml', () => {
  it('should return null for empty html', () => {
    const { container } = render(<SafeHtml html="" />);
    expect(container).toBeEmptyDOMElement();
  });

  it('should return null for html that sanitizes to empty', () => {
    const { container } = render(<SafeHtml html="<script>alert(1)</script>" />);
    expect(container).toBeEmptyDOMElement();
  });

  it('should render sanitized content in a div by default', () => {
    render(<SafeHtml html="<p>Hello world</p>" />);
    expect(screen.getByText('Hello world')).toBeInTheDocument();
  });

  it('should render with custom element using as prop', () => {
    const { container } = render(
      <SafeHtml html="<strong>Bold text</strong>" as="span" />,
    );
    const span = container.querySelector('span');
    expect(span).toBeInTheDocument();
    expect(span).toHaveTextContent('Bold text');
  });

  it('should apply className to wrapper element', () => {
    const { container } = render(
      <SafeHtml html="<p>Content</p>" className="my-class" />,
    );
    const div = container.querySelector('div.my-class');
    expect(div).toBeInTheDocument();
  });

  it('should strip dangerous tags like body', () => {
    render(
      <SafeHtml html='<body><p style="color: red">Safe content</p></body>' />,
    );
    expect(screen.getByText('Safe content')).toBeInTheDocument();
    expect(document.querySelector('body body')).not.toBeInTheDocument();
  });

  it('should strip iframes', () => {
    const { container } = render(
      <SafeHtml html='<p>Safe</p><iframe src="evil.com"></iframe>' />,
    );
    expect(container.querySelector('iframe')).not.toBeInTheDocument();
    expect(screen.getByText('Safe')).toBeInTheDocument();
  });
});
