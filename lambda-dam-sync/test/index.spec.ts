import { describe, it, expect, vi, beforeEach } from 'vitest';
import { handler } from '../src/index'; // adjust path if your handler file differs

// --- Mock the services ---
vi.mock('../src/service/resource-images.service', () => ({
  ResourceImagesService: vi.fn().mockImplementation(() => ({
    syncImagesCollection: vi.fn(),
  })),
}));

vi.mock('../src/service/resource-docs.service', () => ({
  ResourceDocsService: vi.fn().mockImplementation(() => ({
    syncDocsCollection: vi.fn(),
  })),
}));

// --- Imports after mocks ---
import { ResourceImagesService } from '../src/service/resource-images.service';
import { ResourceDocsService } from '../src/service/resource-docs.service';

describe('Lambda Handler', () => {
  let mockImagesService: any;
  let mockDocsService: any;

  beforeEach(() => {
    vi.clearAllMocks();
    mockImagesService = {
      syncImagesCollection: vi.fn(),
    };
    mockDocsService = {
      syncDocsCollection: vi.fn(),
    };

    (ResourceImagesService as vi.Mock).mockImplementation(
      () => mockImagesService,
    );
    (ResourceDocsService as vi.Mock).mockImplementation(() => mockDocsService);
  });

  it('should call both services and return docsService result', async () => {
    const expectedResponse = {
      statusCode: 200,
      body: JSON.stringify({ message: 'Docs synced successfully' }),
    };
    mockImagesService.syncImagesCollection.mockResolvedValueOnce(undefined);
    mockDocsService.syncDocsCollection.mockResolvedValueOnce(expectedResponse);

    const result = await handler({} as any);

    expect(ResourceImagesService).toHaveBeenCalledTimes(1);
    expect(ResourceDocsService).toHaveBeenCalledTimes(1);
    expect(mockImagesService.syncImagesCollection).toHaveBeenCalledTimes(1);
    expect(mockDocsService.syncDocsCollection).toHaveBeenCalledTimes(1);
    expect(result).toEqual(expectedResponse);
  });

  it('should throw if imagesService.syncImagesCollection fails', async () => {
    mockImagesService.syncImagesCollection.mockRejectedValueOnce(
      new Error('image sync failed'),
    );

    await expect(handler({} as any)).rejects.toThrow('image sync failed');

    expect(mockImagesService.syncImagesCollection).toHaveBeenCalled();
    expect(mockDocsService.syncDocsCollection).not.toHaveBeenCalled();
  });

  it('should throw if docsService.syncDocsCollection fails', async () => {
    mockImagesService.syncImagesCollection.mockResolvedValueOnce(undefined);
    mockDocsService.syncDocsCollection.mockRejectedValueOnce(
      new Error('docs sync failed'),
    );

    await expect(handler({} as any)).rejects.toThrow('docs sync failed');
    expect(mockImagesService.syncImagesCollection).toHaveBeenCalled();
    expect(mockDocsService.syncDocsCollection).toHaveBeenCalled();
  });
});
