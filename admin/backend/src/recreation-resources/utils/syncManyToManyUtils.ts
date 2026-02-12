/**
 * Utilities for syncing many-to-many relationships with optimized upsert-style updates.
 * Uses batch insert-ignore and single NOT IN delete operations for efficiency.
 * Minimizes history table entries for temporal tables by only deleting removed items
 * and creating new ones, leaving unchanged items untouched.
 */
import { Prisma } from '@generated/prisma';
import { getTableClient, type TableClient } from './prisma-table-helper';

/**
 * Base configuration shared by all sync functions.
 */
interface BaseSyncConfig<TKey, TData> {
  /** Prisma transaction client - all operations use this for atomicity */
  tx: Prisma.TransactionClient;
  /** Model property name on the Prisma client */
  tableName: string;
  /** Where clause to find existing records */
  where: Record<string, unknown>;
  /** Array of new keys to sync to */
  newKeys: TKey[];
  /** Function to create data object for new records */
  createData: (key: TKey) => TData;
}

/**
 * Configuration for the core optimized sync function.
 */
interface SyncOperationConfig<TKey, TData> extends BaseSyncConfig<TKey, TData> {
  /** Pre-built where clause for deleting records that are NOT in the new set */
  deleteClause: Record<string, unknown>;
}

/**
 * Core optimized sync function that handles upsert-style updates for many-to-many relationships.
 * Uses batch createMany with skipDuplicates and a single deleteMany operation.
 * Only deletes removed items and creates new ones, leaving unchanged items untouched.
 */
async function executeSyncOperation<TKey, TData>({
  tx,
  tableName,
  deleteClause,
  newKeys,
  createData,
}: SyncOperationConfig<TKey, TData>): Promise<void> {
  const table = getTableClient(tx, tableName) as TableClient;
  if (!table.deleteMany || !table.createMany) {
    throw new Error(
      `Table client missing required methods on transaction: ${tableName}`,
    );
  }

  const promises: Promise<unknown>[] = [];

  // 1. Delete all records that are NOT in the new set of keys
  promises.push(
    table.deleteMany({
      where: deleteClause,
    }),
  );

  // 2. Create all records in the new set
  // skipDuplicates: true ensures we don't fail on existing records
  if (newKeys.length > 0) {
    promises.push(
      table.createMany({
        data: newKeys.map(createData),
        skipDuplicates: true,
      }),
    );
  }

  await Promise.all(promises);
}

/**
 * Syncs a many-to-many relationship with a simple (single-field) key.
 * Only deletes removed items and creates new ones, leaving unchanged items untouched.
 *
 * Approach: Uses deleteMany (with NOT IN clause) + createMany (with skipDuplicates).
 * Both operations involve implicit reads for finding/checking records.
 *
 * @param keyField - Field name that contains the key/id to compare
 */
export async function syncManyToMany<TKey, TData>({
  tx,
  tableName,
  where,
  keyField,
  newKeys,
  createData,
}: BaseSyncConfig<TKey, TData> & {
  /** Field name that contains the key/id to compare */
  keyField: string;
}): Promise<void> {
  // Deduplicate newKeys to avoid sending duplicate data to the database
  const uniqueNewKeys = Array.from(new Set(newKeys));

  // Build delete clause: Delete everything matching 'where' AND NOT in newKeys
  const deleteClause = { ...where, [keyField]: { notIn: uniqueNewKeys } };

  return executeSyncOperation({
    tx,
    tableName,
    where,
    newKeys: uniqueNewKeys,
    createData,
    deleteClause,
  });
}

/**
 * Syncs a many-to-many relationship with composite keys (multiple fields).
 * Only deletes removed items and creates new ones, leaving unchanged items untouched.
 */
export async function syncManyToManyComposite<
  TKey extends Record<string, unknown>,
  TData,
>({
  tx,
  tableName,
  where,
  newKeys,
  createData,
}: BaseSyncConfig<TKey, TData> & {
  // Legacy parameters kept for compatibility but unused
  keyFields?: string[];
  extractKey?: unknown;
  createDeleteWhere?: unknown;
}): Promise<void> {
  // Deduplicate newKeys
  const uniqueNewKeys = Array.from(
    new Set(newKeys.map((k) => JSON.stringify(k))),
  ).map((s) => JSON.parse(s) as TKey);

  // Build delete clause: Delete everything matching 'where' EXCEPT the new keys
  // If newKeys is empty, we delete everything.
  const deleteClause =
    uniqueNewKeys.length === 0
      ? where
      : {
          ...where,
          NOT: {
            OR: uniqueNewKeys,
          },
        };

  return executeSyncOperation({
    tx,
    tableName,
    where,
    newKeys: uniqueNewKeys,
    createData,
    deleteClause,
  });
}
