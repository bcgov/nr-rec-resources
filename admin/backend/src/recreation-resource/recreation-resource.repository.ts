import { Injectable } from "@nestjs/common";
import { PrismaService } from "@/prisma.service";
import { getRecreationResourceSuggestions } from "@/prisma-generated-sql";

/**
 * Repository for querying recreation resource data.
 */
@Injectable()
export class RecreationResourceRepository {
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
}
