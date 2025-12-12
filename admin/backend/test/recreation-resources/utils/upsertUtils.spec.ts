import { beforeEach, describe, expect, it, vi } from 'vitest';
import { upsert } from '@/recreation-resources/utils/upsertUtils';

describe('upsert', () => {
  let tx: Record<string, any>;

  beforeEach(() => {
    tx = {};
  });

  it('creates when no existing record is found', async () => {
    const findUnique = vi.fn().mockResolvedValue(null);
    const create = vi.fn().mockResolvedValue({ id: '1', foo: 'bar' });
    const update = vi.fn().mockResolvedValue({});

    tx['test_table'] = { findUnique, create, update };

    const where = { id: '1' };
    const createData = { id: '1', foo: 'bar' };
    const updateData = { foo: 'baz' };

    await upsert({
      tx: tx as any,
      tableName: 'test_table',
      where,
      createData,
      updateData,
    });

    expect(findUnique).toHaveBeenCalledWith({ where });
    expect(create).toHaveBeenCalledWith({ data: createData });
    expect(update).not.toHaveBeenCalled();
  });

  it('updates when an existing record is found', async () => {
    const findUnique = vi.fn().mockResolvedValue({ id: '1', foo: 'old' });
    const create = vi.fn().mockResolvedValue({});
    const update = vi.fn().mockResolvedValue({ id: '1', foo: 'new' });

    tx['test_table'] = { findUnique, create, update };

    const where = { id: '1' };
    const createData = { id: '1', foo: 'new' };
    const updateData = { foo: 'new' };

    await upsert({
      tx: tx as any,
      tableName: 'test_table',
      where,
      createData,
      updateData,
    });

    expect(findUnique).toHaveBeenCalledWith({ where });
    expect(update).toHaveBeenCalledWith({ where, data: updateData });
    expect(create).not.toHaveBeenCalled();
  });

  it('throws when the specified table client does not exist on the transaction', async () => {
    await expect(
      upsert({
        tx: tx as any,
        tableName: 'missing_table',
        where: { id: '1' },
        createData: {},
        updateData: {},
      }),
    ).rejects.toThrow('Table client not found on transaction: missing_table');
  });

  it('throws when the specified table exists but lacks findUnique function', async () => {
    tx['bad_table'] = { create: vi.fn(), update: vi.fn() } as any;
    await expect(
      upsert({
        tx: tx as any,
        tableName: 'bad_table',
        where: { id: '1' },
        createData: {},
        updateData: {},
      }),
    ).rejects.toThrow(
      'Table client missing required methods on transaction: bad_table',
    );
  });
});
