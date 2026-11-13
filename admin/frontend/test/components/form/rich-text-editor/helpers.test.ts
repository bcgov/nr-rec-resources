import {
  getPlainText,
  getPlainTextLength,
} from '@/components/form/rich-text-editor/helpers';
import { describe, expect, it } from 'vitest';

describe('getPlainText', () => {
  it('returns an empty string for empty input', () => {
    expect(getPlainText('')).toBe('');
    expect(getPlainText(undefined as unknown as string)).toBe('');
  });

  it('strips markup', () => {
    expect(getPlainText('<p>hello</p>')).toBe('hello');
    expect(getPlainText('<p>bold <strong>text</strong></p>')).toBe('bold text');
    expect(getPlainText('<ul><li>one</li><li>two</li></ul>')).toBe('onetwo');
  });

  it('decodes entities', () => {
    expect(getPlainText('<p>a &amp; b</p>')).toBe('a & b');
    expect(getPlainText('<p>&lt;b&gt;</p>')).toBe('<b>');
  });

  it('turns a non-breaking space into a plain space', () => {
    expect(getPlainText('<p>&nbsp;</p>')).toBe(' ');
    expect(getPlainText('<p>a&nbsp;b</p>')).toBe('a b');
  });

  it('keeps text from an empty paragraph out of the count', () => {
    expect(getPlainText('<p></p>')).toBe('');
    expect(getPlainText('<p><br></p>')).toBe('');
  });
});

describe('getPlainTextLength', () => {
  it('measures the text, not the markup', () => {
    expect(getPlainTextLength('<p><strong>hello</strong></p>')).toBe(5);
  });

  it('is zero for markup with no text', () => {
    expect(getPlainTextLength('<p><br></p>')).toBe(0);
  });

  it('is zero for empty input', () => {
    expect(getPlainTextLength('')).toBe(0);
  });

  it('counts a deliberate blank as one character', () => {
    expect(getPlainTextLength('<p>&nbsp;</p>')).toBe(1);
  });
});
