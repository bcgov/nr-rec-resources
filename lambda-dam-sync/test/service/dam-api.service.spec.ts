import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import {
  getCollectionResources,
  getResourceFieldData,
  getResourcePath,
} from '../../src/service/dam-api.service';

// Mock LoggerService
class MockLoggerService {
  log = vi.fn();
  debug = vi.fn();
  error = vi.fn();
}
vi.mock('./logger-service', () => ({
  LoggerService: MockLoggerService,
}));

// Mock dependencies
vi.mock('axios');
vi.mock('crypto', async () => {
  const actual = await vi.importActual<typeof import('crypto')>('crypto');
  return {
    ...actual,
    createHash: vi.fn(() => ({
      update: vi.fn().mockReturnThis(),
      digest: vi.fn().mockReturnValue('mocked-hash'),
    })),
    randomBytes: vi.fn(() => Buffer.from('abcdef123456', 'hex')),
  };
});
// vi.mock('form-data', () => {
//   const { EventEmitter } = require('events');
//   class MockFormData extends EventEmitter {
//     data: Record<string, any> = {};
//     append(key: string, value: any) {
//       this.data[key] = value;
//     }
//     getHeaders() {
//       return { 'content-type': 'mocked-form-data' };
//     }
//     resume() {
//       // simulate emitting data and ending
//       setTimeout(() => this.emit('data', Buffer.from('chunk')), 1);
//       setTimeout(() => this.emit('end'), 5);
//     }
//   }
//   return { default: MockFormData };
// });

describe('dam-service', () => {
  let mockResponse: any;

  beforeEach(() => {
    vi.clearAllMocks();
    mockResponse = { status: 200, data: { success: true } };
    (axios.post as unknown as any).mockResolvedValue(mockResponse);
  });

  it('getCollectionResources should call executeRequest with correct params', async () => {
    const result = await getCollectionResources('123');
    expect(result).toEqual({ success: true });
    expect(axios.post).toHaveBeenCalledTimes(1);
  });

  it('getResourceFieldData should call executeRequest with correct params', async () => {
    const result = await getResourceFieldData('R123');
    expect(result).toEqual({ success: true });
    expect(axios.post).toHaveBeenCalledTimes(1);
  });

  it('getResourcePath should call executeRequest with correct params', async () => {
    const result = await getResourcePath('RES001');
    expect(result).toEqual({ success: true });
    expect(axios.post).toHaveBeenCalledTimes(1);
  });

  it('executeRequest should handle request success correctly', async () => {
    const { getCollectionResources } = await import(
      '../../src/service/dam-api.service'
    );
    const res = await getCollectionResources('456');
    expect(res).toEqual({ success: true });
  });

  it('executeRequest should handle request failure correctly', async () => {
    (axios.post as any).mockRejectedValueOnce(new Error('Network error'));
    const { getResourcePath } = await import(
      '../../src/service/dam-api.service'
    );
    const res = await getResourcePath('FAIL_TEST');
    expect(res).toBeNull();
  });

  it('sign function should produce a sha256 hash (via createHash mock)', async () => {
    const { getCollectionResources } = await import(
      '../../src/service/dam-api.service'
    );
    await getCollectionResources('789');
    const { createHash } = await import('crypto');
    expect(createHash).toHaveBeenCalledWith('sha256');
  });
});
