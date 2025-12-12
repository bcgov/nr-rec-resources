import {
  syncManyToMany,
  syncManyToManyComposite,
} from '@/recreation-resources/utils/syncManyToManyUtils';
import { Prisma } from '@prisma/client';
import { beforeEach, describe, expect, it, vi } from 'vitest';

describe('syncManyToMany', () => {
  let mockTx: Prisma.TransactionClient;
  let mockTable: any;

  beforeEach(() => {
    mockTable = {
      findMany: vi.fn(),
      deleteMany: vi.fn(),
      createMany: vi.fn(),
    };

    mockTx = {
      recreation_activity: mockTable,
    } as unknown as Prisma.TransactionClient;
  });

  it('should delete removed items and create new ones', async () => {
    const newKeys = [2, 3, 4]; // Remove 1, add 4, keep 2 and 3

    mockTable.deleteMany.mockResolvedValue({ count: 1 });
    mockTable.createMany.mockResolvedValue({ count: 1 });

    await syncManyToMany({
      tx: mockTx,
      tableName: 'recreation_activity',
      where: { rec_resource_id: 'REC0001' },
      keyField: 'recreation_activity_code',
      newKeys,
      createData: (code) => ({
        rec_resource_id: 'REC0001',
        recreation_activity_code: code,
      }),
    });

    expect(mockTable.findMany).not.toHaveBeenCalled();
    expect(mockTable.deleteMany).toHaveBeenCalledWith({
      where: {
        rec_resource_id: 'REC0001',
        recreation_activity_code: { notIn: [2, 3, 4] },
      },
    });
    expect(mockTable.createMany).toHaveBeenCalledWith({
      data: [
        { rec_resource_id: 'REC0001', recreation_activity_code: 2 },
        { rec_resource_id: 'REC0001', recreation_activity_code: 3 },
        { rec_resource_id: 'REC0001', recreation_activity_code: 4 },
      ],
      skipDuplicates: true,
    });
  });

  it('should attempt delete and create even when no changes (idempotent)', async () => {
    const newKeys = [1, 2]; // Same as existing

    await syncManyToMany({
      tx: mockTx,
      tableName: 'recreation_activity',
      where: { rec_resource_id: 'REC0001' },
      keyField: 'recreation_activity_code',
      newKeys,
      createData: (code) => ({
        rec_resource_id: 'REC0001',
        recreation_activity_code: code,
      }),
    });

    expect(mockTable.deleteMany).toHaveBeenCalledWith({
      where: {
        rec_resource_id: 'REC0001',
        recreation_activity_code: { notIn: [1, 2] },
      },
    });
    expect(mockTable.createMany).toHaveBeenCalledWith({
      data: [
        { rec_resource_id: 'REC0001', recreation_activity_code: 1 },
        { rec_resource_id: 'REC0001', recreation_activity_code: 2 },
      ],
      skipDuplicates: true,
    });
  });

  it('should create all when starting from empty', async () => {
    const newKeys = [1, 2, 3];

    mockTable.createMany.mockResolvedValue({ count: 3 });

    await syncManyToMany({
      tx: mockTx,
      tableName: 'recreation_activity',
      where: { rec_resource_id: 'REC0001' },
      keyField: 'recreation_activity_code',
      newKeys,
      createData: (code) => ({
        rec_resource_id: 'REC0001',
        recreation_activity_code: code,
      }),
    });

    expect(mockTable.deleteMany).toHaveBeenCalledWith({
      where: {
        rec_resource_id: 'REC0001',
        recreation_activity_code: { notIn: [1, 2, 3] },
      },
    });
    expect(mockTable.createMany).toHaveBeenCalledWith({
      data: [
        { rec_resource_id: 'REC0001', recreation_activity_code: 1 },
        { rec_resource_id: 'REC0001', recreation_activity_code: 2 },
        { rec_resource_id: 'REC0001', recreation_activity_code: 3 },
      ],
      skipDuplicates: true,
    });
  });

  it('should delete all when removing all items', async () => {
    const newKeys: number[] = [];

    mockTable.deleteMany.mockResolvedValue({ count: 2 });

    await syncManyToMany({
      tx: mockTx,
      tableName: 'recreation_activity',
      where: { rec_resource_id: 'REC0001' },
      keyField: 'recreation_activity_code',
      newKeys,
      createData: (code) => ({
        rec_resource_id: 'REC0001',
        recreation_activity_code: code,
      }),
    });

    expect(mockTable.deleteMany).toHaveBeenCalledWith({
      where: {
        rec_resource_id: 'REC0001',
        recreation_activity_code: { notIn: [] },
      },
    });
    expect(mockTable.createMany).not.toHaveBeenCalled();
  });

  it('should throw error when table not found', async () => {
    const invalidTx = {} as Prisma.TransactionClient;

    await expect(
      syncManyToMany({
        tx: invalidTx,
        tableName: 'nonexistent_table',
        where: { rec_resource_id: 'REC0001' },
        keyField: 'recreation_activity_code',
        newKeys: [1, 2],
        createData: (code) => ({
          rec_resource_id: 'REC0001',
          recreation_activity_code: code,
        }),
      }),
    ).rejects.toThrow(
      'Table client not found on transaction: nonexistent_table',
    );
  });

  it('should handle duplicate keys in newKeys array', async () => {
    const newKeys = [1, 2, 2, 3]; // Duplicate 2

    mockTable.createMany.mockResolvedValue({ count: 3 });

    await syncManyToMany({
      tx: mockTx,
      tableName: 'recreation_activity',
      where: { rec_resource_id: 'REC0001' },
      keyField: 'recreation_activity_code',
      newKeys,
      createData: (code) => ({
        rec_resource_id: 'REC0001',
        recreation_activity_code: code,
      }),
    });

    // Should deduplicate and create 1, 2, 3
    expect(mockTable.createMany).toHaveBeenCalledWith({
      data: [
        { rec_resource_id: 'REC0001', recreation_activity_code: 1 },
        { rec_resource_id: 'REC0001', recreation_activity_code: 2 },
        { rec_resource_id: 'REC0001', recreation_activity_code: 3 },
      ],
      skipDuplicates: true,
    });
  });
});

describe('syncManyToManyComposite', () => {
  it('should delete old relations and create new ones using composite keys', async () => {
    const model = {
      deleteMany: vi.fn(),
      createMany: vi.fn(),
    };
    const prisma = {
      model,
    } as any;

    const parentId = 'parent-1';
    const newData = [
      { parentId: 'parent-1', childId: 'child-1' },
      { parentId: 'parent-1', childId: 'child-2' },
    ];

    await syncManyToManyComposite({
      tx: prisma,
      tableName: 'model',
      where: { parentId },
      newKeys: newData,
      createData: (data) => data,
    });

    expect(model.deleteMany).toHaveBeenCalledWith({
      where: {
        parentId: parentId,
        NOT: {
          OR: [
            { parentId: 'parent-1', childId: 'child-1' },
            { parentId: 'parent-1', childId: 'child-2' },
          ],
        },
      },
    });
    expect(model.createMany).toHaveBeenCalledWith({
      data: newData,
      skipDuplicates: true,
    });
  });

  it('should handle empty new data (delete all)', async () => {
    const model = {
      deleteMany: vi.fn(),
      createMany: vi.fn(),
    };
    const prisma = {
      model,
    } as any;

    const parentId = 'parent-1';
    const newData: any[] = [];

    await syncManyToManyComposite({
      tx: prisma,
      tableName: 'model',
      where: { parentId },
      newKeys: newData,
      createData: (data) => data,
    });

    expect(model.deleteMany).toHaveBeenCalledWith({
      where: {
        parentId: parentId,
      },
    });
    expect(model.createMany).not.toHaveBeenCalled();
  });
});
