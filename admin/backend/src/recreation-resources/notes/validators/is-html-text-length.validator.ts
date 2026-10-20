import { registerDecorator, ValidationOptions } from 'class-validator';

/** The entities the editor emits. */
const ENTITIES: Record<string, string> = {
  nbsp: ' ',
  lt: '<',
  gt: '>',
  quot: '"',
  '#39': "'",
  amp: '&',
};

const MAX_ENTITY_NAME_LENGTH = 10;

/** A '<' only opens a tag when a name, closer or declaration follows it. */
function startsTag(html: string, index: number): boolean {
  const next = html[index + 1];
  return (
    next !== undefined &&
    (/[A-Za-z]/.test(next) || next === '/' || next === '!')
  );
}

/**
 * Plain text of an HTML fragment, for measuring what the user typed. Mirrors
 * getPlainText in the admin frontend's rich text editor; the two need to stay
 * in step.
 *
 * The result is text, not markup. It can legitimately contain '<' or '>' when
 * the user typed them, so never render it as HTML.
 */
export function getHtmlText(html: string): string {
  if (!html) return '';

  let text = '';
  let i = 0;

  while (i < html.length) {
    const char = html[i];

    if (char === '<' && startsTag(html, i)) {
      const end = html.indexOf('>', i);
      // An unclosed tag swallows the rest, the same way a parser would
      if (end === -1) break;
      i = end + 1;
      continue;
    }

    if (char === '&') {
      const semicolon = html.indexOf(';', i + 1);
      if (semicolon !== -1 && semicolon - i <= MAX_ENTITY_NAME_LENGTH) {
        const decoded = ENTITIES[html.slice(i + 1, semicolon)];
        if (decoded !== undefined) {
          text += decoded;
          i = semicolon + 1;
          continue;
        }
      }
    }

    text += char;
    i++;
  }

  return text;
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
