import { Prisma } from '@prisma/client';

type TableClient<TCreate, TUpdate> = {
  findUnique(args: { where: unknown }): Promise<unknown | null>;
  create(args: { data: TCreate }): Promise<unknown>;
  update(args: { where: unknown; data: TUpdate }): Promise<unknown>;
};

/**
 * Performs an upsert-like operation against a Prisma model using a transaction client.
 * This implements create-or-update by first checking for existence with
 * `findUnique` and then calling `create` or `update`. It avoids Prisma's
 * single-statement `upsert` which can be incompatible with features like
 * temporal tables.
 *
 * Example:
 *  await upsert({
 *    tx,
 *    tableName: 'recreation_status',
 *    where: { rec_resource_id },
 *    createData: { rec_resource_id, status_code },
 *    updateData: { status_code },
 *  });
 *
 * @param tx - Prisma transaction client
 * @param tableName - Model property name on the Prisma client (e.g. 'recreation_status')
 * @param where - Unique selector for findUnique/update
 * @param createData - Data to use for create
 * @param updateData - Data to use for update
 */
export async function upsert<TCreate, TUpdate>({
  tx,
  tableName,
  where,
  createData,
  updateData,
}: {
  tx: Prisma.TransactionClient;
  tableName: string;
  where: Record<string, unknown>;
  createData: TCreate;
  updateData: TUpdate;
}): Promise<void> {
  const clientMap = tx as unknown as Record<
    string,
    TableClient<TCreate, TUpdate>
  >;
  const table = clientMap[tableName];

  if (!table || typeof table.findUnique !== 'function') {
    throw new Error(`Table client not found on transaction: ${tableName}`);
  }

  const existing = await table.findUnique({ where });

  if (existing) {
    await table.update({ where, data: updateData });
  } else {
    await table.create({ data: createData });
  }
}
