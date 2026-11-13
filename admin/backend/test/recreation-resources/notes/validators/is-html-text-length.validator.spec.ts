import {
  getHtmlText,
  IsHtmlTextLength,
} from '@/recreation-resources/notes/validators/is-html-text-length.validator';
import { validate } from 'class-validator';
import { describe, expect, it } from 'vitest';

describe('getHtmlText', () => {
  it('returns an empty string for empty input', () => {
    expect(getHtmlText('')).toBe('');
    expect(getHtmlText(undefined as unknown as string)).toBe('');
  });

  it('strips tags', () => {
    expect(getHtmlText('<p>hello</p>')).toBe('hello');
    expect(getHtmlText('<p>a</p><p>b</p>')).toBe('ab');
    expect(getHtmlText('<p>bold <strong>text</strong></p>')).toBe('bold text');
  });

  it('strips attributes along with the tag', () => {
    expect(getHtmlText('<a href="https://example.com">link</a>')).toBe('link');
  });

  it('strips comments', () => {
    expect(getHtmlText('<!-- note -->x')).toBe('x');
  });

  it('decodes the entities the editor emits', () => {
    expect(getHtmlText('&nbsp;')).toBe(' ');
    expect(getHtmlText('&quot;quoted&quot;')).toBe('"quoted"');
    expect(getHtmlText('&#39;')).toBe("'");
    expect(getHtmlText('a &amp; b')).toBe('a & b');
  });

  it('decodes each entity once', () => {
    expect(getHtmlText('&amp;lt;')).toBe('&lt;');
  });

  it('leaves unknown entities alone', () => {
    expect(getHtmlText('&unknown;')).toBe('&unknown;');
    expect(getHtmlText('&')).toBe('&');
    expect(getHtmlText('100 & counting')).toBe('100 & counting');
  });

  it('keeps a bare less-than as text', () => {
    expect(getHtmlText('3 < 5 and 6 > 4')).toBe('3 < 5 and 6 > 4');
  });

  it('drops an unclosed tag', () => {
    expect(getHtmlText('a <b')).toBe('a ');
  });

  it('counts angle brackets the user typed', () => {
    expect(getHtmlText('&lt;b&gt;')).toBe('<b>');
    expect(getHtmlText('&lt;b&gt;').length).toBe(3);
  });

  it('handles list markup', () => {
    expect(getHtmlText('<ul><li>one</li><li>two</li></ul>')).toBe('onetwo');
  });
});

describe('IsHtmlTextLength', () => {
  class Subject {
    @IsHtmlTextLength(1, 10)
    body: unknown;
  }

  const check = async (body: unknown) => {
    const subject = new Subject();
    subject.body = body;
    return validate(subject);
  };

  it('accepts text within the range', async () => {
    expect(await check('<p>hello</p>')).toHaveLength(0);
  });

  it('rejects a non-string', async () => {
    expect(await check(42)).toHaveLength(1);
    expect(await check(undefined)).toHaveLength(1);
    expect(await check(null)).toHaveLength(1);
  });

  it('rejects markup with no text', async () => {
    expect(await check('<p></p>')).toHaveLength(1);
  });

  it('rejects whitespace-only text', async () => {
    expect(await check('<p>&nbsp;</p>')).toHaveLength(1);
  });

  it('rejects text over the maximum', async () => {
    expect(await check('<p>12345678901</p>')).toHaveLength(1);
  });

  it('ignores markup when measuring the maximum', async () => {
    expect(await check('<p><strong><em>hello</em></strong></p>')).toHaveLength(
      0,
    );
  });

  it('counts a trailing space toward the maximum', async () => {
    expect(await check('<p>1234567890 </p>')).toHaveLength(1);
  });

  it('reports the range in the message', async () => {
    const [error] = await check('<p></p>');
    expect(Object.values(error.constraints ?? {})[0]).toBe(
      'body must contain between 1 and 10 characters of text',
    );
  });
});
