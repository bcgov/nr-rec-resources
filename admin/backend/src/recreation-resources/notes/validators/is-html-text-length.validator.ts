import { registerDecorator, ValidationOptions } from 'class-validator';

/**
 * Strips tags and decodes the entities the editor emits, so length limits apply
 * to what the user typed. Mirrors getPlainText in the admin frontend's rich
 * text editor; the two need to stay in step.
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
          // Trimmed lower bound so blank paragraphs fail, untrimmed upper
          // bound so trailing space still counts.
          return text.trim().length >= min && text.length <= max;
        },
        defaultMessage() {
          return `${propertyName} must contain between ${min} and ${max} characters of text`;
        },
      },
    });
  };
}
