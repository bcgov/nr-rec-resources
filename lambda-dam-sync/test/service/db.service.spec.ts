import { describe, it, expect, vi } from 'vitest';
import { getClient } from '../../src/service/db.service';
import { Client } from 'pg';

// Mock the pg module
vi.mock('pg', () => {
  return {
    Client: vi.fn(),
  };
});

describe('getClient', () => {
  it('should create and return a new pg Client with correct config', () => {
    const mockClientInstance = { connect: vi.fn() };
    (Client as unknown as any).mockImplementation(() => mockClientInstance);

    const client = getClient();

    // Ensure Client was instantiated once
    expect(Client).toHaveBeenCalledTimes(1);

    // Ensure it was called with the right parameters
    expect(Client).toHaveBeenCalledWith({
      host: 'localhost',
      user: 'root',
      password: 'password',
      database: 'rec',
      port: 5432,
    });

    // Ensure the returned client is what Client constructor returned
    expect(client).toBe(mockClientInstance);
  });
});
