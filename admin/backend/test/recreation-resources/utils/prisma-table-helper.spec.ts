import { Prisma } from '@prisma/client';
import { getTableClient } from '@/recreation-resources/utils/prisma-table-helper';
import { beforeEach, describe, expect, it, vi } from 'vitest';

describe('getTableClient', () => {
  let mockTx: Prisma.TransactionClient;

  beforeEach(() => {
    mockTx = {
      recreation_resource: {
        findUnique: vi.fn(),
        findMany: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
        deleteMany: vi.fn(),
        createMany: vi.fn(),
      },
      recreation_activity_code: {
        findMany: vi.fn(),
        findUnique: vi.fn(),
      },
    } as any;
  });

  it('should return table client when table exists', () => {
    const tableClient = getTableClient(mockTx, 'recreation_resource');

    expect(tableClient).toBeDefined();
    expect(tableClient).toBe(mockTx.recreation_resource);
    expect(tableClient.findUnique).toBeDefined();
    expect(tableClient.findMany).toBeDefined();
  });

  it('should return table client for different table names', () => {
    const activityTable = getTableClient(mockTx, 'recreation_activity_code');

    expect(activityTable).toBeDefined();
    expect(activityTable).toBe(mockTx.recreation_activity_code);
  });

  it('should throw error when table does not exist', () => {
    expect(() => {
      getTableClient(mockTx, 'nonexistent_table');
    }).toThrow('Table client not found on transaction: nonexistent_table');
  });

  it('should throw error with correct message format', () => {
    try {
      getTableClient(mockTx, 'invalid_table_name');
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
      expect((error as Error).message).toBe(
        'Table client not found on transaction: invalid_table_name',
      );
    }
  });

  it('should work with transaction client that has multiple tables', () => {
    const resourceTable = getTableClient(mockTx, 'recreation_resource');
    const activityTable = getTableClient(mockTx, 'recreation_activity_code');

    expect(resourceTable).not.toBe(activityTable);
    expect(resourceTable).toBe(mockTx.recreation_resource);
    expect(activityTable).toBe(mockTx.recreation_activity_code);
  });

  it('should handle table names with underscores', () => {
    const tableClient = getTableClient(mockTx, 'recreation_resource');

    expect(tableClient).toBeDefined();
  });

  it('should preserve table client methods', () => {
    const tableClient = getTableClient(mockTx, 'recreation_resource');

    expect(typeof tableClient.findUnique).toBe('function');
    expect(typeof tableClient.findMany).toBe('function');
    expect(typeof tableClient.create).toBe('function');
    expect(typeof tableClient.update).toBe('function');
    expect(typeof tableClient.delete).toBe('function');
  });
});
