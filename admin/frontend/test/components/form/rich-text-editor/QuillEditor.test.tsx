import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import { QuillEditor } from '@/components/form/rich-text-editor/QuillEditor';

let textChangeCallback: (() => void) | null = null;
let rootHTML: string = '<p>Hello world</p>';
let querySelectorAllMock = vi.fn(() => []);

vi.mock('quill', () => {
  class QuillMock {
    root = {
      get innerHTML(): string {
        return rootHTML;
      },
      set innerHTML(value: string) {
        rootHTML = value;
      },
      querySelectorAll: (...args: Parameters<Element['querySelectorAll']>) =>
        querySelectorAllMock(...args),
    };

    on = vi.fn((event: string, cb: () => void) => {
      if (event === 'text-change') {
        textChangeCallback = cb;
      }
    });
  }

  return {
    default: QuillMock,
  };
});

describe('QuillEditor', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    textChangeCallback = null;
    rootHTML = '<p>Hello world</p>';
    querySelectorAllMock = vi.fn(() => []);
  });

  it('renders the editor container', () => {
    const { container } = render(<QuillEditor value="" onChange={vi.fn()} />);
    expect(container.querySelector('div')).toBeInTheDocument();
  });

  it('calls onChange with HTML content when text changes', () => {
    const onChange = vi.fn();
    render(<QuillEditor value="<p>Hello world</p>" onChange={onChange} />);

    if (textChangeCallback) {
      textChangeCallback();
    }

    expect(onChange).toHaveBeenCalledWith('<p>Hello world</p>');
  });

  it('adds https:// to links without a protocol', () => {
    const onChange = vi.fn();
    const mockLinkElement = {
      href: 'example.com',
      getAttribute: vi.fn(() => 'example.com'),
    };

    render(<QuillEditor value="" onChange={onChange} />);

    querySelectorAllMock.mockReturnValue([mockLinkElement]);

    if (textChangeCallback) {
      textChangeCallback();
    }

    expect(mockLinkElement.href).toBe('https://example.com');
    expect(onChange).toHaveBeenCalled();
  });
});
