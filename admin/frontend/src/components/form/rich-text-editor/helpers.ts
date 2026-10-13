/**
 * The editor stores HTML, but limits and counters should apply to what the
 * user actually typed, so markup doesn't eat the budget.
 */
export const getPlainText = (html: string): string => {
  if (!html) return '';
  const doc = new DOMParser().parseFromString(html, 'text/html');
  // Quill writes a non-breaking space for a deliberate blank, count it as one.
  return (doc.body.textContent ?? '').replace(/\u00a0/g, ' ');
};

export const getPlainTextLength = (html: string): number =>
  getPlainText(html).length;
