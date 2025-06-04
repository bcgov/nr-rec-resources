import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  MockInstance,
  vi,
} from 'vitest';
import { triggerFileDownload } from './fileUtils';

describe('triggerFileDownload', () => {
  const originalCreateObjectURL = URL.createObjectURL;
  const originalRevokeObjectURL = URL.revokeObjectURL;
  let createElementSpy: MockInstance;
  let appendChildSpy: MockInstance;
  let removeChildSpy: MockInstance;
  let clickSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    // Mock URL.createObjectURL and revokeObjectURL
    URL.createObjectURL = vi.fn(() => 'blob:url');
    URL.revokeObjectURL = vi.fn();

    // Mock document.createElement and DOM manipulation
    clickSpy = vi.fn();
    createElementSpy = vi
      .spyOn(document, 'createElement')
      .mockImplementation(() => {
        return {
          set href(val: string) {},
          set download(val: string) {},
          click: clickSpy,
        } as unknown as HTMLAnchorElement;
      });
    appendChildSpy = vi
      .spyOn(document.body, 'appendChild')
      .mockImplementation((): any => {});
    removeChildSpy = vi
      .spyOn(document.body, 'removeChild')
      .mockImplementation((): any => {});
  });

  afterEach(() => {
    // Restore all mocks
    URL.createObjectURL = originalCreateObjectURL;
    URL.revokeObjectURL = originalRevokeObjectURL;
    createElementSpy.mockRestore();
    appendChildSpy.mockRestore();
    removeChildSpy.mockRestore();
  });

  it('should trigger a file download with correct parameters', () => {
    triggerFileDownload('test-content', 'test.txt', 'text/plain');

    expect(createElementSpy).toHaveBeenCalledWith('a');
    expect(appendChildSpy).toHaveBeenCalled();
    expect(clickSpy).toHaveBeenCalled();
    expect(removeChildSpy).toHaveBeenCalled();
    expect(URL.createObjectURL).toHaveBeenCalled();
    expect(URL.revokeObjectURL).toHaveBeenCalled();
  });

  it('should handle errors gracefully', () => {
    // Force Blob constructor to throw
    const originalBlob = globalThis.Blob;
    globalThis.Blob = vi.fn(() => {
      throw new Error('Blob error');
    }) as any;

    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    triggerFileDownload('bad-content', 'bad.txt', 'text/plain');

    expect(errorSpy).toHaveBeenCalledWith(
      'Download failed:',
      expect.any(Error),
    );

    // Restore Blob and error spy
    globalThis.Blob = originalBlob;
    errorSpy.mockRestore();
  });
});
