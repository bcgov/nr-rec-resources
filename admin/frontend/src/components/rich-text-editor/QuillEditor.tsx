import { useEffect, useRef } from 'react';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';
import { QUILL_TOOLBAR_OPTIONS } from './constants';

interface QuillEditorProps {
  value: string;
  onChange: (html: string) => void;
}

export const QuillEditor = ({ value, onChange }: QuillEditorProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const quillRef = useRef<Quill | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const el = document.createElement('div');
    container.appendChild(el);

    const quill = new Quill(el, {
      theme: 'snow',
      modules: { toolbar: QUILL_TOOLBAR_OPTIONS },
    });

    quillRef.current = quill;

    quill.on('text-change', () => {
      const links = quill.root.querySelectorAll('a');
      links.forEach((a) => {
        if (!/^https?:\/\//i.test(a.href)) {
          a.href = 'https://' + a.getAttribute('href');
        }
      });

      onChange(quill.root.innerHTML);
    });

    return () => {
      container.innerHTML = '';
      quillRef.current = null;
    };
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    const quill = quillRef.current;
    if (!quill) return;

    const html = quill.root.innerHTML;
    if (value !== html) {
      quill.root.innerHTML = value || '';
    }
  }, [value]);

  return <div ref={containerRef} />;
};
