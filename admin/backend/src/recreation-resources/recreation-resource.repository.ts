import { getRecreationResourceSuggestions } from '@/prisma-generated-sql';
import { PrismaService } from '@/prisma.service';
import { Injectable, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { UpdateRecreationResourceDto } from './dtos/update-recreation-resource.dto';
import { recreationResourceSelect } from './recreation-resource.select';
import { RecreationResourceGetPayload } from './recreation-resource.types';
import { syncManyToManyComposite } from './utils/syncManyToManyUtils';
import { upsert } from './utils/upsertUtils';

/**
 * Repository for querying recreation resource data.
 */
@Injectable()
export class RecreationResourceRepository {
  private readonly logger = new Logger(RecreationResourceRepository.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Finds recreation resource suggestions matching the search term.
   * Uses a type-safe raw SQL query via Prisma's typedSql feature.
   *
   * @param searchTerm - Alphanumeric search term (min 3 characters)
   * @returns Object containing total count and array of matching resources
   */
  async findSuggestions(searchTerm: string): Promise<{
    total: number;
    data: getRecreationResourceSuggestions.Result[];
  }> {
    const data = await this.prisma.$queryRawTyped(
      getRecreationResourceSuggestions(searchTerm),
    );
    return { total: data.length, data };
  }

  /**
   * Finds a recreation resource by its ID.
   * @param rec_resource_id - The resource ID
   * @returns The resource detail or null if not found
   */
  async findOneById(
    rec_resource_id: string,
  ): Promise<RecreationResourceGetPayload | null> {
    return this.prisma.recreation_resource.findUnique({
      where: { rec_resource_id },
      select: recreationResourceSelect,
    });
  }

  /**
   * Updates a recreation resource by its ID.
   * Handles both direct fields and related table updates intelligently.
   * Only updates fields that are provided (partial update semantics).
   * @param rec_resource_id - The resource ID
   * @param updateData - The partial data to update
   * @returns The updated resource detail
   * @throws Prisma.PrismaClientKnownRequestError - P2025 if record not found, P2002 for unique constraint, P2003 for FK constraint
   * @throws Prisma.PrismaClientValidationError - for invalid data
   */
  async update(
    rec_resource_id: string,
    updateData: UpdateRecreationResourceDto,
  ): Promise<RecreationResourceGetPayload> {
    try {
      // Use transaction to ensure data consistency
      const result = await this.prisma.$transaction(async (tx) => {
        const {
          access_codes: accessCodes,
          control_access_code,
          driving_directions,
          status_code,
          site_description,
          ...directFields
        } = updateData;

        if (status_code !== undefined) {
          await upsert({
            tx,
            tableName: 'recreation_status',
            where: { rec_resource_id },
            createData: {
              rec_resource_id,
              status_code,
              // Comment field required for creation
              comment: `${status_code === 1 ? 'Open' : 'Closed'} status`,
            },
            updateData: { status_code },
          });
        }

        // Build update data for main resource - only include provided fields
        const mainResourceUpdateData: Record<string, any> = {};

        // Add direct fields if provided
        Object.entries(directFields).forEach(([key, value]) => {
          if (value !== undefined) {
            mainResourceUpdateData[key] = value;
          }
        });

        // Handle control_access_code if provided
        if (control_access_code !== undefined) {
          mainResourceUpdateData.control_access_code =
            control_access_code || null;
        }

        // Only update main resource if there are fields to update
        if (Object.keys(mainResourceUpdateData).length > 0) {
          await tx.recreation_resource.update({
            where: { rec_resource_id },
            data: mainResourceUpdateData as Prisma.recreation_resourceUpdateInput,
          });
        }

        // Handle recreation_access updates if accessCodes is provided
        if (accessCodes) {
          const newAccessKeys = accessCodes.flatMap(
            ({ access_code, sub_access_codes }) =>
              (sub_access_codes?.length ? sub_access_codes : [null]).map(
                (sub_access_code) => ({ access_code, sub_access_code }),
              ),
          );

          await syncManyToManyComposite({
            tx,
            tableName: 'recreation_access',
            where: { rec_resource_id },
            newKeys: newAccessKeys,
            createData: (key) => ({ rec_resource_id, ...key }),
          });
        }

        if (site_description !== undefined) {
          await upsert({
            tx,
            tableName: 'recreation_site_description',
            where: { rec_resource_id },
            createData: { rec_resource_id, description: site_description },
            updateData: { description: site_description },
          });
        }

        if (driving_directions !== undefined) {
          await upsert({
            tx,
            tableName: 'recreation_driving_direction',
            where: { rec_resource_id },
            createData: { rec_resource_id, description: driving_directions },
            updateData: { description: driving_directions },
          });
        }

        // Fetch the complete updated resource
        const updatedResource = await tx.recreation_resource.findUnique({
          where: { rec_resource_id },
          select: recreationResourceSelect,
        });

        if (!updatedResource) {
          throw new Error('Resource not found after update');
        }

        return updatedResource;
      });

      return result;
    } catch (error) {
      // Log the error for debugging
      this.logger.error(
        `Failed to update recreation resource ${rec_resource_id}`,
        error instanceof Error ? error.stack : String(error),
      );

      throw error;
    }
  }
}
