/** Length limits and counters apply to the text, not the markup around it. */
export const getPlainText = (html: string): string => {
  if (!html) return '';
  const doc = new DOMParser().parseFromString(html, 'text/html');
  // Quill writes a non-breaking space for a deliberate blank.
  return (doc.body.textContent ?? '').replace(/\u00a0/g, ' ');
};

export const getPlainTextLength = (html: string): number =>
  getPlainText(html).length;
