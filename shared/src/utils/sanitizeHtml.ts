import DOMPurify from 'dompurify';

/**
 * Allowed HTML tags for rich text content.
 * Explicitly excludes document-level tags (html, head, body),
 * scripting tags (script, iframe, object, embed), and form elements.
 */
const ALLOWED_TAGS = [
  // Text formatting
  'br',
  'b',
  'i',
  'u',
  'strong',
  'em',
  'p',
  's',
  'strike',
  // Headings
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  // Lists
  'ul',
  'ol',
  'li',
  // Structure
  'div',
  'span',
  'blockquote',
  'hr',
  // Links
  'a',
  // Tables (useful for legacy data)
  'table',
  'thead',
  'tbody',
  'tfoot',
  'tr',
  'th',
  'td',
];

/**
 * Allowed HTML attributes.
 * href is allowed but sanitized by DOMPurify to prevent javascript: URIs.
 */
const ALLOWED_ATTR = [
  'href',
  'target',
  'rel',
  'title',
  'class',
  'id',
  // Table attributes
  'colspan',
  'rowspan',
];

/**
 * Sanitizes HTML content using DOMPurify.
 * Removes dangerous elements like scripts, iframes, and document-level tags.
 * Preserves safe formatting elements for rich text display.
 *
 * @param dirty - The potentially unsafe HTML string
 * @returns A sanitized HTML string safe for rendering
 *
 * @example
 * // Removes body tags and preserves content
 * sanitizeHtml('<body><p style="color: red">Hello</p></body>')
 * // Returns: '<p>Hello</p>'
 *
 * @example
 * // Removes iframes completely
 * sanitizeHtml('<p>Text</p><iframe src="evil.com"></iframe>')
 * // Returns: '<p>Text</p>'
 */
export const sanitizeHtml = (dirty: string): string => {
  if (!dirty) return '';

  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    ALLOW_DATA_ATTR: false,
    // Ensure links open safely
    ADD_ATTR: ['target'],
  });
};
