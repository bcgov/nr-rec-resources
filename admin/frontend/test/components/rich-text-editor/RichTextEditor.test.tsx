import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { RichTextEditor } from '@/components/rich-text-editor/RichTextEditor';

vi.mock('@/components/rich-text-editor/QuillEditor', () => ({
  QuillEditor: (_props: any, ref: any) => (
    <div data-testid="quill-editor" ref={ref} />
  ),
}));

vi.mock('react-hook-form', () => ({
  Controller: ({ render, ...props }: any) =>
    render({ field: { value: props.defaultValue, onChange: vi.fn() } }),
}));

describe('RichTextEditor', () => {
  it('renders label and required asterisk', () => {
    render(
      <RichTextEditor name="test" label="Test Label" control={{}} required />,
    );
    expect(screen.getByText(/Test Label/)).toBeInTheDocument();
    expect(screen.getByText(/\*/)).toBeInTheDocument();
  });

  it('renders error feedback when errors are present', () => {
    render(
      <RichTextEditor
        name="test"
        label="Test Label"
        control={{}}
        errors={{ test: { message: 'Error message' } }}
      />,
    );
    expect(screen.getByText('Error message')).toBeInTheDocument();
  });

  it('renders QuillEditor', () => {
    render(<RichTextEditor name="test" label="Test Label" control={{}} />);
    expect(screen.getByTestId('quill-editor')).toBeInTheDocument();
  });
});
