import { Prisma } from '@prisma/client';

/**
 * Helper function to handle create/update/delete for description fields.
 * Handles the common pattern: if undefined, skip; if null, delete; otherwise, upsert.
 *
 * @param tx - Prisma transaction client
 * @param tableName - The table model name
 * @param rec_resource_id - The resource ID to link to
 * @param description - The new description value (undefined = skip, null = delete, string = upsert)
 */
export async function upsertDescriptionField(
  tx: Prisma.TransactionClient,
  tableName: 'recreation_site_description' | 'recreation_driving_direction',
  rec_resource_id: string,
  description: string | null | undefined,
): Promise<void> {
  // Skip if not provided
  if (description === undefined) return;

  const table = tx[tableName] as any;

  if (description === null) {
    // Delete the record if null is explicitly provided
    await table.deleteMany({
      where: { rec_resource_id },
    });
  } else {
    // Check if record exists, then create or update
    const existingRecord = await table.findUnique({
      where: { rec_resource_id },
    });

    if (existingRecord) {
      await table.update({
        where: { rec_resource_id },
        data: { description },
      });
    } else {
      await table.create({
        data: {
          rec_resource_id,
          description,
        },
      });
    }
  }
}
