import { registerDecorator, ValidationOptions } from 'class-validator';

/**
 * Strips tags and decodes the handful of entities the editor emits, so a limit
 * applies to what the user typed rather than to the markup around it.
 *
 * Mirrors getPlainText in the admin frontend's rich text editor - keep the two
 * in step or the character counter and this check will disagree.
 */
export function getHtmlText(html: string): string {
  if (!html) return '';

  return html
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&');
}

export function IsHtmlTextLength(
  min: number,
  max: number,
  validationOptions?: ValidationOptions,
) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isHtmlTextLength',
      target: object.constructor,
      propertyName,
      constraints: [min, max],
      options: validationOptions,
      validator: {
        validate(value: unknown) {
          if (typeof value !== 'string') return false;

          const text = getHtmlText(value);
          // Trimmed for the lower bound so a body of only blank paragraphs
          // fails, untrimmed for the upper bound so trailing space still counts.
          return text.trim().length >= min && text.length <= max;
        },
        defaultMessage() {
          return `${propertyName} must contain between ${min} and ${max} characters of text`;
        },
      },
    });
  };
}
