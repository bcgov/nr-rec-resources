import parse from 'html-react-parser';
import type { ElementType } from 'react';
import { sanitizeHtml } from '@shared/utils/sanitizeHtml';

interface SafeHtmlProps {
  /** The HTML string to sanitize and render */
  html: string;
  /** Optional wrapper element type. Defaults to 'div' */
  as?: ElementType;
  /** Optional className for the wrapper element */
  className?: string;
}

/**
 * Safely renders HTML content by sanitizing it with DOMPurify before parsing.
 * Use this component instead of dangerouslySetInnerHTML or raw html-react-parser.
 *
 * @example
 * <SafeHtml html={description} />
 *
 * @example
 * <SafeHtml html={content} as="p" className="text-muted" />
 */
export const SafeHtml = ({
  html,
  as: Component = 'div',
  className,
}: SafeHtmlProps) => {
  if (!html) return null;

  const sanitized = sanitizeHtml(html);
  if (!sanitized) return null;

  return <Component className={className}>{parse(sanitized)}</Component>;
};
