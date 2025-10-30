import {
  buildFileNameWithExtension,
  downloadBlobAsFile,
  downloadUrlAsFile,
  getFileNameWithoutExtension,
} from '@/utils/fileUtils';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Use vi.stubGlobal for URL only
beforeAll(() => {
  vi.stubGlobal('URL', {
    createObjectURL: vi.fn(() => 'blob:http://localhost/fake'),
    revokeObjectURL: vi.fn(),
  });
});
afterAll(() => {
  vi.unstubAllGlobals();
});

// Minimal Node mock for anchor elements in test environment
class MockAnchorElement {
  href = '';
  download = '';
  click = vi.fn();
}

describe('fileUtils', () => {
  describe('getFileNameWithoutExtension', () => {
    it('should remove file extension', () => {
      const file = new File(['test content'], 'example.test.txt');
      const result = getFileNameWithoutExtension(file);
      expect(result).toBe('example.test');
    });
    it('should return full name if there is no extension', () => {
      const file = new File(['test content'], 'filename');
      const result = getFileNameWithoutExtension(file);
      expect(result).toBe('filename');
    });
  });

  describe('downloadBlobAsFile', () => {
    let createObjectURLSpy: any;
    let revokeObjectURLSpy: any;
    let appendChildSpy: ReturnType<typeof vi.fn>;
    let removeChildSpy: ReturnType<typeof vi.fn>;
    let clickSpy: ReturnType<typeof vi.fn>;
    const realCreateElement = document.createElement;

    beforeEach(() => {
      createObjectURLSpy = vi.spyOn(URL, 'createObjectURL');
      revokeObjectURLSpy = vi.spyOn(URL, 'revokeObjectURL');
      clickSpy = vi.fn();
      vi.spyOn(document, 'createElement').mockImplementation((tag) => {
        if (tag === 'a') {
          const anchor = realCreateElement.call(document, 'a');
          anchor.click = clickSpy;
          return anchor;
        }
        return realCreateElement.call(document, tag);
      });
      appendChildSpy = vi.spyOn(document.body as any, 'appendChild') as any;
      removeChildSpy = vi.spyOn(document.body as any, 'removeChild') as any;
    });
    afterEach(() => vi.restoreAllMocks());

    it('should create a link and trigger download', () => {
      const blob = new Blob(['hello world'], { type: 'text/plain' });
      downloadBlobAsFile(blob, 'test.txt');
      expect(createObjectURLSpy).toHaveBeenCalledWith(blob);
      expect(appendChildSpy).toHaveBeenCalled();
      expect(clickSpy).toHaveBeenCalled();
      expect(removeChildSpy).toHaveBeenCalled();
      expect(revokeObjectURLSpy).toHaveBeenCalled();
    });

    it('should handle errors gracefully', () => {
      const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      createObjectURLSpy.mockImplementation(() => {
        throw new Error('Test error');
      });
      const blob = new Blob(['test']);
      downloadBlobAsFile(blob, 'error.txt');
      expect(errorSpy).toHaveBeenCalledWith(
        'Download failed:',
        expect.any(Error),
      );
    });
  });

  describe('downloadUrlAsFile', () => {
    const originalFetch = global.fetch;
    beforeEach(() => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        blob: vi
          .fn()
          .mockResolvedValue(
            new Blob(['fetched content'], { type: 'text/plain' }),
          ),
      }) as unknown as typeof fetch;
      vi.spyOn(document, 'createElement').mockImplementation(
        () => new MockAnchorElement() as unknown as HTMLAnchorElement,
      );
      vi.spyOn(document.body, 'appendChild' as any);
      vi.spyOn(document.body, 'removeChild' as any);
      vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});
    });
    afterEach(() => {
      global.fetch = originalFetch;
      vi.restoreAllMocks();
    });
    it('should fetch the URL and download the file', async () => {
      await downloadUrlAsFile('https://example.com/test.txt', 'fetched.txt');
      expect(global.fetch).toHaveBeenCalledWith(
        'https://example.com/test.txt',
        { credentials: 'include' },
      );
    });

    it('should throw error when fetch response is not ok', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
      }) as unknown as typeof fetch;

      await expect(
        downloadUrlAsFile('https://example.com/missing.txt', 'file.txt'),
      ).rejects.toThrow('HTTP 404');

      expect(global.fetch).toHaveBeenCalledWith(
        'https://example.com/missing.txt',
        { credentials: 'include' },
      );
    });

    it('should throw error with correct status code on server error', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
      }) as unknown as typeof fetch;

      await expect(
        downloadUrlAsFile('https://example.com/error.txt', 'file.txt'),
      ).rejects.toThrow('HTTP 500');
    });
  });

  describe('buildFileNameWithExtension', () => {
    it('should add extension to title', () => {
      expect(buildFileNameWithExtension('document', 'pdf')).toBe(
        'document.pdf',
      );
      expect(buildFileNameWithExtension('report', 'docx')).toBe('report.docx');
    });

    it('should not duplicate extension if title already has it', () => {
      expect(buildFileNameWithExtension('document.pdf', 'pdf')).toBe(
        'document.pdf',
      );
    });

    it('should normalize uppercase extensions to lowercase', () => {
      expect(buildFileNameWithExtension('file.PDF', 'pdf')).toBe('file.pdf');
      expect(buildFileNameWithExtension('Document.DOCX', 'docx')).toBe(
        'Document.docx',
      );
    });

    it('should handle filenames with multiple dots correctly', () => {
      expect(buildFileNameWithExtension('my.file.name.PDF', 'pdf')).toBe(
        'my.file.name.pdf',
      );
      expect(
        buildFileNameWithExtension('archive.2024.backup.tar.gz', 'gz'),
      ).toBe('archive.2024.backup.tar.gz');
      expect(buildFileNameWithExtension('test.v2.document', 'pdf')).toBe(
        'test.v2.document.pdf',
      );
    });
  });
});
