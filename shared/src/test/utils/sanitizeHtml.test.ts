import { describe, it, expect } from 'vitest';
import { sanitizeHtml } from '@shared/utils/sanitizeHtml';

describe('sanitizeHtml', () => {
  it('should return empty string for falsy input', () => {
    expect(sanitizeHtml('')).toBe('');
    expect(sanitizeHtml(null as unknown as string)).toBe('');
    expect(sanitizeHtml(undefined as unknown as string)).toBe('');
  });

  it('should preserve safe HTML tags', () => {
    const input = '<p>Hello <strong>world</strong></p>';
    expect(sanitizeHtml(input)).toBe('<p>Hello <strong>world</strong></p>');
  });

  it('should preserve lists', () => {
    const input = '<ul><li>Item 1</li><li>Item 2</li></ul>';
    expect(sanitizeHtml(input)).toBe('<ul><li>Item 1</li><li>Item 2</li></ul>');
  });

  it('should strip document-level tags like body and html', () => {
    const input = '<body><p style="color: red">*Please note*</p></body>';
    const result = sanitizeHtml(input);
    expect(result).not.toContain('<body>');
    expect(result).not.toContain('</body>');
    expect(result).toContain('<p>');
    expect(result).toContain('*Please note*');
  });

  it('should strip html tag while preserving content', () => {
    const input = '<html><head></head><body><p>Content</p></body></html>';
    const result = sanitizeHtml(input);
    expect(result).not.toContain('<html>');
    expect(result).not.toContain('<head>');
    expect(result).not.toContain('<body>');
    expect(result).toContain('<p>Content</p>');
  });

  it('should remove script tags completely', () => {
    const input = '<p>Safe</p><script>alert("xss")</script>';
    const result = sanitizeHtml(input);
    expect(result).toBe('<p>Safe</p>');
    expect(result).not.toContain('script');
    expect(result).not.toContain('alert');
  });

  it('should remove iframe tags completely', () => {
    const input = '<p>Safe</p><iframe src="https://evil.com"></iframe>';
    const result = sanitizeHtml(input);
    expect(result).toBe('<p>Safe</p>');
    expect(result).not.toContain('iframe');
  });

  it('should remove object and embed tags', () => {
    const input =
      '<p>Safe</p><object data="evil.swf"></object><embed src="evil.swf">';
    const result = sanitizeHtml(input);
    expect(result).toBe('<p>Safe</p>');
  });

  it('should strip style attributes but keep class', () => {
    const input = '<p style="color: red" class="highlight">Text</p>';
    const result = sanitizeHtml(input);
    expect(result).not.toContain('style=');
    expect(result).toContain('class="highlight"');
  });

  it('should allow href but sanitize javascript: URLs', () => {
    const safe = '<a href="https://example.com">Link</a>';
    expect(sanitizeHtml(safe)).toContain('href="https://example.com"');

    const dangerous = '<a href="javascript:alert(1)">XSS</a>';
    const result = sanitizeHtml(dangerous);
    expect(result).not.toContain('javascript:');
  });

  it('should handle complex legacy HTML', () => {
    const input = `
      <body>
        <p style="color: red">*Please note that the final 3km of the access road is extremely rough*</p>
      </body>
    `;
    const result = sanitizeHtml(input);
    expect(result).not.toContain('<body>');
    expect(result).not.toContain('style=');
    expect(result).toContain('<p>');
    expect(result).toContain('3km');
  });

  it('should preserve table structure', () => {
    const input =
      '<table><thead><tr><th>Header</th></tr></thead><tbody><tr><td>Cell</td></tr></tbody></table>';
    expect(sanitizeHtml(input)).toBe(input);
  });

  it('should remove form elements', () => {
    const input = '<form><input type="text"><button>Submit</button></form>';
    const result = sanitizeHtml(input);
    expect(result).not.toContain('<form');
    expect(result).not.toContain('<input');
    expect(result).not.toContain('<button');
  });
});
