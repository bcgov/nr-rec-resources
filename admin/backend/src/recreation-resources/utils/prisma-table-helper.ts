import { Prisma } from '@prisma/client';

export type TableClient = {
  findMany?(args: {
    where: unknown;
    select: unknown;
  }): Promise<Array<Record<string, unknown>>>;
  findUnique?(args: { where: unknown }): Promise<unknown>;
  deleteMany?(args: { where: unknown }): Promise<{ count: number }>;
  createMany?(args: {
    data: unknown[];
    skipDuplicates?: boolean;
  }): Promise<{ count: number }>;
  create?(args: { data: unknown }): Promise<unknown>;
  update?(args: { where: unknown; data: unknown }): Promise<unknown>;
};

/**
 * Gets a table client from a Prisma transaction, with error checking.
 */
export function getTableClient(
  tx: Prisma.TransactionClient,
  tableName: string,
): TableClient {
  const table = (tx as unknown as Record<string, TableClient>)[tableName];
  if (!table) {
    throw new Error(`Table client not found on transaction: ${tableName}`);
  }
  return table;
}
