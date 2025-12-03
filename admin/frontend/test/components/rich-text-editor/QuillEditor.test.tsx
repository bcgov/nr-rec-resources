import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import { QuillEditor } from '@/components/rich-text-editor/QuillEditor';

let textChangeCallback: (() => void) | null = null;
let rootHTML: string = '<p>Hello world</p>';

vi.mock('quill', () => {
  class QuillMock {
    root = {
      get innerHTML(): string {
        return rootHTML;
      },
      set innerHTML(value: string) {
        rootHTML = value;
      },
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
});
