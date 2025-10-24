import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ResourceDocsService } from '../../src/service/resource-docs.service';
import { Client } from 'pg';

// Mock the database service and dam-api service
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

// Mock Client instance
const mockConnect = vi.fn();
const mockEnd = vi.fn();
const mockQuery = vi.fn();

const mockClient = {
  connect: mockConnect,
  end: mockEnd,
  query: mockQuery,
} as unknown as Client;

describe('ResourceDocsService', () => {
  let service: ResourceDocsService;

  beforeEach(() => {
    vi.clearAllMocks();
    (getClient as vi.Mock).mockReturnValue(mockClient);
    service = new ResourceDocsService();
  });

  it('should instantiate correctly', () => {
    expect(service).toBeInstanceOf(ResourceDocsService);
    expect(service.collectionRef).toBe('739');
  });

  it('should executeSyncSqlDocs run a query with correct params', async () => {
    mockQuery.mockResolvedValueOnce({ rowCount: 1 });
    const data = { ref_id: '1' };
    const res = await (service as any).executeSyncSqlDocs(mockClient, data);
    expect(mockQuery).toHaveBeenCalledTimes(1);
    expect(mockQuery).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO rst.recreation_resource_docs'),
      [JSON.stringify(data)],
    );
    expect(res).toEqual({ rowCount: 1 });
  });

  it('should deleteDocs run a query with correct params', async () => {
    mockQuery.mockResolvedValueOnce({ rowCount: 1 });
    const data = ['123'];
    const res = await (service as any).deleteDocs(mockClient, data);
    expect(mockQuery).toHaveBeenCalledWith(
      expect.stringContaining('DELETE FROM rst.recreation_resource_docs'),
      [JSON.stringify(data)],
    );
    expect(res).toEqual({ rowCount: 1 });
  });

  it('should syncDocsCollection successfully', async () => {
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
        url: `/filestore/${ref}/file.jpg`,
        extension: 'jpg',
      },
    ]);

    mockQuery.mockResolvedValue({ rowCount: 1 });

    const result = await service.syncDocsCollection();

    expect(result.statusCode).toBe(200);
    expect(JSON.parse(result.body).message).toBe('Data saved successfully');
    expect(getClient).toHaveBeenCalled();
    expect(mockConnect).toHaveBeenCalled();
    expect(mockEnd).toHaveBeenCalled();
    expect(mockQuery).toHaveBeenCalled();
  });

  it('should handle empty collection gracefully', async () => {
    (getCollectionResources as vi.Mock).mockResolvedValue([]);
    const result = await service.syncDocsCollection();
    expect(result.statusCode).toBe(200);
  });

  it('should return 500 if db connect fails', async () => {
    (getClient as vi.Mock).mockReturnValue({
      connect: vi.fn().mockRejectedValueOnce(new Error('connect error')),
      end: vi.fn(),
    });
    (getCollectionResources as vi.Mock).mockResolvedValue([]);

    const result = await service.syncDocsCollection();
    expect(result.statusCode).toBe(500);
    expect(JSON.parse(result.body).error).toBe('connect error');
  });

  it('should still end db connection if error occurs during query', async () => {
    (getCollectionResources as vi.Mock).mockResolvedValue([{ ref: '103' }]);
    (getResourceFieldData as vi.Mock).mockResolvedValue([
      { name: 'recreationname', value: 'Name - RECX' },
      { name: 'title', value: 'Some title' },
    ]);
    (getResourcePath as vi.Mock).mockResolvedValue([
      {
        size_code: 'original',
        url: '/filestore/103/file.jpg',
        extension: 'jpg',
      },
    ]);
    mockQuery.mockRejectedValueOnce(new Error('query error'));
    const result = await service.syncDocsCollection();
    expect(result.statusCode).toBe(200); // still succeeds (errors caught internally)
    expect(mockEnd).toHaveBeenCalled();
  });
});
