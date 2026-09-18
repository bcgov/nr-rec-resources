import { describe, it, expect, vi, beforeEach } from 'vitest';
import { recResourceAssetsLoader } from '@/services/loaders/recResourceAssetsLoader';
import { recResourceLoader } from '@/services/loaders/recResourceLoader';

// Mock the parent loader dependency
vi.mock('@/services/loaders/recResourceLoader', () => ({
  recResourceLoader: vi.fn(),
}));

describe('recResourceAssetsLoader', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should call recResourceLoader with args and return spread parent data', async () => {
    const mockArgs = {
      request: new Request('https://example.com'),
      params: { id: '123' },
    };
    const mockParentData = {
      recResource: { title: 'Test Resource', items: [1, 2, 3] },
    };

    // Set up mock return value
    vi.mocked(recResourceLoader).mockResolvedValue(mockParentData);

    const result = await recResourceAssetsLoader(mockArgs);

    // Verify recResourceLoader was called with the exact arguments
    expect(recResourceLoader).toHaveBeenCalledWith(mockArgs);
    expect(recResourceLoader).toHaveBeenCalledTimes(1);

    // Verify returned object matches spread data
    expect(result).toEqual(mockParentData);

    // Ensures a shallow copy (new object reference) was created by object spread
    expect(result).not.toBe(mockParentData);
  });
});
