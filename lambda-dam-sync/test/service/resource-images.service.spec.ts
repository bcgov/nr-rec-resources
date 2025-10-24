import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ResourceImagesService } from '../../src/service/resource-images.service';
import { Client } from 'pg';

// --- Mocks ---
vi.mock('../../src/service/db.service', () => ({
  getClient: vi.fn(),
}));

vi.mock('../../src/service/dam-api.service', () => ({
  getCollectionResources: vi.fn(),
  getResourceFieldData: vi.fn(),
  getResourcePath: vi.fn(),
}));

import { getClient } from '../../src/service/db.service';
import {
  getCollectionResources,
  getResourceFieldData,
  getResourcePath,
} from '../../src/service/dam-api.service';

// --- Mock Client ---
const mockConnect = vi.fn();
const mockEnd = vi.fn();
const mockQuery = vi.fn();

const mockClient = {
  connect: mockConnect,
  end: mockEnd,
  query: mockQuery,
} as unknown as Client;

describe('ResourceImagesService', () => {
  let service: ResourceImagesService;

  beforeEach(() => {
    vi.clearAllMocks();
    (getClient as vi.Mock).mockReturnValue(mockClient);
    service = new ResourceImagesService();
  });

  it('should instantiate correctly', () => {
    expect(service).toBeInstanceOf(ResourceImagesService);
    expect(service.collectionRef).toBe('728');
  });

  it('should executeSyncSqlImages run query correctly', async () => {
    mockQuery.mockResolvedValueOnce({ rowCount: 1 });
    const data = { ref_id: '1' };
    const res = await (service as any).executeSyncSqlImages(mockClient, data);
    expect(mockQuery).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO rst.recreation_resource_images'),
      [JSON.stringify(data)],
    );
    expect(res).toEqual({ rowCount: 1 });
  });

  it('should executeSyncSqlImageVariants run query correctly', async () => {
    mockQuery.mockResolvedValueOnce({ rowCount: 1 });
    const data = { ref_id: '1', files: [] };
    const res = await (service as any).executeSyncSqlImageVariants(
      mockClient,
      data,
    );
    expect(mockQuery).toHaveBeenCalledWith(
      expect.stringContaining(
        'INSERT INTO rst.recreation_resource_image_variants',
      ),
      [JSON.stringify(data)],
    );
    expect(res).toEqual({ rowCount: 1 });
  });

  it('should deleteImages run query correctly', async () => {
    mockQuery.mockResolvedValueOnce({ rowCount: 1 });
    const data = ['1'];
    const res = await (service as any).deleteImages(mockClient, data);
    expect(mockQuery).toHaveBeenCalledWith(
      expect.stringContaining('DELETE FROM rst.recreation_resource_images'),
      [JSON.stringify(data)],
    );
    expect(res).toEqual({ rowCount: 1 });
  });

  it('should deleteImageVariants run query correctly', async () => {
    mockQuery.mockResolvedValueOnce({ rowCount: 1 });
    const data = ['1'];
    const res = await (service as any).deleteImageVariants(mockClient, data);
    expect(mockQuery).toHaveBeenCalledWith(
      expect.stringContaining(
        'DELETE FROM rst.recreation_resource_image_variants',
      ),
      [JSON.stringify(data)],
    );
    expect(res).toEqual({ rowCount: 1 });
  });

  it('should syncImagesCollection successfully', async () => {
    (getCollectionResources as vi.Mock).mockResolvedValue([
      { ref: '101' },
      { ref: '102' },
    ]);
    (getResourceFieldData as vi.Mock).mockImplementation(
      async (ref: string) => [
        { name: 'recreationname', value: `Test - REC${ref}` },
        { name: 'title', value: `Title ${ref}` },
      ],
    );
    (getResourcePath as vi.Mock).mockImplementation(async (ref: string) => [
      {
        size_code: 'original',
        url: `/filestore/${ref}/img.jpg`,
        extension: 'jpg',
        width: 100,
        height: 100,
      },
    ]);
    mockQuery.mockResolvedValue({ rowCount: 1 });

    const result = await service.syncImagesCollection();

    expect(result.statusCode).toBe(200);
    expect(JSON.parse(result.body).message).toBe('Data saved successfully');
    expect(getClient).toHaveBeenCalled();
    expect(mockConnect).toHaveBeenCalled();
    expect(mockEnd).toHaveBeenCalled();
    expect(mockQuery).toHaveBeenCalled();
  });

  it('should handle empty collection gracefully', async () => {
    (getCollectionResources as vi.Mock).mockResolvedValue([]);
    const result = await service.syncImagesCollection();
    expect(result.statusCode).toBe(200);
  });

  it('should handle db connect error', async () => {
    (getClient as vi.Mock).mockReturnValue({
      connect: vi.fn().mockRejectedValue(new Error('connection failed')),
      end: vi.fn(),
    });
    (getCollectionResources as vi.Mock).mockResolvedValue([]);

    const result = await service.syncImagesCollection();
    expect(result.statusCode).toBe(500);
    expect(JSON.parse(result.body).error).toBe('connection failed');
  });

  it('should continue after query failure for images', async () => {
    (getCollectionResources as vi.Mock).mockResolvedValue([{ ref: '103' }]);
    (getResourceFieldData as vi.Mock).mockResolvedValue([
      { name: 'recreationname', value: 'Rec - R123' },
      { name: 'title', value: 'Some Title' },
    ]);
    (getResourcePath as vi.Mock).mockResolvedValue([
      {
        size_code: 'original',
        url: '/filestore/103/img.jpg',
        extension: 'jpg',
      },
    ]);
    mockQuery
      .mockRejectedValueOnce(new Error('insert failed'))
      .mockResolvedValue({ rowCount: 1 });

    const result = await service.syncImagesCollection();
    expect(result.statusCode).toBe(200);
    expect(mockEnd).toHaveBeenCalled();
  });
});
