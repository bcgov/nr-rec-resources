import { useEffect, useRef } from 'react';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';
import { QUILL_TOOLBAR_OPTIONS } from './constants';

const normalize = (html: string) => {
  // Quill represents an empty input as '<p><br></p>'
  return html === '<p><br></p>' ? '' : html;
};

interface QuillEditorProps {
  value: string;
  onChange: (html: string) => void;
  /**
   * Overrides the default toolbar. Pass a module-level constant - a fresh
   * array on every render would tear down and rebuild the editor.
   */
  toolbarOptions?: unknown[];
}

export const QuillEditor = ({
  value,
  onChange,
  toolbarOptions = QUILL_TOOLBAR_OPTIONS,
}: QuillEditorProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const quillRef = useRef<Quill | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const el = document.createElement('div');
    container.appendChild(el);

    const quill = new Quill(el, {
      theme: 'snow',
      modules: { toolbar: toolbarOptions },
    });

    quillRef.current = quill;

    quill.on('text-change', () => {
      const links = quill.root.querySelectorAll('a');
      links.forEach((a) => {
        if (!/^https?:\/\//i.test(a.href)) {
          a.href = 'https://' + a.getAttribute('href');
        }
      });

      onChange(normalize(quill.root.innerHTML));
    });

    return () => {
      container.innerHTML = '';
      quillRef.current = null;
    };
  }, [onChange, toolbarOptions]);

  useEffect(() => {
    const quill = quillRef.current;
    if (!quill) return;

    const html = quill.root.innerHTML;
    if (value !== html) {
      quill.root.innerHTML = value || '';
    }
  }, [value]);

  return <div className="quill-editor" ref={containerRef} />;
};
